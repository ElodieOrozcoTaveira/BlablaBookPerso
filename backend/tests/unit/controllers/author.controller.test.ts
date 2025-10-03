import { Request, Response, NextFunction } from 'express';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
    createAuthor,
    getAllAuthors,
    getAuthorById,
    updateAuthor,
    deleteAuthor
} from '../../../src/controllers/author.controller';
import Author from '../../../src/models/Author';

describe('Author Controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let mockEnd: jest.Mock;
    let createdAuthorId: number;

    beforeEach(async () => {
        // Nettoyer les données de test
        await Author.destroy({ where: {}, force: true });
        
        // Setup des mocks pour les objets Express
        mockJson = jest.fn().mockReturnThis();
        mockStatus = jest.fn().mockReturnThis();
        mockEnd = jest.fn().mockReturnThis();
        
        mockRequest = {};
        mockResponse = {
            json: mockJson as any,
            status: mockStatus as any,
            end: mockEnd as any
        };
        mockNext = jest.fn();
    });

    afterEach(async () => {
        // Nettoyer les données après chaque test
        await Author.destroy({ where: {}, force: true });
        jest.clearAllMocks();
    });

    describe('createAuthor', () => {
        it('should create a new author successfully', async () => {
            const authorData = {
                name: 'J.R.R. Tolkien',
                bio: 'Famous fantasy author',
                birth_date: '1892-01-03'
            };

            mockRequest.body = authorData;

            await createAuthor(
                mockRequest as any,
                mockResponse as Response,
                mockNext
            );

            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        name: authorData.name,
                        bio: authorData.bio,
                        birth_date: authorData.birth_date
                    }),
                    message: 'Auteur cree avec succes'
                })
            );
        });

        it('should handle creation errors with invalid data', async () => {
            mockRequest.body = {}; // Données manquantes

            await createAuthor(
                mockRequest as any,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('getAllAuthors', () => {
        beforeEach(async () => {
            // Créer des auteurs de test
            const author1 = await Author.create({
                name: 'Author 1',
                bio: 'Bio 1',
                birth_date: new Date('1900-01-01')
            });
            const author2 = await Author.create({
                name: 'Author 2',
                bio: 'Bio 2',
                birth_date: new Date('1900-02-02')
            });
        });

        it('should get all authors with pagination', async () => {
            mockRequest.query = { page: '1', limit: '20' };

            await getAllAuthors(
                mockRequest as any,
                mockResponse as Response,
                mockNext
            );

            expect(mockJson).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.arrayContaining([
                        expect.objectContaining({ name: 'Author 1' }),
                        expect.objectContaining({ name: 'Author 2' })
                    ]),
                    pagination: expect.objectContaining({
                        page: "1",
                        limit: "20",
                        total: 2,
                        totalPages: 1,
                        hasNext: false,
                        hasPrev: false
                    })
                })
            );
        });

        it('should handle search query', async () => {
            mockRequest.query = { 
                page: '1', 
                limit: '20', 
                query: 'Author 1'
            };

            await getAllAuthors(
                mockRequest as any,
                mockResponse as Response,
                mockNext
            );

            expect(mockJson).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.arrayContaining([
                        expect.objectContaining({ name: 'Author 1' })
                    ])
                })
            );
        });
    });

    describe('getAuthorById', () => {
        beforeEach(async () => {
            const author = await Author.create({
                name: 'Test Author',
                bio: 'Test Bio',
                birth_date: new Date('1900-01-01')
            });
            createdAuthorId = author.id_author;
        });

        it('should get author by id successfully', async () => {
            mockRequest.params = { id: createdAuthorId.toString() };

            await getAuthorById(
                mockRequest as any,
                mockResponse as Response,
                mockNext
            );

            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: expect.objectContaining({
                    name: 'Test Author',
                    bio: 'Test Bio'
                })
            });
        });

        it('should handle author not found', async () => {
            mockRequest.params = { id: '999999' };

            await getAuthorById(
                mockRequest as any,
                mockResponse as Response,
                mockNext
            );

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Auteur non trouvé'
            });
        });
    });

    describe('updateAuthor', () => {
        beforeEach(async () => {
            const author = await Author.create({
                name: 'Original Name',
                bio: 'Original Bio',
                birth_date: new Date('1900-01-01')
            });
            createdAuthorId = author.id_author;
        });

        it('should update author successfully', async () => {
            const updateData = { name: 'Updated Name', bio: 'Updated Bio' };

            mockRequest.params = { id: createdAuthorId.toString() };
            mockRequest.body = updateData;

            await updateAuthor(
                mockRequest as any,
                mockResponse as Response,
                mockNext
            );

            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: expect.objectContaining({
                    name: 'Updated Name',
                    bio: 'Updated Bio'
                }),
                message: 'Auteur mis à jour avec succès'
            });
        });

        it('should handle author not found for update', async () => {
            mockRequest.params = { id: '999999' };
            mockRequest.body = { name: 'Updated Name' };

            await updateAuthor(
                mockRequest as any,
                mockResponse as Response,
                mockNext
            );

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Auteur non trouvé'
            });
        });
    });

    describe('deleteAuthor', () => {
        beforeEach(async () => {
            const author = await Author.create({
                name: 'Author to Delete',
                bio: 'Will be deleted',
                birth_date: new Date('1900-01-01')
            });
            createdAuthorId = author.id_author;
        });

        it('should delete author successfully', async () => {
            mockRequest.params = { id: createdAuthorId.toString() };

            await deleteAuthor(
                mockRequest as any,
                mockResponse as Response,
                mockNext
            );

            expect(mockStatus).toHaveBeenCalledWith(204);
            expect(mockEnd).toHaveBeenCalled();

            // Vérifier que l'auteur a bien été supprimé
            const deletedAuthor = await Author.findByPk(createdAuthorId);
            expect(deletedAuthor).toBeNull();
        });

        it('should handle author not found for deletion', async () => {
            mockRequest.params = { id: '999999' };

            await deleteAuthor(
                mockRequest as any,
                mockResponse as Response,
                mockNext
            );

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Auteur non trouvé'
            });
        });
    });
});