import { Request, Response, NextFunction } from 'express';
import { describe, it, expect, beforeAll, beforeEach, jest } from '@jest/globals';
import {
    createNotice,
    getAllNotices,
    getNoticeById,
    updateNotice,
    deleteNotice,
    getMyNotices,
    getNoticesByBook
} from '../../../src/controllers/notice.controller';
import Notice from '../../../src/models/Notice';
import Book from '../../../src/models/Book';
import User from '../../../src/models/User';

jest.mock('../../../src/models/Notice');
jest.mock('../../../src/models/Book');
jest.mock('../../../src/models/User');

describe('Notice Controller', () => {
    let mockRequest: any; // Changed to any to allow user property
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis() as any,
            json: jest.fn().mockReturnThis() as any,
            end: jest.fn() as any
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    describe('createNotice', () => {
        it('should create a new notice', async () => {
            const noticeData = {
                title: 'Great Book!',
                content: 'This book is amazing',
                id_book: 1
            };

            const mockCreatedNotice = { id_notice: 1, ...noticeData };

            mockRequest.body = noticeData;
            mockRequest.user = { id_user: 1, email: 'test@example.com', username: 'testuser' } as any;
            
            // Mock Book.findByPk pour verifier que le livre existe
            (Book as any).findByPk.mockResolvedValue({ id_book: 1, title: 'Test Book' });
            (Notice as any).create.mockResolvedValue(mockCreatedNotice);

            await createNotice(mockRequest as any, mockResponse as Response, mockNext);

            expect(Book.findByPk).toHaveBeenCalledWith(1);
            expect(Notice.create).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(201);
        });
    });

    describe('getAllNotices', () => {
        it('should get all notices with pagination', async () => {
            const mockNotices = [
                { id_notice: 1, title: 'Notice 1', content: 'Content 1' }
            ];

            mockRequest.query = { page: '1', limit: '20' } as any;
            (Notice as any).findAndCountAll.mockResolvedValue({
                rows: mockNotices,
                count: 1
            });

            await getAllNotices(mockRequest as any, mockResponse as Response, mockNext);

            expect(Notice.findAndCountAll).toHaveBeenCalled();
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: mockNotices
                })
            );
        });
    });

    describe('getNoticeById', () => {
        it('should get notice by id', async () => {
            const mockNotice = {
                id_notice: 1,
                title: 'Test Notice',
                content: 'Test content'
            };

            mockRequest.params = { id: '1' };
            (Notice as any).findByPk.mockResolvedValue(mockNotice);

            await getNoticeById(mockRequest as any, mockResponse as Response, mockNext);

            expect(Notice.findByPk).toHaveBeenCalledWith('1', expect.any(Object));
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockNotice
            });
        });

        it('should return 404 if notice not found', async () => {
            mockRequest.params = { id: '999' };
            (Notice as any).findByPk.mockResolvedValue(null);

            await getNoticeById(mockRequest as any, mockResponse as Response, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
        });
    });

    describe('updateNotice', () => {
        it('should update notice', async () => {
            const updateData = { title: 'Updated Notice' };
            const mockNotice = {
                id_notice: 1,
                id_user: 1,
                update: jest.fn().mockReturnValue({})
            };

            mockRequest.user = { id_user: 1, email: 'test@example.com', username: 'testuser' };
            mockRequest.params = { id: '1' };
            mockRequest.body = updateData;
            (Notice as any).findByPk.mockResolvedValue(mockNotice);

            await updateNotice(mockRequest as any, mockResponse as Response, mockNext);

            expect(mockNotice.update).toHaveBeenCalledWith(updateData);
        });
    });

    describe('deleteNotice', () => {
        it('should delete notice', async () => {
            const mockNotice = {
                id_notice: 1,
                id_user: 1,
                destroy: jest.fn().mockReturnValue({})
            };

            mockRequest.user = { id_user: 1, email: 'test@example.com', username: 'testuser' };
            mockRequest.params = { id: '1' };
            (Notice as any).findByPk.mockResolvedValue(mockNotice);

            await deleteNotice(mockRequest as any, mockResponse as Response, mockNext);

            expect(mockNotice.destroy).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(204);
        });
    });

    describe('getMyNotices', () => {
        it('should get user notices', async () => {
            const mockNotices = [
                { id_notice: 1, title: 'My Notice', id_user: 1 }
            ];

            mockRequest.user = { id_user: 1, email: 'test@example.com', username: 'testuser' } as any;
            (Notice as any).findAll.mockResolvedValue(mockNotices);

            await getMyNotices(mockRequest as any, mockResponse as Response, mockNext);

            expect(Notice.findAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id_user: 1 }  // Changed from '1' to 1
                })
            );
        });
    });

    describe('getNoticesByBook', () => {
        it('should get notices for a specific book', async () => {
            const mockNotices = [
                { id_notice: 1, title: 'Book Notice', id_book: 1 }
            ];
            const mockBook = { id_book: 1, title: 'Test Book' };

            mockRequest.params = { book_id: 1 };
            mockRequest.query = { page: 1, limit: 20 };
            
            (Book as any).findByPk.mockResolvedValue(mockBook);
            (Notice as any).findAndCountAll.mockResolvedValue({
                rows: mockNotices,
                count: 1
            });

            await getNoticesByBook(mockRequest as any, mockResponse as Response, mockNext);

            expect(Book.findByPk).toHaveBeenCalledWith(1);
            expect(Notice.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        id_book: 1,
                        is_public: true
                    })
                })
            );
        });
    });
});
