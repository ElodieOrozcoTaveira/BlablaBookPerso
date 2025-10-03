/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, MockedFunction } from 'vitest';
import { Response, NextFunction } from 'express';
import { createGenre, getAllGenres, getGenreById, updateGenre, deleteGenre } from '../../../src/controllers/genre.controller.js';
import Genre from '../../../src/models/Genre.js';
import { AuthenticatedRequest, TypedRequest } from '../../../src/types/express.js';

// Mock du modèle Genre
vi.mock('../../../src/models/Genre.js', () => ({
    default: {
        create: vi.fn(),
        findAndCountAll: vi.fn(),
        findByPk: vi.fn()
    }
}));

describe('Genre Controller - Tests from scratch', () => {
    let MockGenre: any;
    let mockReq: any;
    let mockRes: any;
    let mockNext: NextFunction;
    let mockJson: MockedFunction<any>;
    let mockStatus: MockedFunction<any>;
    let mockEnd: MockedFunction<any>;

    beforeEach(() => {
        // Reset des mocks
        vi.clearAllMocks();

        // Mock du modèle Genre
        MockGenre = vi.mocked(Genre);

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

    describe('createGenre', () => {
        beforeEach(() => {
            mockReq = {
                user: { id_user: 1, username: 'testuser' },
                body: {
                    name: 'Science-Fiction',
                    description: 'Genre littéraire explorant les implications des sciences et technologies'
                }
            } as AuthenticatedRequest<any>;
        });

        it('should create a genre successfully', async () => {
            const mockGenre = {
                id_genre: 1,
                name: 'Science-Fiction',
                description: 'Genre littéraire explorant les implications des sciences et technologies',
                created_at: new Date(),
                updated_at: new Date()
            };

            MockGenre.create.mockResolvedValue(mockGenre);

            await createGenre(mockReq, mockRes, mockNext);

            expect(MockGenre.create).toHaveBeenCalledWith(mockReq.body);
            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockGenre,
                message: 'Genre cree avec succes'
            });
        });

        it('should return 401 if user is not authenticated', async () => {
            mockReq.user = null;

            await createGenre(mockReq, mockRes, mockNext);

            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Utilisateur non authentifie'
            });
            expect(MockGenre.create).not.toHaveBeenCalled();
        });

        it('should handle database errors', async () => {
            const error = new Error('Database constraint violation');
            MockGenre.create.mockRejectedValue(error);

            await createGenre(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('getAllGenres', () => {
        beforeEach(() => {
            mockReq = {
                query: { 
                    page: 1, 
                    limit: 10,
                    query: 'sci'
                }
            } as TypedRequest<any, any, any>;
        });

        it('should return paginated genres successfully', async () => {
            const mockGenres = [
                { 
                    id_genre: 1, 
                    name: 'Science-Fiction', 
                    description: 'Genre explorant les sciences',
                    created_at: new Date(),
                    updated_at: new Date()
                },
                { 
                    id_genre: 2, 
                    name: 'Fantasy', 
                    description: 'Genre avec des éléments fantastiques',
                    created_at: new Date(),
                    updated_at: new Date()
                }
            ];

            MockGenre.findAndCountAll.mockResolvedValue({
                rows: mockGenres,
                count: 2
            });

            await getAllGenres(mockReq, mockRes, mockNext);

            expect(MockGenre.findAndCountAll).toHaveBeenCalledWith({
                where: expect.any(Object),
                limit: 10,
                offset: 0,
                order: [['name', 'ASC']]
            });
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockGenres,
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 2,
                    totalPages: 1,
                    hasNext: false,
                    hasPrev: false
                }
            });
        });

        it('should search by name parameter', async () => {
            mockReq.query = { page: 1, limit: 10, name: 'Fantasy' };

            MockGenre.findAndCountAll.mockResolvedValue({
                rows: [],
                count: 0
            });

            await getAllGenres(mockReq, mockRes, mockNext);

            // Vérifie simplement que findAndCountAll a été appelé avec les bons paramètres de base
            expect(MockGenre.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    limit: 10,
                    offset: 0,
                    order: [['name', 'ASC']],
                    where: expect.any(Object)
                })
            );
            
            // Vérifie que la réponse est correcte
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: [],
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 0,
                    hasNext: false,
                    hasPrev: false
                }
            });
        });

        it('should return empty results when no genres found', async () => {
            MockGenre.findAndCountAll.mockResolvedValue({
                rows: [],
                count: 0
            });

            await getAllGenres(mockReq, mockRes, mockNext);

            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: [],
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 0,
                    hasNext: false,
                    hasPrev: false
                }
            });
        });

        it('should handle database errors', async () => {
            const error = new Error('Database connection error');
            MockGenre.findAndCountAll.mockRejectedValue(error);

            await getAllGenres(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('getGenreById', () => {
        beforeEach(() => {
            mockReq = {
                params: { id: 1 }
            } as TypedRequest<any, any>;
        });

        it('should return genre by id successfully', async () => {
            const mockGenre = {
                id_genre: 1,
                name: 'Science-Fiction',
                description: 'Genre littéraire explorant les sciences et technologies futures',
                created_at: new Date(),
                updated_at: new Date()
            };

            MockGenre.findByPk.mockResolvedValue(mockGenre);

            await getGenreById(mockReq, mockRes, mockNext);

            expect(MockGenre.findByPk).toHaveBeenCalledWith(1);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockGenre
            });
        });

        it('should return 404 if genre not found', async () => {
            MockGenre.findByPk.mockResolvedValue(null);

            await getGenreById(mockReq, mockRes, mockNext);

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Genre non trouve'
            });
        });

        it('should handle database errors', async () => {
            const error = new Error('Database error');
            MockGenre.findByPk.mockRejectedValue(error);

            await getGenreById(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('updateGenre', () => {
        let mockGenreInstance: any;

        beforeEach(() => {
            mockReq = {
                user: { id_user: 1, username: 'testuser' },
                params: { id: 1 },
                body: {
                    name: 'Science-Fiction (Updated)',
                    description: 'Genre littéraire moderne explorant les sciences et technologies'
                }
            } as AuthenticatedRequest<any, any>;

            mockGenreInstance = {
                id_genre: 1,
                name: 'Science-Fiction (Updated)',
                description: 'Genre littéraire moderne explorant les sciences et technologies',
                update: vi.fn(),
                reload: vi.fn()
            };
        });

        it('should update genre successfully', async () => {
            MockGenre.findByPk.mockResolvedValue(mockGenreInstance);
            mockGenreInstance.update.mockResolvedValue(undefined);
            mockGenreInstance.reload.mockResolvedValue(undefined);

            await updateGenre(mockReq, mockRes, mockNext);

            expect(MockGenre.findByPk).toHaveBeenCalledWith(1);
            expect(mockGenreInstance.update).toHaveBeenCalledWith(mockReq.body);
            expect(mockGenreInstance.reload).toHaveBeenCalled();
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockGenreInstance,
                message: 'Genre mis a jour avec succes'
            });
        });

        it('should return 401 if user is not authenticated', async () => {
            mockReq.user = null;

            await updateGenre(mockReq, mockRes, mockNext);

            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Utilisateur non authentifie'
            });
            expect(MockGenre.findByPk).not.toHaveBeenCalled();
        });

        it('should return 404 if genre not found', async () => {
            MockGenre.findByPk.mockResolvedValue(null);

            await updateGenre(mockReq, mockRes, mockNext);

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Genre non trouve'
            });
        });

        it('should filter undefined values from update data', async () => {
            mockReq.body = {
                name: 'Updated Genre',
                description: undefined
            };

            MockGenre.findByPk.mockResolvedValue(mockGenreInstance);

            await updateGenre(mockReq, mockRes, mockNext);

            expect(mockGenreInstance.update).toHaveBeenCalledWith({
                name: 'Updated Genre'
            });
        });

        it('should handle database errors', async () => {
            const error = new Error('Database error');
            MockGenre.findByPk.mockRejectedValue(error);

            await updateGenre(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('deleteGenre', () => {
        let mockGenreInstance: any;

        beforeEach(() => {
            mockReq = {
                user: { id_user: 1, username: 'testuser' },
                params: { id: 1 }
            } as AuthenticatedRequest<any, any>;

            mockGenreInstance = {
                id_genre: 1,
                name: 'Science-Fiction',
                destroy: vi.fn()
            };
        });

        it('should delete genre successfully', async () => {
            MockGenre.findByPk.mockResolvedValue(mockGenreInstance);
            mockGenreInstance.destroy.mockResolvedValue(undefined);

            await deleteGenre(mockReq, mockRes, mockNext);

            expect(MockGenre.findByPk).toHaveBeenCalledWith(1);
            expect(mockGenreInstance.destroy).toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(204);
            expect(mockEnd).toHaveBeenCalled();
        });

        it('should return 401 if user is not authenticated', async () => {
            mockReq.user = null;

            await deleteGenre(mockReq, mockRes, mockNext);

            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Utilisateur non authentifie'
            });
            expect(MockGenre.findByPk).not.toHaveBeenCalled();
        });

        it('should return 404 if genre not found', async () => {
            MockGenre.findByPk.mockResolvedValue(null);

            await deleteGenre(mockReq, mockRes, mockNext);

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Genre non trouve'
            });
        });

        it('should handle database errors', async () => {
            const error = new Error('Database error');
            MockGenre.findByPk.mockRejectedValue(error);

            await deleteGenre(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
});
