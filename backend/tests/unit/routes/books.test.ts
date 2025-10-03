import request from 'supertest';
import express from 'express';
import { describe, it, expect, beforeAll, beforeEach, afterEach, jest } from '@jest/globals';
import { mockAuthenticateToken } from '../../utils/auth-mocks.js';

// Mock du middleware d'authentification
jest.mock('../../../src/middleware/auth.js', () => ({
    authenticateToken: mockAuthenticateToken()
}));
// On importe les types, mais pas l'implémentation réelle
import { Request, Response } from 'express';

// Mock du middleware d'authentification
jest.mock('../../../src/middleware/auth.js', () => ({
    authenticateToken: mockAuthenticateToken()
}));

// Mock des controllers seulement
jest.mock('../../../src/controllers/book.controller');

// Import des controllers mockés
import {
    createBook,
    getAllBooks,
    getBookById,
    updateBook,
    deleteBook
} from '../../../src/controllers/book.controller';

// Cast en type mock pour l'autocomplétion et la vérification de type
const mockCreateBook = createBook as jest.Mock;
const mockGetAllBooks = getAllBooks as jest.Mock;
const mockGetBookById = getBookById as jest.Mock;
const mockUpdateBook = updateBook as jest.Mock;
const mockDeleteBook = deleteBook as jest.Mock;

describe('Book Routes', () => {
    let app: express.Application;

    beforeEach(() => {
        // Réinitialise les mocks avant chaque test
        jest.clearAllMocks();

        // Configure les mocks des contrôleurs pour retourner des réponses simulées
        mockCreateBook.mockImplementation(async (req: any, res: any) => {
            res.status(201).json({ 
                success: true, 
                data: { id: 1, title: 'Test Book', author_ids: [1], genre_ids: [1] } 
            });
        });
        
        mockGetAllBooks.mockImplementation(async (req: any, res: any) => {
            res.json({ 
                success: true, 
                data: [{ 
                    id: 1, 
                    title: 'Book 1',
                    BookHasAuthors: [{ id: 1, name: 'Author 1' }],
                    BookHasGenres: [{ id: 1, name: 'Genre 1' }]
                }],
                pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
            });
        });
        
        mockGetBookById.mockImplementation(async (req: any, res: any) => {
            res.json({ 
                success: true, 
                data: { 
                    id: 1, 
                    title: 'Test Book',
                    BookHasAuthors: [{ id: 1, name: 'Author 1' }],
                    BookHasGenres: [{ id: 1, name: 'Genre 1' }]
                } 
            });
        });
        
        mockUpdateBook.mockImplementation(async (req: any, res: any) => {
            res.json({ 
                success: true, 
                data: { id: 1, title: 'Updated Book' },
                message: 'Livre mis a jour avec succes'
            });
        });
        
        mockDeleteBook.mockImplementation(async (req: any, res: any) => {
            res.status(204).end();
        });

        // Crée une nouvelle application express pour chaque test
        app = express();
        app.use(express.json());

        // Importe et utilise les routes ICI, après que les mocks soient configurés
        const bookRoutes = require('../../../src/routes/books').default;
        app.use('/books', bookRoutes);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /books', () => {
        it('should create a new book with relationships', async () => {
            const bookData = {
                title: 'Test Book',
                description: 'Test description',
                publication_year: 2023,
                author_ids: [1, 2],
                genre_ids: [1]
            };

            const response = await request(app)
                .post('/books')
                .send(bookData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(mockCreateBook).toHaveBeenCalled();
        });
    });

    describe('GET /books', () => {
        it('should get all books with relationships', async () => {
            const response = await request(app).get('/books');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data[0]).toHaveProperty('BookHasAuthors');
            expect(response.body.data[0]).toHaveProperty('BookHasGenres');
            expect(mockGetAllBooks).toHaveBeenCalled();
        });

        it('should handle search queries', async () => {
            const response = await request(app)
                .get('/books')
                .query({ 
                    page: 1, 
                    limit: 10, 
                    query: 'search', 
                    isbn: '123456',
                    publication_year: 2023 
                });

            expect(response.status).toBe(200);
            expect(mockGetAllBooks).toHaveBeenCalled();
        });
    });

    describe('GET /books/:id', () => {
        it('should get book by id with relationships', async () => {
            const response = await request(app).get('/books/1');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('BookHasAuthors');
            expect(response.body.data).toHaveProperty('BookHasGenres');
            expect(mockGetBookById).toHaveBeenCalled();
        });
    });

    describe('PUT /books/:id', () => {
        it('should update book with relationships', async () => {
            const updateData = {
                title: 'Updated Book',
                author_ids: [2, 3],
                genre_ids: [2]
            };

            const response = await request(app)
                .put('/books/1')
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('succes');
            expect(mockUpdateBook).toHaveBeenCalled();
        });
    });

    describe('DELETE /books/:id', () => {
        it('should delete book', async () => {
            const response = await request(app).delete('/books/1');

            expect(response.status).toBe(204);
            expect(mockDeleteBook).toHaveBeenCalled();
        });
    });
});
