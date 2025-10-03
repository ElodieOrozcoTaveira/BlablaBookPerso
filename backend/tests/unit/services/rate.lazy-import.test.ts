import { describe, it, expect, vi, beforeEach } from 'vitest';

const hoisted = vi.hoisted(() => ({
  prepareMock: vi.fn(),
  bookFindByPk: vi.fn(),
  rateFindOne: vi.fn(),
  rateCreate: vi.fn()
}));
const { prepareMock, bookFindByPk, rateFindOne, rateCreate } = hoisted;

vi.mock('../../../src/services/book-action.service.js', () => ({
  BookActionService: vi.fn().mockImplementation(() => ({
    prepareBookForAction: hoisted.prepareMock
  }))
}));

vi.mock('../../../src/models/Book.js', () => ({
  default: { findByPk: hoisted.bookFindByPk }
}));

vi.mock('../../../src/models/Rate.js', () => ({
  default: { findOne: hoisted.rateFindOne, create: hoisted.rateCreate }
}));

import { RateService } from '../../../src/services/rate.service.js';

describe('RateService lazy import (open_library_key)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('importe et confirme si import_status=temporary', async () => {
    const updateMock = vi.fn();
    prepareMock.mockResolvedValue({
      book: { id_book: 99, import_status: 'temporary', update: updateMock },
      wasImported: true,
      canRollback: true
    });
    bookFindByPk.mockResolvedValue({ id_book: 99 });
    rateFindOne.mockResolvedValue(null);
    rateCreate.mockResolvedValue({ id_rate: 5, id_book: 99, rating: 4 });

    const svc = new RateService();
    const result = await svc.createRate({ open_library_key: '/works/OLABCD', rating: 4 }, 12);
    expect(prepareMock).toHaveBeenCalledWith('/works/OLABCD', 12, 'add_rate');
    expect(updateMock).toHaveBeenCalledWith({ import_status: 'confirmed', imported_reason: 'library' });
    expect(result.rate).toBeDefined();
  });

  it('ne confirme pas si déjà confirmé', async () => {
    const updateMock = vi.fn();
    prepareMock.mockResolvedValue({ book: { id_book: 12, import_status: 'confirmed', update: updateMock }, wasImported: false, canRollback: false });
    bookFindByPk.mockResolvedValue({ id_book: 12 });
    rateFindOne.mockResolvedValue(null);
    rateCreate.mockResolvedValue({ id_rate: 6, id_book: 12, rating: 5 });
    const svc = new RateService();
    const result = await svc.createRate({ open_library_key: '/works/OLZ', rating: 5 }, 2);
    expect(updateMock).not.toHaveBeenCalled();
    expect(result.rate).toBeDefined();
  });

  it('conflit si rate existe déjà', async () => {
    const updateMock = vi.fn();
    prepareMock.mockResolvedValue({ book: { id_book: 13, import_status: 'confirmed', update: updateMock }, wasImported: false, canRollback: false });
    bookFindByPk.mockResolvedValue({ id_book: 13 });
    rateFindOne.mockResolvedValue({ id_rate: 1 });
    const svc = new RateService();
    const res = await svc.createRate({ open_library_key: '/works/EXIST', rating: 3 }, 7);
    expect(res.error).toBeDefined();
    expect(res.error?.code).toBe(409);
  });

  it('erreur OPENLIB_IMPORT_FAILED si prepare échoue', async () => {
    prepareMock.mockRejectedValue(new Error('boom'));
    const svc = new RateService();
    await expect(svc.createRate({ open_library_key: '/works/FAIL', rating: 1 }, 1))
      .rejects.toThrow(/OPENLIB_IMPORT_FAILED/);
  });

  it('n appelle pas prepare si id_book fourni', async () => {
    bookFindByPk.mockResolvedValue({ id_book: 21 });
    rateFindOne.mockResolvedValue(null);
    rateCreate.mockResolvedValue({ id_rate: 7, id_book: 21, rating: 2 });
    const svc = new RateService();
    const result = await svc.createRate({ id_book: 21, rating: 2 }, 3);
    expect(prepareMock).not.toHaveBeenCalled();
    expect(result.rate).toBeDefined();
  });
});
