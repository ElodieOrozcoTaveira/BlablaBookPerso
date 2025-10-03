import { describe, it, expect, vi, beforeEach } from 'vitest';

// Utiliser vi.hoisted pour garantir disponibilite lors du hoisting des factories
const hoisted = vi.hoisted(() => ({
  prepareMock: vi.fn(),
  bookFindByPk: vi.fn(),
  noticeCreate: vi.fn()
}));
const { prepareMock, bookFindByPk, noticeCreate } = hoisted;

vi.mock('../../../src/services/book-action.service.js', () => ({
  BookActionService: vi.fn().mockImplementation(() => ({
    prepareBookForAction: hoisted.prepareMock
  }))
}));

vi.mock('../../../src/models/Book.js', () => ({
  default: { findByPk: hoisted.bookFindByPk }
}));

vi.mock('../../../src/models/Notice.js', () => ({
  default: { create: hoisted.noticeCreate }
}));

// Import apres definition des mocks
import { NoticeService } from '../../../src/services/notice.service.js';

describe('NoticeService lazy import (open_library_key)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('importe temporairement puis confirme (update appele) quand import_status=temporary', async () => {
    const updateMock = vi.fn().mockResolvedValue(undefined);
    prepareMock.mockResolvedValue({
      book: { id_book: 42, import_status: 'temporary', update: updateMock },
      wasImported: true,
      canRollback: true
    });
    bookFindByPk.mockResolvedValue({ id_book: 42 });
    noticeCreate.mockResolvedValue({ id_notice: 1, id_book: 42, content: 'c', title: 't' });

    const svc = new NoticeService();
    const result = await svc.createNotice({ open_library_key: '/works/OL123W', content: 'c', title: 't' }, 7);

    expect(prepareMock).toHaveBeenCalledWith('/works/OL123W', 7, 'add_review');
    expect(updateMock).toHaveBeenCalledWith({ import_status: 'confirmed', imported_reason: 'library' });
    expect(bookFindByPk).toHaveBeenCalledWith(42);
    expect(noticeCreate).toHaveBeenCalledWith(expect.objectContaining({ id_book: 42, id_user: 7, content: 'c' }));
    expect(result.notice).toBeDefined();
  });

  it('ne rappelle pas update si deja confirme', async () => {
    const updateMock = vi.fn();
    prepareMock.mockResolvedValue({
      book: { id_book: 55, import_status: 'confirmed', update: updateMock },
      wasImported: false,
      canRollback: false
    });
    bookFindByPk.mockResolvedValue({ id_book: 55 });
    noticeCreate.mockResolvedValue({ id_notice: 2, id_book: 55, content: 'ok' });

    const svc = new NoticeService();
    const result = await svc.createNotice({ open_library_key: '/works/OLXYZ', content: 'ok' }, 9);
    expect(prepareMock).toHaveBeenCalled();
    expect(updateMock).not.toHaveBeenCalled();
    expect(result.notice).toBeDefined();
  });

  it('propage erreur OPENLIB_IMPORT_FAILED si prepare echoue', async () => {
    prepareMock.mockRejectedValue(new Error('some remote error'));
    const svc = new NoticeService();
    await expect(svc.createNotice({ open_library_key: '/works/FAIL', content: 'x' }, 1))
      .rejects.toThrow(/OPENLIB_IMPORT_FAILED/);
  });

  it('n appelle pas prepareBookForAction si id_book fourni', async () => {
    // open_library_key absent => pas de lazy import
    bookFindByPk.mockResolvedValue({ id_book: 77 });
    noticeCreate.mockResolvedValue({ id_notice: 3, id_book: 77, content: 'loc' });
    const svc = new NoticeService();
    const result = await svc.createNotice({ id_book: 77, content: 'loc' }, 4);
    expect(prepareMock).not.toHaveBeenCalled();
    expect(result.notice).toBeDefined();
  });
});
