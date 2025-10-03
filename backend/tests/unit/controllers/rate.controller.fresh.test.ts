/// <reference types="vitest" />

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { MockedFunction } from 'vitest';

import * as rateController from '../../../src/controllers/rate.controller.js';
import Rate from '../../../src/models/Rate.js';
import Book from '../../../src/models/Book.js';
import User from '../../../src/models/User.js';

// Mock des modèles Sequelize
vi.mock('../../../src/models/Rate.js', () => ({
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

describe('Rate Controller - Tests from scratch', () => {
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

  const mockRate = {
    id_rate: 1,
    id_user: 1,
    id_book: 1,
    rating: 5,
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

  describe('createRate', () => {
    it('should create a rate successfully', async () => {
      req.body = {
        id_book: 1,
        rating: 5
      };

      (Book.findByPk as MockedFunction<typeof Book.findByPk>).mockResolvedValue(mockBook as any);
      (Rate.findOne as MockedFunction<typeof Rate.findOne>).mockResolvedValue(null); // Pas de note existante
      (Rate.create as MockedFunction<typeof Rate.create>).mockResolvedValue(mockRate as any);

      await rateController.createRate(req, res, next);

      expect(Book.findByPk).toHaveBeenCalledWith(1);
      expect(Rate.findOne).toHaveBeenCalledWith({
        where: { id_user: 1, id_book: 1 }
      });
      expect(Rate.create).toHaveBeenCalledWith({
        id_user: 1,
        id_book: 1,
        rating: 5
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockRate,
        message: expect.any(String)
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      req.user = undefined;

      await rateController.createRate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Utilisateur non authentifie'
      });
    });

    it('should return 404 if book not found', async () => {
      req.body = {
        id_book: 999,
        rating: 5
      };

      (Book.findByPk as MockedFunction<typeof Book.findByPk>).mockResolvedValue(null);

      await rateController.createRate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Livre non trouve'
      });
    });

    it('should return 409 if rate already exists', async () => {
      req.body = {
        id_book: 1,
        rating: 4
      };

      const existingRate = { 
        ...mockRate, 
        rating: 3,
        save: vi.fn().mockResolvedValue({ ...mockRate, rating: 4 })
      };
      
      (Book.findByPk as MockedFunction<typeof Book.findByPk>).mockResolvedValue(mockBook as any);
      (Rate.findOne as MockedFunction<typeof Rate.findOne>).mockResolvedValue(existingRate as any);

      await rateController.createRate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Vous avez deja note ce livre. Utilisez PUT pour modifier votre note.'
      });
    });

    it('should handle database errors', async () => {
      req.body = {
        id_book: 1,
        rating: 5
      };

      (Book.findByPk as MockedFunction<typeof Book.findByPk>).mockRejectedValue(new Error('Database error'));

      await rateController.createRate(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getAllRates', () => {
    it('should return paginated rates successfully', async () => {
      const mockRates = [mockRate, { ...mockRate, id_rate: 2 }];
      req.query = { page: '1', limit: '10' };

      (Rate.findAndCountAll as any).mockResolvedValue({ 
        rows: mockRates, 
        count: 2 
      });

      await rateController.getAllRates(req, res, next);

      expect(Rate.findAndCountAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockRates,
        pagination: expect.objectContaining({
          page: "1",
          limit: "10",
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        })
      });
    });

    it('should filter by id_book parameter', async () => {
      const mockRates = [mockRate];
      req.query = { id_book: '1', page: '1', limit: '10' };

      (Rate.findAndCountAll as any).mockResolvedValue({ 
        rows: mockRates, 
        count: 1 
      });

      await rateController.getAllRates(req, res, next);

      expect(Rate.findAndCountAll).toHaveBeenCalledWith({
        where: { id_book: '1' },
        attributes: expect.any(Array),
        include: expect.any(Array),
        limit: '10',
        offset: 0,
        order: [['created_at', 'DESC']]
      });
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      req.query = { page: '1', limit: '10' };

      (Rate.findAndCountAll as any).mockRejectedValue(new Error('Database error'));

      await rateController.getAllRates(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getRateById', () => {
    it('should return rate by id successfully', async () => {
      req.params = { id: '1' };

      (Rate.findByPk as MockedFunction<typeof Rate.findByPk>).mockResolvedValue(mockRate as any);

      await rateController.getRateById(req, res, next);

      expect(Rate.findByPk).toHaveBeenCalledWith('1', {
        attributes: expect.any(Array),
        include: expect.any(Array)
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockRate
      });
    });

    it('should return 404 if rate not found', async () => {
      req.params = { id: '999' };

      (Rate.findByPk as MockedFunction<typeof Rate.findByPk>).mockResolvedValue(null);

      await rateController.getRateById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Note non trouvee'
      });
    });

    it('should handle database errors', async () => {
      req.params = { id: '1' };

      (Rate.findByPk as MockedFunction<typeof Rate.findByPk>).mockRejectedValue(new Error('Database error'));

      await rateController.getRateById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getMyRates', () => {
    it('should return current user rates successfully', async () => {
      const mockRates = [mockRate, { ...mockRate, id_rate: 2 }];
      req.query = { page: '1', limit: '10' };

      (Rate.findAll as MockedFunction<typeof Rate.findAll>).mockResolvedValue(mockRates as any);

      await rateController.getMyRates(req, res, next);

      expect(Rate.findAll).toHaveBeenCalledWith({
        where: { id_user: 1 },
        attributes: expect.any(Array),
        include: expect.any(Array),
        order: [['created_at', 'DESC']]
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockRates
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      req.user = undefined;

      await rateController.getMyRates(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Utilisateur non authentifie'
      });
    });

    it('should handle database errors', async () => {
      req.query = { page: '1', limit: '10' };

      (Rate.findAll as MockedFunction<typeof Rate.findAll>).mockRejectedValue(new Error('Database error'));

      await rateController.getMyRates(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('updateRate', () => {
    it('should update rate successfully', async () => {
      req.params = { id: '1' };
      req.body = {
        rating: 4
      };

      const mockFoundRate = { 
        ...mockRate, 
        id_user: 1,
        update: vi.fn().mockResolvedValue(true)
      };
      
      (Rate.findByPk as MockedFunction<typeof Rate.findByPk>).mockResolvedValue(mockFoundRate as any);

      await rateController.updateRate(req, res, next);

      expect(Rate.findByPk).toHaveBeenCalledWith('1');
      expect(mockFoundRate.update).toHaveBeenCalledWith({ rating: 4 });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockFoundRate,
        message: expect.any(String)
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      req.user = undefined;
      req.params = { id: '1' };

      await rateController.updateRate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Utilisateur non authentifie'
      });
    });

    it('should return 404 if rate not found', async () => {
      req.params = { id: '999' };

      (Rate.findByPk as MockedFunction<typeof Rate.findByPk>).mockResolvedValue(null);

      await rateController.updateRate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String)
      });
    });

    it('should handle database errors', async () => {
      req.params = { id: '1' };

      (Rate.findByPk as MockedFunction<typeof Rate.findByPk>).mockRejectedValue(new Error('Database error'));

      await rateController.updateRate(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('deleteRate', () => {
    it('should delete rate successfully', async () => {
      req.params = { id: '1' };

      const mockFoundRate = { 
        ...mockRate,
        id_user: 1,
        destroy: vi.fn().mockResolvedValue(true)
      };
      
      (Rate.findByPk as MockedFunction<typeof Rate.findByPk>).mockResolvedValue(mockFoundRate as any);

      await rateController.deleteRate(req, res, next);

      expect(Rate.findByPk).toHaveBeenCalledWith('1');
      expect(mockFoundRate.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', async () => {
      req.user = undefined;
      req.params = { id: '1' };

      await rateController.deleteRate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Utilisateur non authentifie'
      });
    });

    it('should return 404 if rate not found', async () => {
      req.params = { id: '999' };

      (Rate.findByPk as MockedFunction<typeof Rate.findByPk>).mockResolvedValue(null);

      await rateController.deleteRate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: expect.any(String)
      });
    });

    it('should handle database errors', async () => {
      req.params = { id: '1' };

      (Rate.findByPk as MockedFunction<typeof Rate.findByPk>).mockRejectedValue(new Error('Database error'));

      await rateController.deleteRate(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
