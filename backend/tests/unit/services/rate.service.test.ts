/// <reference types="vitest" />
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateService } from '../../../src/services/rate.service.js';
import * as BookActionModule from '../../../src/services/book-action.service.js';
import Rate from '../../../src/models/Rate.js';
import Book from '../../../src/models/Book.js';
import User from '../../../src/models/User.js';

vi.mock('../../../src/models/Rate.js', () => ({
  default: { findOne: vi.fn(), create: vi.fn(), findAndCountAll: vi.fn() }
}));
vi.mock('../../../src/models/Book.js', () => ({
  default: { findByPk: vi.fn() }
}));
vi.mock('../../../src/models/User.js', () => ({
  default: { }
}));

describe('RateService', () => {
  const service = new RateService();
  const userId = 42;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createRate success', async () => {
    (Book.findByPk as any).mockResolvedValue({ id_book: 10 });
    (Rate.findOne as any).mockResolvedValue(null);
    const created = { id_rate: 1, id_book: 10, rating: 5, id_user: userId };
    (Rate.create as any).mockResolvedValue(created);
    const { rate, error } = await service.createRate({ id_book: 10, rating: 5 }, userId);
    expect(error).toBeUndefined();
    expect(rate).toEqual(created);
  });

  it('createRate book not found', async () => {
    (Book.findByPk as any).mockResolvedValue(null);
    const { error } = await service.createRate({ id_book: 999, rating: 3 }, userId);
    expect(error?.code).toBe(404);
  });

  it('createRate conflict', async () => {
    (Book.findByPk as any).mockResolvedValue({ id_book: 10 });
    (Rate.findOne as any).mockResolvedValue({ id_rate: 5 });
    const { error } = await service.createRate({ id_book: 10, rating: 4 }, userId);
    expect(error?.code).toBe(409);
  });

  it('listRates builds pagination', async () => {
    (Rate.findAndCountAll as any).mockResolvedValue({ rows: [], count: 0 });
    const { rates, pagination } = await service.listRates({ page: 1, limit: 10 } as any);
    expect(rates).toEqual([]);
    expect(pagination.total).toBe(0);
  });

  it('createRate triggers lazy import when open_library_key provided', async () => {
    // Pas d'id_book fourni, on mock prepareBookForAction pour retourner un livre créé (avec update)
    const prepResult = { wasImported: true, book: { id_book: 77, import_status: 'temporary', update: vi.fn(async function(this: any, data: any){ Object.assign(this, data); }) } } as any;
    const spy = vi.spyOn(BookActionModule.BookActionService.prototype, 'prepareBookForAction').mockResolvedValue(prepResult);
    (Rate.findOne as any).mockResolvedValue(null);
    (Rate.create as any).mockResolvedValue({ id_rate: 9, id_book: 77, rating: 4, id_user: userId });
    const { rate, error } = await service.createRate({ open_library_key: '/works/OL12345W', rating: 4 } as any, userId);
    expect(error).toBeUndefined();
    expect(rate?.id_book).toBe(77);
    expect(spy).toHaveBeenCalledWith('/works/OL12345W', userId, 'add_rate');
    expect(prepResult.book.update).toHaveBeenCalledWith({ import_status: 'confirmed', imported_reason: 'library' });
  });
});
