import request from 'supertest';
import express from 'express';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { mockAuthenticateToken, mockRequirePermission } from '../../utils/auth-mocks.js';

// Mock middlewares (permission echoue)
vi.mock('../../../src/middleware/auth.js', () => ({
    authenticateToken: mockAuthenticateToken()
}));
vi.mock('../../../src/middleware/permission.js', () => ({
    requirePermission: mockRequirePermission(false)
}));

// Mock des controllers livres
const mockCreateBook = vi.fn();
const mockUpdateBook = vi.fn();
const mockDeleteBook = vi.fn();
const mockGetAllBooks = vi.fn();
const mockGetBookById = vi.fn();

vi.mock('../../../src/controllers/book.controller.js', () => ({
    createBook: mockCreateBook,
    updateBook: mockUpdateBook,
    deleteBook: mockDeleteBook,
    getAllBooks: mockGetAllBooks,
    getBookById: mockGetBookById
}));

describe('RBAC Denied - Book Routes', () => {
    let app: express.Application;

    beforeEach(async () => {
        vi.clearAllMocks();
        app = express();
        app.use(express.json());
        const { default: bookRoutes } = await import('../../../src/routes/books.js');
        app.use('/books', bookRoutes);
    });

    // POST /books -> 403 si permission CREATE_BOOK manquante
    it('POST /books -> 403 if CREATE_BOOK permission missing', async () => {
        const response = await request(app)
            .post('/books')
            .send({ title: 'T', author_ids: [], genre_ids: [] });
        expect(response.status).toBe(403);
        expect(mockCreateBook).not.toHaveBeenCalled();
    });

    // PUT /books/1 -> 403 si permission UPDATE_BOOK manquante
    it('PUT /books/1 -> 403 if UPDATE_BOOK permission missing', async () => {
        const response = await request(app)
            .put('/books/1')
            .send({ title: 'X' });
        expect(response.status).toBe(403);
        expect(mockUpdateBook).not.toHaveBeenCalled();
    });

    // DELETE /books/1 -> 403 si permission DELETE_BOOK manquante
    it('DELETE /books/1 -> 403 if DELETE_BOOK permission missing', async () => {
        const response = await request(app)
            .delete('/books/1');
        expect(response.status).toBe(403);
        expect(mockDeleteBook).not.toHaveBeenCalled();
    });
});
