import { Request, Response, NextFunction } from 'express';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { uploadBookCover, deleteBookCover } from '../../../src/controllers/upload.controller';

jest.mock('../../../src/models/Book');

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
            status: jest.fn().mockReturnThis() as any,
            json: jest.fn().mockReturnThis() as any
        };
        mockNext = jest.fn();
        jest.clearAllMocks();

        const Book = require('../../../src/models/Book').default;
        (Book as any).findByPk = jest.fn();
    });

    describe('uploadBookCover', () => {
        it('should return 401 if user not authenticated', async () => {
            mockRequest.user = undefined;

            await uploadBookCover(mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
        });

        it('should return 404 if book not found', async () => {
            mockRequest.params = { book_id: 999 };
            const Book = require('../../../src/models/Book').default;
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
