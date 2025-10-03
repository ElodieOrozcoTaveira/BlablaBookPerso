/// <reference types="vitest" />
import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest';
import * as noticeController from '../../../src/controllers/notice.controller.js';
import Notice from '../../../src/models/Notice.js';
import Book from '../../../src/models/Book.js';
import { BookActionService } from '../../../src/services/book-action.service.js';

vi.mock('../../../src/models/Notice.js', () => ({ default: { create: vi.fn() } }));
vi.mock('../../../src/models/Book.js', () => ({ default: { findByPk: vi.fn() } }));
vi.mock('../../../src/services/book-action.service.js', () => ({ BookActionService: vi.fn().mockImplementation(() => ({ prepareBookForAction: vi.fn() })) }));

describe('Notice Controller - lazy import', () => {
  let req: any; let res: any; let next: any; let mockPreparation: any;
  const mockUser = { id_user: 9 };
  const mockTempBook = { id_book: 321, import_status: 'temporary', update: vi.fn().mockResolvedValue(true) };

  beforeEach(() => {
    req = { user: mockUser, body: {}, params: {}, query: {} };
    res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
    next = vi.fn();
    vi.clearAllMocks();
    mockPreparation = { book: mockTempBook, wasImported: true };
    (BookActionService as any).mockImplementation(() => ({ prepareBookForAction: vi.fn().mockResolvedValue(mockPreparation) }));
  });

  it('importe et confirme un livre puis cree un avis', async () => {
    req.body = { open_library_key: '/works/OL999W', content: 'Un avis sur le livre', is_public: true, is_spoiler: false };
    (Book.findByPk as MockedFunction<any>).mockResolvedValue(mockTempBook);
    const createdNotice = { id_notice: 1, id_book: 321, id_user: 9, content: 'Un avis sur le livre', is_public: true, is_spoiler: false };
    (Notice.create as MockedFunction<any>).mockResolvedValue(createdNotice);

    await noticeController.createNotice(req, res, next);

    expect(BookActionService).toHaveBeenCalled();
    const svcInstance = (BookActionService as any).mock.results[0].value;
  // Nouvelle actionType standardisee 'add_review' (anciennement 'notice_book')
  expect(svcInstance.prepareBookForAction).toHaveBeenCalledWith('/works/OL999W', 9, 'add_review');
    expect(mockTempBook.update).toHaveBeenCalledWith({ import_status: 'confirmed', imported_reason: 'library' });
    expect(Notice.create).toHaveBeenCalledWith({ id_book: 321, id_user: 9, content: 'Un avis sur le livre', is_public: true, is_spoiler: false, title: undefined });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('retourne 400 si aucun identifiant livre', async () => {
    req.body = { content: 'Test', is_public: true };
    await noticeController.createNotice(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('retourne 404 si import echoue', async () => {
    req.body = { open_library_key: '/works/FAIL', content: 'Test', is_public: true };
    (BookActionService as any).mockImplementation(() => ({ prepareBookForAction: vi.fn().mockRejectedValue(new Error('fail')) }));
    await noticeController.createNotice(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
