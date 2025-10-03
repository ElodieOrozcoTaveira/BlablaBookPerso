/// <reference types="vitest" />

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { MockedFunction } from 'vitest';

import * as noticeController from '../../../src/controllers/notice.controller.js';
import Notice from '../../../src/models/Notice.js';
import Book from '../../../src/models/Book.js';
import User from '../../../src/models/User.js';

// Mock des modèles Sequelize
vi.mock('../../../src/models/Notice.js', () => ({
  default: {
    findAll: vi.fn(),
    findAndCountAll: vi.fn(),
    findByPk: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
  }
}));

vi.mock('../../../src/models/Book.js', () => ({
  default: {
    findByPk: vi.fn(),
  }
}));

vi.mock('../../../src/models/User.js', () => ({
  default: {
    findByPk: vi.fn(),
  }
}));

describe('Notice Controller - Tests from scratch', () => {
  let req: any;
  let res: any;
  let next: any;

  const mockUser = {
    id_user: 1,
    username: 'testuser',
    email: 'test@example.com',
    firstname: 'Test',
    lastname: 'User'
  };

  const mockBook = {
    id_book: 1,
    title: 'Test Book',
    description: 'A test book',
    publication_year: 2023
  };

  const mockNotice = {
    id_notice: 1,
    id_user: 1,
    id_book: 1,
    title: 'Test Notice',
    content: 'This is a test notice content',
    is_spoiler: false,
    is_public: true,
    created_at: new Date(),
    updated_at: new Date(),
    User: mockUser,
    Book: mockBook
  };

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      query: {},
      user: mockUser
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      end: vi.fn().mockReturnThis(),
    };
    next = vi.fn();

    // Reset all mocks
    vi.clearAllMocks();
  });

  describe('createNotice', () => {
    it('should create a notice successfully', async () => {
      req.body = {
        id_book: 1,
        title: 'Test Notice',
        content: 'This is a test notice content',
        is_spoiler: false,
        is_public: true
      };

      (Book.findByPk as MockedFunction<typeof Book.findByPk>).mockResolvedValue(mockBook as any);
      (Notice.create as MockedFunction<typeof Notice.create>).mockResolvedValue(mockNotice as any);

      await noticeController.createNotice(req, res, next);

      expect(Book.findByPk).toHaveBeenCalledWith(1);
      expect(Notice.create).toHaveBeenCalledWith({
        id_user: 1,
        id_book: 1,
        title: 'Test Notice',
        content: 'This is a test notice content',
        is_spoiler: false,
        is_public: true
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: mockNotice,
        message: expect.any(String)
      }));
    });

    it('should return 401 if user is not authenticated', async () => {
      req.user = undefined;

      await noticeController.createNotice(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Utilisateur non authentifie'
      });
    });

    it('should return 404 if book not found', async () => {
      req.body = {
        id_book: 999,
        content: 'This is a test notice content'
      };

      (Book.findByPk as MockedFunction<typeof Book.findByPk>).mockResolvedValue(null);

      await noticeController.createNotice(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Livre non trouve'
      });
    });

    it('should handle database errors', async () => {
      req.body = {
        id_book: 1,
        content: 'This is a test notice content'
      };

      (Book.findByPk as MockedFunction<typeof Book.findByPk>).mockRejectedValue(new Error('Database error'));

      await noticeController.createNotice(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getAllNotices', () => {
    it('should return paginated notices successfully', async () => {
      const mockNotices = [mockNotice, { ...mockNotice, id_notice: 2 }];
      const mockCountResult = {
        rows: mockNotices,
        count: mockNotices.length
      };
      req.query = { page: 1, limit: 10 };

      (Notice.findAndCountAll as any).mockResolvedValue(mockCountResult);

      await noticeController.getAllNotices(req, res, next);

      expect(Notice.findAndCountAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: mockNotices,
        pagination: expect.any(Object)
      }));
    });

    it('should handle database errors', async () => {
      req.query = { page: 1, limit: 10 };

      (Notice.findAndCountAll as any).mockRejectedValue(new Error('Database error'));

      await noticeController.getAllNotices(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getNoticeById', () => {
    it('should return notice by id successfully', async () => {
      req.params = { id: 1 };

      (Notice.findByPk as any).mockResolvedValue(mockNotice);

      await noticeController.getNoticeById(req, res, next);

      expect(Notice.findByPk).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: mockNotice
      }));
    });

    it('should return 404 if notice not found', async () => {
      req.params = { id: 999 };

      (Notice.findByPk as any).mockResolvedValue(null);

      await noticeController.getNoticeById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Avis non trouve'
      });
    });

    it('should handle database errors', async () => {
      req.params = { id: 1 };

      (Notice.findByPk as any).mockRejectedValue(new Error('Database error'));

      await noticeController.getNoticeById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getMyNotices', () => {
    it('should return current user notices successfully', async () => {
      const mockNotices = [mockNotice, { ...mockNotice, id_notice: 2 }];
      req.query = { page: 1, limit: 10 };

      (Notice.findAll as any).mockResolvedValue(mockNotices);

      await noticeController.getMyNotices(req, res, next);

      expect(Notice.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: mockNotices
      }));
    });

    it('should return 401 if user is not authenticated', async () => {
      req.user = undefined;

      await noticeController.getMyNotices(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Utilisateur non authentifie'
      });
    });

    it('should handle database errors', async () => {
      req.query = { page: 1, limit: 10 };

      (Notice.findAll as MockedFunction<typeof Notice.findAll>).mockRejectedValue(new Error('Database error'));

      await noticeController.getMyNotices(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('updateNotice', () => {
    it('should update notice successfully', async () => {
      req.params = { id: 1 };
      req.body = {
        title: 'Updated Notice',
        content: 'Updated content',
        is_spoiler: true
      };

      const mockFoundNotice = { 
        ...mockNotice, 
        update: vi.fn().mockResolvedValue(mockNotice),
        title: '',
        content: '',
        is_spoiler: false
      };
      
      (Notice.findByPk as any).mockResolvedValue(mockFoundNotice);

      await noticeController.updateNotice(req, res, next);

      expect(Notice.findByPk).toHaveBeenCalled();
      expect(mockFoundNotice.update).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: expect.any(String)
      }));
    });

    it('should return 401 if user is not authenticated', async () => {
      req.user = undefined;
      req.params = { id: 1 };

      await noticeController.updateNotice(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Utilisateur non authentifie'
      });
    });

    it('should return 404 if notice not found or not owned by user', async () => {
      req.params = { id: 999 };

      (Notice.findByPk as any).mockResolvedValue(null);

      await noticeController.updateNotice(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Avis non trouve'
      });
    });

    it('should handle database errors', async () => {
      req.params = { id: 1 };

      (Notice.findByPk as any).mockRejectedValue(new Error('Database error'));

      await noticeController.updateNotice(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('deleteNotice', () => {
    it('should delete notice successfully', async () => {
      req.params = { id: 1 };

      const mockFoundNotice = { 
        ...mockNotice, 
        destroy: vi.fn().mockResolvedValue(true)
      };
      
      (Notice.findByPk as any).mockResolvedValue(mockFoundNotice);

      await noticeController.deleteNotice(req, res, next);

      expect(Notice.findByPk).toHaveBeenCalled();
      expect(mockFoundNotice.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', async () => {
      req.user = undefined;
      req.params = { id: 1 };

      await noticeController.deleteNotice(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Utilisateur non authentifie'
      });
    });

    it('should return 404 if notice not found or not owned by user', async () => {
      req.params = { id: 999 };

      (Notice.findByPk as any).mockResolvedValue(null);

      await noticeController.deleteNotice(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Avis non trouve'
      });
    });

    it('should handle database errors', async () => {
      req.params = { id: 1 };

      (Notice.findByPk as any).mockRejectedValue(new Error('Database error'));

      await noticeController.deleteNotice(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
