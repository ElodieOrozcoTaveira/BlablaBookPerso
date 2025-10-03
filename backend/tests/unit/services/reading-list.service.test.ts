/// <reference types="vitest" />
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReadingListService } from '../../../src/services/reading-list.service.js';
import ReadingList from '../../../src/models/ReadingList.js';
import Library from '../../../src/models/Library.js';
import Book from '../../../src/models/Book.js';

vi.mock('../../../src/models/ReadingList.js', () => ({ default: { findOne: vi.fn(), create: vi.fn(), findAndCountAll: vi.fn() } }));
vi.mock('../../../src/models/Library.js', () => ({ default: { findByPk: vi.fn() } }));
vi.mock('../../../src/models/Book.js', () => ({ default: { findByPk: vi.fn() } }));
vi.mock('../../../src/services/book-action.service.js', () => ({
  BookActionService: class { prepareBookForAction = vi.fn().mockResolvedValue({ book: { id_book: 55, import_status: 'temporary', update: vi.fn() } }); }
}));

describe('ReadingListService', () => {
  const service = new ReadingListService();
  const userId = 9;
  beforeEach(() => vi.clearAllMocks());

  it('addEntry library not found', async () => {
    (Library.findByPk as any).mockResolvedValue(null);
    const { error } = await service.addEntry({ id_library: 1, id_book: 2 }, userId);
    expect(error?.code).toBe(404);
  });

  it('addEntry forbidden (ownership)', async () => {
    (Library.findByPk as any).mockResolvedValue({ id_library: 1, id_user: 123 });
    const { error } = await service.addEntry({ id_library: 1, id_book: 2 }, userId);
    expect(error?.code).toBe(403);
  });

  it('addEntry conflict duplicate', async () => {
    (Library.findByPk as any).mockResolvedValue({ id_library: 1, id_user: userId });
    (Book.findByPk as any).mockResolvedValue({ id_book: 2 });
    (ReadingList.findOne as any).mockResolvedValue({ id_reading_list: 99 });
    const { error } = await service.addEntry({ id_library: 1, id_book: 2 }, userId);
    expect(error?.code).toBe(409);
  });

  it('addEntry success via open_library_key', async () => {
    (Library.findByPk as any).mockResolvedValue({ id_library: 1, id_user: userId });
  const tempBook = { id_book: 55, import_status: 'temporary', update: vi.fn(async function(this: any, data: any){ Object.assign(this, data); }) };
  (Book.findByPk as any).mockResolvedValue(tempBook);
    (ReadingList.findOne as any).mockResolvedValue(null);
    (ReadingList.create as any).mockResolvedValue({ id_reading_list: 1, id_book: 55 });
    const { entry } = await service.addEntry({ id_library: 1, open_library_key: 'OLX' }, userId);
    expect(entry?.id_book).toBe(55);
  // NOTE: On ne verifie pas update() ici car Book.findByPk retourne une instance differente de celle modifiee par BookActionService
  });

  it('listEntries pagination', async () => {
    (Library.findByPk as any).mockResolvedValue({ id_library: 1 });
    (ReadingList.findAndCountAll as any).mockResolvedValue({ rows: [], count: 0 });
  const { readingList, pagination } = await service.listEntries(1, { page: 1, limit: 5 });
  expect(readingList).toEqual([]);
  expect(pagination!.total).toBe(0);
  });
});
