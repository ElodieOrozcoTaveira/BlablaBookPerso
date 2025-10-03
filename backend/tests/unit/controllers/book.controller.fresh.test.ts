/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, MockedFunction } from 'vitest';
import { Response, NextFunction } from 'express';
import { createBook, getAllBooks, getBookById, updateBook, deleteBook } from '../../../src/controllers/book.controller.js';
import { BookService } from '../../../src/services/book.service.js';
import { AuthenticatedRequest, TypedRequest } from '../../../src/types/express.js';

// Mock du BookService
vi.mock('../../../src/services/book.service.js', () => ({
    BookService: vi.fn()
}));

describe('Book Controller - Tests from scratch', () => {
    let mockBookService: any;
    let MockBookServiceConstructor: MockedFunction<any>;
    let mockReq: any;
    let mockRes: any;
    let mockNext: NextFunction;
    let mockJson: MockedFunction<any>;
    let mockStatus: MockedFunction<any>;
    let mockEnd: MockedFunction<any>;

    beforeEach(() => {
        // Reset des mocks
        vi.clearAllMocks();

        // Mock du service
        mockBookService = {
            create: vi.fn(),
            findAll: vi.fn(),
            findById: vi.fn(),
            update: vi.fn(),
            delete: vi.fn()
        };

        MockBookServiceConstructor = vi.mocked(BookService);
        MockBookServiceConstructor.mockImplementation(() => mockBookService);

        // Mock de la response Express
        mockJson = vi.fn();
        mockEnd = vi.fn();
        mockStatus = vi.fn().mockReturnValue({
            json: mockJson,
            end: mockEnd
        });
        mockRes = {
            json: mockJson,
            status: mockStatus,
            end: mockEnd
        } as unknown as Response;

        // Mock du next
        mockNext = vi.fn();
    });

    describe('createBook', () => {
        beforeEach(() => {
            mockReq = {
                user: { id_user: 1, username: 'testuser' },
                body: {
                    title: 'Test Book',
                    isbn: '9781234567890',
                    description: 'A test book',
                    publication_year: 2023,
                    language: 'français',
                    author_ids: [1, 2],
                    genre_ids: [1]
                }
            } as AuthenticatedRequest<any>;
        });

        it('should create a book successfully', async () => {
            const mockBook = {
                id_book: 1,
                title: 'Test Book',
                isbn: '9781234567890',
                description: 'A test book',
                publication_year: 2023,
                language: 'français'
            };

            mockBookService.create.mockResolvedValue(mockBook);

            await createBook(mockReq, mockRes, mockNext);

            expect(mockBookService.create).toHaveBeenCalledWith(mockReq.body);
            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockBook,
                message: 'Livre cree avec succes'
            });
        });

        // Note: La creation de livre est maintenant publique pour enrichir la DB
        // Pas de test d'authentification requis pour createBook

        it('should handle service errors', async () => {
            const error = new Error('Database error');
            mockBookService.create.mockRejectedValue(error);

            await createBook(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('getAllBooks', () => {
        beforeEach(() => {
            mockReq = {
                query: {
                    page: 1,
                    limit: 10,
                    searchType: 'title',
                    query: 'test'
                }
            } as TypedRequest<any, any, any>;
        });

        it('should return paginated books successfully', async () => {
            const mockResult = {
                books: [
                    {
                        id_book: 1,
                        title: 'Test Book 1',
                        isbn: '9781234567890',
                        publication_year: 2023
                    },
                    {
                        id_book: 2,
                        title: 'Test Book 2',
                        isbn: '9781234567891',
                        publication_year: 2024
                    }
                ],
                pagination: {
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: 2,
                    itemsPerPage: 10
                },
                meta: {
                    totalLocal: 2,
                    totalOpenLibrary: 0
                }
            };

            mockBookService.findAll.mockResolvedValue(mockResult);

            await getAllBooks(mockReq, mockRes, mockNext);

            expect(mockBookService.findAll).toHaveBeenCalledWith(mockReq.query);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockResult.books,
                pagination: mockResult.pagination,
                meta: mockResult.meta
            });
        });

        it('should return books without meta when not provided', async () => {
            const mockResult = {
                books: [
                    { id_book: 1, title: 'Test Book', isbn: '9781234567890' }
                ],
                pagination: {
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: 1,
                    itemsPerPage: 10
                }
            };

            mockBookService.findAll.mockResolvedValue(mockResult);

            await getAllBooks(mockReq, mockRes, mockNext);

            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockResult.books,
                pagination: mockResult.pagination
            });
        });

        it('should handle service errors', async () => {
            const error = new Error('Database error');
            mockBookService.findAll.mockRejectedValue(error);

            await getAllBooks(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('getBookById', () => {
        beforeEach(() => {
            mockReq = {
                params: { id: 1 }
            } as TypedRequest<any, any>;
        });

        it('should return book by id successfully', async () => {
            const mockBook = {
                id_book: 1,
                title: 'Test Book',
                isbn: '9781234567890',
                description: 'A test book',
                publication_year: 2023,
                language: 'français',
                BookHasAuthors: [{ id_author: 1, name: 'Test Author' }],
                BookHasGenres: [{ id_genre: 1, name: 'Fiction' }]
            };

            mockBookService.findById.mockResolvedValue(mockBook);

            await getBookById(mockReq, mockRes, mockNext);

            expect(mockBookService.findById).toHaveBeenCalledWith(1);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockBook
            });
        });

        it('should return 404 if book not found', async () => {
            mockBookService.findById.mockResolvedValue(null);

            await getBookById(mockReq, mockRes, mockNext);

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Livre non trouve'
            });
        });

        it('should handle service errors', async () => {
            const error = new Error('Database error');
            mockBookService.findById.mockRejectedValue(error);

            await getBookById(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('updateBook', () => {
        beforeEach(() => {
            mockReq = {
                user: { id_user: 1, username: 'testuser' },
                params: { id: 1 },
                body: {
                    title: 'Updated Book',
                    description: 'An updated book',
                    publication_year: 2024
                }
            } as AuthenticatedRequest<any, any>;
        });

        it('should update book successfully', async () => {
            const mockUpdatedBook = {
                id_book: 1,
                title: 'Updated Book',
                isbn: '9781234567890',
                description: 'An updated book',
                publication_year: 2024,
                language: 'français'
            };

            mockBookService.update.mockResolvedValue(mockUpdatedBook);

            await updateBook(mockReq, mockRes, mockNext);

            expect(mockBookService.update).toHaveBeenCalledWith(1, mockReq.body);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockUpdatedBook,
                message: 'Livre mis a jour avec succes'
            });
        });

        it('should return 401 if user is not authenticated', async () => {
            mockReq.user = null;

            await updateBook(mockReq, mockRes, mockNext);

            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Utilisateur non authentifie'
            });
            expect(mockBookService.update).not.toHaveBeenCalled();
        });

        it('should return 404 if book not found', async () => {
            mockBookService.update.mockResolvedValue(null);

            await updateBook(mockReq, mockRes, mockNext);

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Livre non trouve'
            });
        });

        it('should handle service errors', async () => {
            const error = new Error('Database error');
            mockBookService.update.mockRejectedValue(error);

            await updateBook(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('deleteBook', () => {
        beforeEach(() => {
            mockReq = {
                user: { id_user: 1, username: 'testuser' },
                params: { id: 1 }
            } as AuthenticatedRequest<any, any>;
        });

        it('should delete book successfully', async () => {
            mockBookService.delete.mockResolvedValue(true);

            await deleteBook(mockReq, mockRes, mockNext);

            expect(mockBookService.delete).toHaveBeenCalledWith(1);
            expect(mockStatus).toHaveBeenCalledWith(204);
            expect(mockEnd).toHaveBeenCalled();
        });

        it('should return 401 if user is not authenticated', async () => {
            mockReq.user = null;

            await deleteBook(mockReq, mockRes, mockNext);

            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Utilisateur non authentifie'
            });
            expect(mockBookService.delete).not.toHaveBeenCalled();
        });

        it('should return 404 if book not found', async () => {
            mockBookService.delete.mockResolvedValue(false);

            await deleteBook(mockReq, mockRes, mockNext);

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Livre non trouve'
            });
        });

        it('should handle service errors', async () => {
            const error = new Error('Database error');
            mockBookService.delete.mockRejectedValue(error);

            await deleteBook(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
});
