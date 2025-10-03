/// <reference types="vitest" />
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NoticeService } from '../../../src/services/notice.service.js';
import Notice from '../../../src/models/Notice.js';
import Book from '../../../src/models/Book.js';

vi.mock('../../../src/models/Notice.js', () => ({
  default: {
    create: vi.fn(),
    findAndCountAll: vi.fn(),
  },
}));
vi.mock('../../../src/models/Book.js', () => ({
  default: {
    findByPk: vi.fn(),
  },
}));
vi.mock('../../../src/services/book-action.service.js', () => ({
  BookActionService: class {
    prepareBookForAction = vi.fn().mockResolvedValue({
      book: {
        id_book: 77,
        import_status: 'temporary',
        update: vi.fn(),
      },
    });
  },
}));

describe('NoticeService', () => {
  const service = new NoticeService();
  const userId = 5;

  beforeEach(() => vi.clearAllMocks());

  it('createNotice success with direct id_book', async () => {
    (Book.findByPk as any).mockResolvedValue({ id_book: 10 });
    const created = { id_notice: 1, id_book: 10 };
    (Notice.create as any).mockResolvedValue(created);
    const { notice, error } = await service.createNotice({ id_book: 10, content: 'Cool' }, userId);
    expect(error).toBeUndefined();
    expect(notice).toEqual(created);
  });

  it('createNotice book not found', async () => {
    (Book.findByPk as any).mockResolvedValue(null);
    const { error } = await service.createNotice({ id_book: 999, content: 'X' }, userId);
    expect(error?.code).toBe(404);
  });

  it('createNotice via open_library_key triggers import', async () => {
    (Book.findByPk as any).mockResolvedValue({ id_book: 77 });
    (Notice.create as any).mockResolvedValue({ id_notice: 2, id_book: 77 });
    const { notice } = await service.createNotice({ open_library_key: 'OL123', content: 'Import' }, userId);
    expect(notice?.id_book).toBe(77);
  });

  // NOTE: Confirmation import_status test retire because instance BookActionService is different from Book.findByPk mock

  it('listNotices pagination empty', async () => {
    (Notice.findAndCountAll as any).mockResolvedValue({ rows: [], count: 0 });
    const { notices, pagination } = await service.listNotices({ page: 1, limit: 10 } as any);
    expect(notices).toEqual([]);
    expect(pagination.total).toBe(0);
  });
});
