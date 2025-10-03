import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest';
import { uploadBookCover, deleteBookCover } from '../../../src/controllers/upload.controller.js';

// IMPORTANT: le controller importe le modele avec extension .js => on mock le meme chemin
vi.mock('../../../src/models/Book.js', () => ({ default: { findByPk: vi.fn() } }));

describe('Upload Controller', () => {
    let mockRequest: any;
    let mockResponse: any;
    let mockNext: NextFunction;

    beforeEach(() => {
        mockRequest = {
            user: { id: '1', email: 'test@test.com', name: 'Test User' },
            params: {}
        };
        mockResponse = {
            status: vi.fn().mockReturnThis() as any,
            json: vi.fn().mockReturnThis() as any
        };
        mockNext = vi.fn();
        vi.clearAllMocks();

    const Book = require('../../../src/models/Book.js').default;
    (Book as any).findByPk = vi.fn();
    });

    describe('uploadBookCover', () => {
        it('should return 401 if user not authenticated', async () => {
            mockRequest.user = undefined;

            await uploadBookCover(mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
        });

        it('should return 404 if book not found', async () => {
            mockRequest.params = { book_id: 999 };
            const Book = require('../../../src/models/Book.js').default;
            (Book as any).findByPk.mockResolvedValue(null);

            await uploadBookCover(mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
        });
    });

    describe('deleteBookCover', () => {
        it('should return 401 if user not authenticated', async () => {
            mockRequest.user = undefined;

            await deleteBookCover(mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
        });
    });
});
