import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest';
import {
    createRate,
    getAllRates,
    getRateById,
    updateRate,
    deleteRate,
    getMyRates,
    getRatesByBook
} from '../../../src/controllers/rate.controller.js';
import Rate from '../../../src/models/Rate.js';
import Book from '../../../src/models/Book.js';

vi.mock('../../../src/models/Rate');
vi.mock('../../../src/models/Book');

describe('Rate Controller', () => {
    let mockRequest: any; // Changed to any to allow user property
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: vi.fn().mockReturnThis() as any,
            json: vi.fn().mockReturnThis() as any,
            end: vi.fn().mockReturnThis() as any
        };
        mockNext = vi.fn();
        vi.clearAllMocks();
        
        // Setup mocks using the working pattern
        (Rate as any).findOne = vi.fn();
        (Rate as any).create = vi.fn();
        (Rate as any).findAndCountAll = vi.fn();
        (Rate as any).findByPk = vi.fn();
        (Book as any).findByPk = vi.fn();
    });

    describe('createRate', () => {
        it('should create a new rate', async () => {
            const rateData = { rate: 5, id_book: 1 };
            const mockCreatedRate = { id_rate: 1, ...rateData };

            mockRequest.body = rateData;
            mockRequest.user = { id_user: 1, email: 'test@example.com', username: 'testuser' } as any;
            
            // Mock Book.findByPk pour verifier que le livre existe
            (Book as any).findByPk.mockResolvedValue({ id_book: 1, title: 'Test Book' });
            // Mock Rate.findOne pour verifier qu'il n'y a pas de note existante
            (Rate as any).findOne.mockResolvedValue(null);
            (Rate as any).create.mockResolvedValue(mockCreatedRate);

            await createRate(mockRequest as any, mockResponse as Response, mockNext);

            expect(Book.findByPk).toHaveBeenCalledWith(1);
            expect(Rate.findOne).toHaveBeenCalled();
            expect(Rate.create).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(201);
        });
    });

    describe('getAllRates', () => {
        it('should get all rates with pagination', async () => {
            const mockRates = [{ id_rate: 1, rate: 4 }];

            mockRequest.query = { page: '1', limit: '20' } as any;
            (Rate as any).findAndCountAll.mockResolvedValue({
                rows: mockRates,
                count: 1
            });

            await getAllRates(mockRequest as any, mockResponse as Response, mockNext);

            expect(Rate.findAndCountAll).toHaveBeenCalled();
        });
    });

    describe('getRateById', () => {
        it('should get rate by id', async () => {
            const mockRate = { id_rate: 1, rate: 4 };

            mockRequest.params = { id: '1' };
            (Rate as any).findByPk.mockResolvedValue(mockRate);

            await getRateById(mockRequest as any, mockResponse as Response, mockNext);

            expect(Rate.findByPk).toHaveBeenCalledWith('1', expect.any(Object));
        });
    });

    describe('updateRate', () => {
        it('should update rate', async () => {
            const updateData = { rating: 5 };
            const mockRate = {
                id_rate: 1,
                id_user: 1,
                update: vi.fn().mockReturnValue({})
            };

            mockRequest.user = { id_user: 1, email: 'test@example.com', username: 'testuser' };
            mockRequest.params = { id: '1' };
            mockRequest.body = updateData;
            (Rate as any).findByPk.mockResolvedValue(mockRate);

            await updateRate(mockRequest as any, mockResponse as Response, mockNext);

            expect(mockRate.update).toHaveBeenCalledWith({ rating: 5 });
        });
    });

    describe('deleteRate', () => {
        it('should delete rate', async () => {
            const mockRate = {
                id_rate: 1,
                id_user: 1,
                destroy: vi.fn().mockReturnValue({})
            };

            mockRequest.user = { id_user: 1, email: 'test@example.com', username: 'testuser' };
            mockRequest.params = { id: '1' };
            (Rate as any).findByPk.mockResolvedValue(mockRate);

            await deleteRate(mockRequest as any, mockResponse as Response, mockNext);

            expect(mockRate.destroy).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(204);
        });
    });
});
