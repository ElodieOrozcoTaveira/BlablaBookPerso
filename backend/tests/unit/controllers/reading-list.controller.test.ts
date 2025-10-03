import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest';
import {
    addBookToReadingList,
    getReadingList,
    updateReadingStatus,
    removeBookFromReadingList,
    getMyReadingStats
} from '../../../src/controllers/reading-list.controller.js';
import ReadingList from '../../../src/models/ReadingList.js';
import Library from '../../../src/models/Library.js';
import Book from '../../../src/models/Book.js';

vi.mock('../../../src/models/ReadingList');
vi.mock('../../../src/models/Library');
vi.mock('../../../src/models/Book');

describe('Reading List Controller', () => {
    let mockRequest: any; // Changed to any to allow user property
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: vi.fn().mockReturnThis() as any,
            json: vi.fn().mockReturnThis() as any,
            end: vi.fn() as any
        };
        mockNext = vi.fn();
        vi.clearAllMocks();
    });

    describe('addBookToReadingList', () => {
        it('should add book to reading list', async () => {
            const mockCreatedEntry = { id: 1, id_book: 1, id_user: 1 };

            mockRequest.body = { id_library: 1, id_book: 1 };
            mockRequest.user = { id_user: 1, email: 'test@example.com', username: 'testuser' };
            
            // Mock Library.findByPk pour verifier que la bibliothèque existe
            (Library as any).findByPk.mockResolvedValue({ id_library: 1, id_user: 1 });
            // Mock Book.findByPk pour verifier que le livre existe  
            (Book as any).findByPk.mockResolvedValue({ id_book: 1 });
            // Mock ReadingList.findOne pour verifier qu'il n'y a pas d'entree existante
            (ReadingList as any).findOne.mockResolvedValue(null);
            (ReadingList as any).create.mockResolvedValue(mockCreatedEntry);

            await addBookToReadingList(mockRequest, mockResponse as Response, mockNext);

            expect(Library.findByPk).toHaveBeenCalledWith(1);
            expect(Book.findByPk).toHaveBeenCalledWith(1);
            expect(ReadingList.findOne).toHaveBeenCalled();
            expect(ReadingList.create).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(201);
        });
    });

    describe('getReadingList', () => {
        it('should get user reading list', async () => {
            const mockList = [{ id: 1, id_book: 1, id_library: 1 }];
            const mockLibrary = { id_library: 1, id_user: 1 };

            mockRequest.params = { library_id: 1 };
            mockRequest.query = { page: 1, limit: 20 };
            
            (Library as any).findByPk.mockResolvedValue(mockLibrary);
            (ReadingList as any).findAndCountAll.mockResolvedValue({
                rows: mockList,
                count: 1
            });

            await getReadingList(mockRequest, mockResponse as Response, mockNext);

            expect(Library.findByPk).toHaveBeenCalledWith(1);
            expect(ReadingList.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id_library: 1 }
                })
            );
        });
    });

    describe('updateReadingStatus', () => {
        it('should update reading status', async () => {
            const mockEntry = {
                id: 1,
                id_library: 1,
                started_at: null,
                finished_at: null,
                update: vi.fn().mockReturnValue({})
            };
            const mockLibrary = {
                id_library: 1,
                id_user: 1
            };

            mockRequest.user = { id_user: 1, email: 'test@example.com', username: 'testuser' };
            mockRequest.params = { id: '1' };
            mockRequest.body = { reading_status: 'read' };
            
            (ReadingList as any).findByPk.mockResolvedValue(mockEntry);
            (Library as any).findByPk.mockResolvedValue(mockLibrary);

            await updateReadingStatus(mockRequest, mockResponse as Response, mockNext);

            expect(mockEntry.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    reading_status: 'read'
                })
            );
        });
    });

    describe('removeBookFromReadingList', () => {
        it('should remove book from reading list', async () => {
            const mockEntry = {
                id: 1,
                id_library: 1,
                destroy: vi.fn().mockReturnValue({})
            };
            const mockLibrary = {
                id_library: 1,
                id_user: 1
            };

            mockRequest.user = { id_user: 1, email: 'test@example.com', username: 'testuser' };
            mockRequest.params = { id: '1' };
            
            (ReadingList as any).findByPk.mockResolvedValue(mockEntry);
            (Library as any).findByPk.mockResolvedValue(mockLibrary);

            await removeBookFromReadingList(mockRequest, mockResponse as Response, mockNext);

            expect(mockEntry.destroy).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(204);
        });
    });

    describe('getMyReadingStats', () => {
        it('should get user reading statistics', async () => {
            const mockLibraries = [
                { id_library: 1 },
                { id_library: 2 }
            ];
            const mockStats = [
                { reading_status: 'to_read', count: '5' },
                { reading_status: 'reading', count: '3' },
                { reading_status: 'read', count: '10' }
            ];

            mockRequest.user = { id_user: 1, email: 'test@example.com', username: 'testuser' };
            
            (Library as any).findAll.mockResolvedValue(mockLibraries);
            (ReadingList as any).findAll.mockResolvedValue(mockStats);

            await getMyReadingStats(mockRequest, mockResponse as Response, mockNext);

            expect(Library.findAll).toHaveBeenCalledWith({
                where: { id_user: 1 },
                attributes: ['id_library']
            });
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.any(Object)
                })
            );
        });
    });
});
