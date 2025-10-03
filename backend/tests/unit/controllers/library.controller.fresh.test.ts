/// <reference types="vitest" />

import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../../src/types/express.js';

// Import des fonctions à tester
import {
    createLibrary,
    getAllLibraries,
    getLibraryById,
    updateLibrary,
    deleteLibrary,
    getMyLibraries
} from '../../../src/controllers/library.controller.js';

// Mock des modèles
import Library from '../../../src/models/Library.js';
import User from '../../../src/models/User.js';
import Book from '../../../src/models/Book.js';

vi.mock('../../../src/models/Library.js');
vi.mock('../../../src/models/User.js');
vi.mock('../../../src/models/Book.js');

const MockedLibrary = vi.mocked(Library);
const MockedUser = vi.mocked(User);
const MockedBook = vi.mocked(Book);

describe('Library Controller - Tests from scratch', () => {
    let mockReq: Partial<AuthenticatedRequest>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;
    let mockJson: MockedFunction<any>;
    let mockStatus: MockedFunction<any>;
    let mockEnd: MockedFunction<any>;

    beforeEach(() => {
        // Reset des mocks
        vi.clearAllMocks();

        // Création des mocks de réponse
        mockJson = vi.fn();
        mockEnd = vi.fn();
        mockStatus = vi.fn().mockReturnValue({ 
            json: mockJson,
            end: mockEnd 
        });
        
        mockReq = {
            user: {
                id_user: 1,
                username: 'testuser',
                email: 'test@test.com'
            },
            body: {},
            query: {},
            params: {}
        };

        mockRes = {
            status: mockStatus,
            json: mockJson,
            end: mockEnd
        };

        mockNext = vi.fn();
    });

    describe('createLibrary', () => {
        it('should create a library successfully', async () => {
            // Arrange
            const libraryData = {
                name: 'Ma nouvelle bibliothèque',
                description: 'Description test',
                is_public: true
            };
            
            mockReq.body = libraryData;

            const createdLibrary = {
                id_library: 1,
                ...libraryData,
                id_user: 1,
                created_at: new Date(),
                updated_at: new Date()
            };

            MockedLibrary.create = vi.fn().mockResolvedValue(createdLibrary);

            // Act
            await createLibrary(
                mockReq as AuthenticatedRequest,
                mockRes as Response,
                mockNext
            );

            // Assert
            expect(MockedLibrary.create).toHaveBeenCalledWith({
                ...libraryData,
                id_user: 1
            });
            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: createdLibrary,
                message: 'Bibliotheque creee avec succes'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should return 401 if user is not authenticated', async () => {
            // Arrange
            mockReq.user = undefined;
            mockReq.body = { name: 'Test Library' };

            // Act
            await createLibrary(
                mockReq as AuthenticatedRequest,
                mockRes as Response,
                mockNext
            );

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Utilisateur non authentifie'
            });
            expect(MockedLibrary.create).not.toHaveBeenCalled();
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should handle database errors', async () => {
            // Arrange
            mockReq.body = {
                name: 'Test Library',
                description: 'Test Description'
            };

            const dbError = new Error('Database connection failed');
            MockedLibrary.create = vi.fn().mockRejectedValue(dbError);

            // Act
            await createLibrary(
                mockReq as AuthenticatedRequest,
                mockRes as Response,
                mockNext
            );

            // Assert
            expect(mockNext).toHaveBeenCalledWith(dbError);
            expect(mockStatus).not.toHaveBeenCalled();
            expect(mockJson).not.toHaveBeenCalled();
        });
    });

    describe('getAllLibraries', () => {
        it('should return paginated libraries', async () => {
            // Arrange
            mockReq.query = {
                page: 1,
                limit: 10
            };

            const mockLibraries = [
                {
                    id_library: 1,
                    name: 'Library 1',
                    description: 'Description 1',
                    is_public: true,
                    id_user: 1,
                    created_at: new Date(),
                    updated_at: new Date(),
                    LibraryBelongsToUser: {
                        id_user: 1,
                        username: 'user1',
                        firstname: 'John',
                        lastname: 'Doe'
                    }
                }
            ];

            MockedLibrary.findAndCountAll = vi.fn().mockResolvedValue({
                rows: mockLibraries,
                count: 1
            });

            // Act
            await getAllLibraries(
                mockReq as any,
                mockRes as Response,
                mockNext
            );

            // Assert
            expect(MockedLibrary.findAndCountAll).toHaveBeenCalledWith({
                where: {},
                attributes: ['id_library', 'name', 'description', 'is_public', 'id_user', 'created_at', 'updated_at'],
                include: [{
                    model: User,
                    as: 'LibraryBelongsToUser',
                    attributes: ['id_user', 'username', 'firstname', 'lastname']
                }],
                limit: 10,
                offset: 0,
                order: [['created_at', 'DESC']]
            });

            // Le controller appelle res.json() directement (pas status + json)
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockLibraries,
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 1,
                    totalPages: 1,
                    hasNext: false,
                    hasPrev: false
                }
            });
        });

        it('should handle search query', async () => {
            // Arrange
            mockReq.query = {
                page: 1,
                limit: 10,
                query: 'fantasy'
            };

            MockedLibrary.findAndCountAll = vi.fn().mockResolvedValue({
                rows: [],
                count: 0
            });

            // Act
            await getAllLibraries(
                mockReq as any,
                mockRes as Response,
                mockNext
            );

            // Assert
            expect(MockedLibrary.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        [Symbol.for('or')]: expect.any(Array)
                    })
                })
            );
        });
    });

    describe('getLibraryById', () => {
        it('should return a library by id', async () => {
            // Arrange - le param s'appelle 'id' et sera transformé en number par Zod
            mockReq.params = { id: 1 }; // Après transformation Zod

            const mockLibrary = {
                id_library: 1,
                name: 'Test Library',
                description: 'Test Description',
                is_public: true,
                id_user: 1,
                LibraryBelongsToUser: {
                    id_user: 1,
                    username: 'testuser',
                    firstname: 'Test',
                    lastname: 'User'
                }
            };

            MockedLibrary.findByPk = vi.fn().mockResolvedValue(mockLibrary);

            // Act
            await getLibraryById(
                mockReq as any,
                mockRes as Response,
                mockNext
            );

            // Assert
            expect(MockedLibrary.findByPk).toHaveBeenCalledWith(1, {
                attributes: ['id_library', 'name', 'description', 'is_public', 'id_user', 'created_at', 'updated_at'],
                include: [
                    {
                        model: User,
                        as: 'LibraryBelongsToUser',
                        attributes: ['id_user', 'username', 'firstname', 'lastname']
                    },
                    {
                        model: Book, // Corrigé : Book au lieu de User
                        as: 'LibraryHasBooks',
                        attributes: ['id_book', 'title', 'isbn', 'publication_year'],
                        through: {
                            attributes: ['status', 'created_at']
                        }
                    }
                ]
            });
            
            // Le controller utilise res.json() directement (pas status)
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockLibrary
            });
        });

        it('should return 404 if library not found', async () => {
            // Arrange
            mockReq.params = { id_library: '999' };
            MockedLibrary.findByPk = vi.fn().mockResolvedValue(null);

            // Act
            await getLibraryById(
                mockReq as any,
                mockRes as Response,
                mockNext
            );

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Bibliotheque non trouvee'
            });
        });
    });

    describe('deleteLibrary', () => {
        it('should delete a library successfully', async () => {
            // Arrange - param s'appelle 'id' et user complet
            mockReq.params = { id: 1 }; // Après transformation Zod
            mockReq.user = { 
                id_user: 1, 
                username: 'testuser',
                email: 'test@test.com'
            };

            const mockLibrary = {
                id_library: 1,
                name: 'Test Library',
                id_user: 1,
                destroy: vi.fn().mockResolvedValue(true)
            };

            MockedLibrary.findByPk = vi.fn().mockResolvedValue(mockLibrary);
            
            // Act
            await deleteLibrary(
                mockReq as any, // Éviter les problèmes de types pour le moment
                mockRes as Response,
                mockNext
            );

            // Assert
            expect(MockedLibrary.findByPk).toHaveBeenCalledWith(1);
            expect(mockLibrary.destroy).toHaveBeenCalled();
            // Le controller renvoie 204 avec end() (pas json)
            expect(mockStatus).toHaveBeenCalledWith(204);
            // mockStatus().end() doit être appelé
            expect(mockEnd).toHaveBeenCalled();
        });

        it('should return 401 if user not authenticated', async () => {
            // Arrange
            mockReq.params = { id: 1 }; // Corrigé
            mockReq.user = undefined;

            // Act
            await deleteLibrary(
                mockReq as any, // Éviter les problèmes de types
                mockRes as Response,
                mockNext
            );

            // Assert
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Utilisateur non authentifie'
            });
        });
    });
});
