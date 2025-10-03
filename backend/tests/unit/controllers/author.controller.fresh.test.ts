/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, MockedFunction } from 'vitest';
import { Response, NextFunction } from 'express';
import {
    createAuthor,
    getAllAuthors,
    getAuthorById,
    updateAuthor,
    deleteAuthor
} from '../../../src/controllers/author.controller.js';
import { AuthorService } from '../../../src/services/author.service.js';
import { AuthenticatedRequest, TypedRequest } from '../../../src/types/express.js';

// Mock du AuthorService
vi.mock('../../../src/services/author.service.js', () => ({
    AuthorService: vi.fn()
}));

describe('Author Controller - Tests from scratch', () => {
    let mockAuthorService: any;
    let MockAuthorServiceConstructor: MockedFunction<any>;
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
        mockAuthorService = {
            create: vi.fn(),
            findAll: vi.fn(),
            findById: vi.fn(),
            update: vi.fn(),
            delete: vi.fn()
        };

        MockAuthorServiceConstructor = vi.mocked(AuthorService);
        MockAuthorServiceConstructor.mockImplementation(() => mockAuthorService);

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

    describe('createAuthor', () => {
        beforeEach(() => {
            mockReq = {
                user: { id_user: 1, username: 'testuser' },
                body: {
                    name: 'J.K. Rowling',
                    bio: 'British author of Harry Potter series',
                    birth_date: '1965-07-31'
                }
            } as AuthenticatedRequest<any>;
        });

        it('should create an author successfully', async () => {
            const mockAuthor = {
                id_author: 1,
                name: 'J.K. Rowling',
                bio: 'British author of Harry Potter series',
                birth_date: '1965-07-31',
                needs_enrichment: true
            };

            mockAuthorService.create.mockResolvedValue(mockAuthor);

            await createAuthor(mockReq, mockRes, mockNext);

            expect(mockAuthorService.create).toHaveBeenCalledWith(mockReq.body);
            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockAuthor,
                message: 'Auteur cree avec succes'
            });
        });

        it('should return 401 if user is not authenticated', async () => {
            mockReq.user = null;

            await createAuthor(mockReq, mockRes, mockNext);

            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Utilisateur non authentifie'
            });
            expect(mockAuthorService.create).not.toHaveBeenCalled();
        });

        it('should handle service errors', async () => {
            const error = new Error('Database error');
            mockAuthorService.create.mockRejectedValue(error);

            await createAuthor(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('getAllAuthors', () => {
        beforeEach(() => {
            mockReq = {
                query: {
                    page: 1,
                    limit: 10,
                    searchType: 'name',
                    query: 'tolkien'
                }
            } as TypedRequest<any, any, any>;
        });

        it('should return paginated authors successfully', async () => {
            const mockResult = {
                authors: [
                    {
                        id_author: 1,
                        name: 'J.R.R. Tolkien',
                        bio: 'British author and philologist',
                        birth_date: '1892-01-03',
                        needs_enrichment: true
                    },
                    {
                        id_author: 2,
                        name: 'J.K. Rowling',
                        bio: 'British author of Harry Potter',
                        birth_date: '1965-07-31',
                        needs_enrichment: true
                    }
                ],
                pagination: {
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: 2,
                    itemsPerPage: 10
                }
            };

            mockAuthorService.findAll.mockResolvedValue(mockResult);

            await getAllAuthors(mockReq, mockRes, mockNext);

            expect(mockAuthorService.findAll).toHaveBeenCalledWith(mockReq.query);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockResult.authors,
                pagination: mockResult.pagination
            });
        });

        it('should handle empty results', async () => {
            const mockResult = {
                authors: [],
                pagination: {
                    currentPage: 1,
                    totalPages: 0,
                    totalItems: 0,
                    itemsPerPage: 10
                }
            };

            mockAuthorService.findAll.mockResolvedValue(mockResult);

            await getAllAuthors(mockReq, mockRes, mockNext);

            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: [],
                pagination: mockResult.pagination
            });
        });

        it('should handle service errors', async () => {
            const error = new Error('Database error');
            mockAuthorService.findAll.mockRejectedValue(error);

            await getAllAuthors(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('getAuthorById', () => {
        beforeEach(() => {
            mockReq = {
                params: { id: 1 }
            } as TypedRequest<any, any>;
        });

        it('should return author by id successfully', async () => {
            const mockAuthor = {
                id_author: 1,
                name: 'J.R.R. Tolkien',
                bio: 'British author and philologist, known for The Lord of the Rings',
                birth_date: '1892-01-03',
                death_date: '1973-09-02',
                avatar_url: null,
                needs_enrichment: false,
                open_library_key: null
            };

            mockAuthorService.findById.mockResolvedValue(mockAuthor);

            await getAuthorById(mockReq, mockRes, mockNext);

            expect(mockAuthorService.findById).toHaveBeenCalledWith(1);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockAuthor
            });
        });

        it('should return 404 if author not found', async () => {
            mockAuthorService.findById.mockResolvedValue(null);

            await getAuthorById(mockReq, mockRes, mockNext);

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Auteur non trouve'
            });
        });

        it('should handle service errors', async () => {
            const error = new Error('Database error');
            mockAuthorService.findById.mockRejectedValue(error);

            await getAuthorById(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('updateAuthor', () => {
        beforeEach(() => {
            mockReq = {
                user: { id_user: 1, username: 'testuser' },
                params: { id: 1 },
                body: {
                    name: 'J.R.R. Tolkien (Updated)',
                    bio: 'British author and philologist, master of fantasy literature',
                    death_date: '1973-09-02'
                }
            } as AuthenticatedRequest<any, any>;
        });

        it('should update author successfully', async () => {
            const mockUpdatedAuthor = {
                id_author: 1,
                name: 'J.R.R. Tolkien (Updated)',
                bio: 'British author and philologist, master of fantasy literature',
                birth_date: '1892-01-03',
                death_date: '1973-09-02',
                needs_enrichment: false
            };

            mockAuthorService.update.mockResolvedValue(mockUpdatedAuthor);

            await updateAuthor(mockReq, mockRes, mockNext);

            expect(mockAuthorService.update).toHaveBeenCalledWith(1, mockReq.body);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockUpdatedAuthor,
                message: 'Auteur mis a jour avec succes'
            });
        });

        it('should return 401 if user is not authenticated', async () => {
            mockReq.user = null;

            await updateAuthor(mockReq, mockRes, mockNext);

            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Utilisateur non authentifie'
            });
            expect(mockAuthorService.update).not.toHaveBeenCalled();
        });

        it('should return 404 if author not found', async () => {
            mockAuthorService.update.mockResolvedValue(null);

            await updateAuthor(mockReq, mockRes, mockNext);

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Auteur non trouve'
            });
        });

        it('should handle service errors', async () => {
            const error = new Error('Database error');
            mockAuthorService.update.mockRejectedValue(error);

            await updateAuthor(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('deleteAuthor', () => {
        beforeEach(() => {
            mockReq = {
                user: { id_user: 1, username: 'testuser' },
                params: { id: 1 }
            } as AuthenticatedRequest<any, any>;
        });

        it('should delete author successfully', async () => {
            mockAuthorService.delete.mockResolvedValue(true);

            await deleteAuthor(mockReq, mockRes, mockNext);

            expect(mockAuthorService.delete).toHaveBeenCalledWith(1);
            expect(mockStatus).toHaveBeenCalledWith(204);
            expect(mockEnd).toHaveBeenCalled();
        });

        it('should return 401 if user is not authenticated', async () => {
            mockReq.user = null;

            await deleteAuthor(mockReq, mockRes, mockNext);

            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Utilisateur non authentifie'
            });
            expect(mockAuthorService.delete).not.toHaveBeenCalled();
        });

        it('should return 404 if author not found', async () => {
            mockAuthorService.delete.mockResolvedValue(false);

            await deleteAuthor(mockReq, mockRes, mockNext);

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Auteur non trouve'
            });
        });

        it('should handle service errors', async () => {
            const error = new Error('Database error');
            mockAuthorService.delete.mockRejectedValue(error);

            await deleteAuthor(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
});
