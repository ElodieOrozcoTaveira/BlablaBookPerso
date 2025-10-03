import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../src/types/express.js';
import {
    createBook,
    getAllBooks,
    getBookById,
    updateBook,
    deleteBook
} from '../../../src/controllers/book.controller';
import Book from '../../../src/models/Book';
import Author from '../../../src/models/Author';
import Genre from '../../../src/models/Genre';

describe('Book Controller', () => {
    let mockRequest: Partial<AuthenticatedRequest>;
    let mockResponse: Partial<Response>;
    let mockNext: jest.Mock;
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let mockEnd: jest.Mock;

    beforeEach(async () => {
        // Nettoyer la base de donnees avant chaque test
        await Book.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
        await Author.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
        await Genre.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });

        // Setup des mocks pour les objets Request/Response
        mockJson = jest.fn().mockReturnThis();
        mockStatus = jest.fn().mockReturnThis();
        mockEnd = jest.fn().mockReturnThis();
        
        mockRequest = {
            user: { id_user: 1, email: 'test@test.com', username: 'testuser' } // Mock authenticated user
        };
        mockResponse = {
            json: mockJson,
            status: mockStatus,
            end: mockEnd
        } as any;
        mockNext = jest.fn();
    });

    describe('createBook', () => {
        it('should create a new book with relationships', async () => {
            // Creer des auteurs et genres de test
            const author = await Author.create({ name: 'Test Author', bio: 'Test bio' });
            const genre = await Genre.create({ name: 'Test Genre' });

            const bookData = {
                title: 'Test Book',
                isbn: '1234567890123',
                publication_year: 2023,
                description: 'Test summary',
                page_count: 300,
                author_ids: [author.id_author],
                genre_ids: [genre.id_genre]
            };

            mockRequest.body = bookData;

            await createBook(
                mockRequest as any,
                mockResponse as Response,
                mockNext
            );

            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        title: 'Test Book',
                        isbn: '1234567890123'
                    })
                })
            );

            // Verifier en base de donnees
            const createdBook = await Book.findOne({
                where: { title: 'Test Book' },
                include: [
                    { model: Author, as: 'BookHasAuthors' },
                    { model: Genre, as: 'BookHasGenres' }
                ]
            });

            expect(createdBook).not.toBeNull();
            expect(createdBook?.title).toBe('Test Book');
        });

        it('should create book without relationships', async () => {
            const bookData = {
                title: 'Simple Book',
                isbn: '9876543210987',
                publication_year: 2022
            };

            mockRequest.body = bookData;

            await createBook(
                mockRequest as any,
                mockResponse as Response,
                mockNext
            );

            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        title: 'Simple Book'
                    })
                })
            );
        });
    });

    describe('getAllBooks', () => {
        beforeEach(async () => {
            // Creer des donnees de test
            const author = await Author.create({ name: 'Test Author', bio: 'Bio' });
            const genre = await Genre.create({ name: 'Fiction' });

            const book = await Book.create({
                title: 'Test Book',
                isbn: '1111111111111',
                publication_year: 2023
            });

            // Associer les relations (les relations many-to-many necessitent une approche differente)
            // Pour l'instant, on teste seulement la creation du livre
            // await book.setBookHasAuthors([author]);
            // await book.setBookHasGenres([genre]);
        });

        it('should get all books with relationships', async () => {
            mockRequest.query = { limit: 10, page: 1 } as any;

            await getAllBooks(
                mockRequest as any,
                mockResponse as Response,
                mockNext
            );

            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.any(Array)
                })
            );
        });

        it('should get all books with pagination', async () => {
            mockRequest.query = { limit: 5, page: 2 } as any;

            await getAllBooks(
                mockRequest as any,
                mockResponse as Response,
                mockNext
            );

            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.any(Array)
                })
            );
        });

        it('should handle search filters', async () => {
            mockRequest.query = { query: 'Test', limit: 10, page: 1 } as any;

            await getAllBooks(
                mockRequest as any,
                mockResponse as Response,
                mockNext
            );

            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.any(Array)
                })
            );
        });
    });

    describe('getBookById', () => {
        let bookId: number;

        beforeEach(async () => {
            const author = await Author.create({ name: 'Test Author', bio: 'Bio' });
            const genre = await Genre.create({ name: 'Fiction' });

            const book = await Book.create({
                title: 'Test Book',
                isbn: '2222222222222',
                publication_year: 2023
            });

            // Associer les relations (les relations many-to-many necessitent une approche differente)
            // Pour l'instant, on teste seulement la creation du livre
            // await book.setBookHasAuthors([author]);
            // await book.setBookHasGenres([genre]);

            bookId = book.id_book;
        });

        it('should get book by id with relationships', async () => {
            mockRequest.params = { id: bookId.toString() };

            await getBookById(
                mockRequest as any,
                mockResponse as Response,
                mockNext
            );

            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        id_book: bookId,
                        title: 'Test Book',
                        BookHasAuthors: expect.any(Array),
                        BookHasGenres: expect.any(Array)
                    })
                })
            );
        });

        it('should handle book not found', async () => {
            mockRequest.params = { id: '9999' };

            await getBookById(
                mockRequest as any,
                mockResponse as Response,
                mockNext
            );

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Livre non trouve'
            });
        });
    });

    describe('updateBook', () => {
        let bookId: number;

        beforeEach(async () => {
            const book = await Book.create({
                title: 'Original Title',
                isbn: '3333333333333',
                publication_year: 2020
            });
            bookId = book.id_book;
        });

        it('should update book with relationships', async () => {
            const author = await Author.create({ name: 'Updated Author', bio: 'Bio' });
            const genre = await Genre.create({ name: 'Updated Genre' });

            mockRequest.params = { id: bookId.toString() };
            mockRequest.body = {
                title: 'Updated Title',
                author_ids: [author.id_author],
                genre_ids: [genre.id_genre]
            };

            await updateBook(
                mockRequest as any,
                mockResponse as Response,
                mockNext
            );

            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        title: 'Updated Title'
                    }),
                    message: expect.stringContaining('succes')
                })
            );

            // Verifier en base de donnees
            const updatedBook = await Book.findByPk(bookId);
            expect(updatedBook?.title).toBe('Updated Title');
        });

        it('should handle book not found for update', async () => {
            mockRequest.params = { id: '9999' };
            mockRequest.body = { title: 'Updated Title' };

            await updateBook(
                mockRequest as any,
                mockResponse as Response,
                mockNext
            );

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Livre non trouve'
            });
        });
    });

    describe('deleteBook', () => {
        let bookId: number;

        beforeEach(async () => {
            const book = await Book.create({
                title: 'Book to Delete',
                isbn: '4444444444444',
                publication_year: 2021
            });
            bookId = book.id_book;
        });

        it('should delete book successfully', async () => {
            mockRequest.params = { id: bookId.toString() };

            await deleteBook(
                mockRequest as any,
                mockResponse as Response,
                mockNext
            );

            expect(mockStatus).toHaveBeenCalledWith(204);
            expect(mockEnd).toHaveBeenCalled();

            // Verifier que le livre a ete supprime
            const deletedBook = await Book.findByPk(bookId);
            expect(deletedBook).toBeNull();
        });

        it('should handle book not found for deletion', async () => {
            mockRequest.params = { id: '9999' };

            await deleteBook(
                mockRequest as any,
                mockResponse as Response,
                mockNext
            );

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Livre non trouve'
            });
        });
    });
});
