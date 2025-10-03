import request from 'supertest';
import express from 'express';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { mockAuthenticateToken, mockRequirePermission } from '../../utils/auth-mocks.js';

// Mock des controllers avec vi.fn()
const mockCreateGenre = vi.fn();
const mockGetAllGenres = vi.fn();
const mockGetGenreById = vi.fn();
const mockUpdateGenre = vi.fn();
const mockDeleteGenre = vi.fn();

// Mock des middlewares d'auth/authz
vi.mock('../../../src/middleware/auth.js', () => ({
    authenticateToken: mockAuthenticateToken()
}));
vi.mock('../../../src/middleware/permission.js', () => ({
    requirePermission: mockRequirePermission()
}));

// Mock du module controller
vi.mock('../../../src/controllers/genre.controller.js', () => ({
    createGenre: mockCreateGenre,
    getAllGenres: mockGetAllGenres,
    getGenreById: mockGetGenreById,
    updateGenre: mockUpdateGenre,
    deleteGenre: mockDeleteGenre
}));

describe('Genre Routes', () => {
    let app: express.Application;

    beforeEach(async () => {
        vi.clearAllMocks();

        mockCreateGenre.mockImplementation(async (req: any, res: any) => {
            res.status(201).json({
                success: true,
                data: { id_genre: 1, name: 'Fantasy' },
                message: 'Genre créé avec succès'
            });
        });

        mockGetAllGenres.mockImplementation(async (req: any, res: any) => {
            res.json({
                success: true,
                data: [{ id_genre: 1, name: 'Fantasy' }],
                pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
            });
        });

        mockGetGenreById.mockImplementation(async (req: any, res: any) => {
            res.json({
                success: true,
                data: { id_genre: 1, name: 'Fantasy' }
            });
        });

        mockUpdateGenre.mockImplementation(async (req: any, res: any) => {
            res.json({
                success: true,
                data: { id_genre: 1, name: 'Updated Fantasy' },
                message: 'Genre mis à jour avec succès'
            });
        });

        mockDeleteGenre.mockImplementation(async (req: any, res: any) => {
            res.status(204).end();
        });

        app = express();
        app.use(express.json());

        const { default: genreRoutes } = await import("../../../src/routes/genres.js");
        app.use('/genres', genreRoutes);
    });

    describe('POST /genres', () => {
        it('should create a new genre', async () => {
            const genreData = {
                name: 'Fantasy',
                description: 'Fantasy genre'
            };

            const response = await request(app)
                .post('/genres')
                .send(genreData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(mockCreateGenre).toHaveBeenCalled();
        });
    });

    describe('GET /genres', () => {
        it('should get all genres', async () => {
            const response = await request(app).get('/genres');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(mockGetAllGenres).toHaveBeenCalled();
        });

        it('should handle search queries', async () => {
            const response = await request(app)
                .get('/genres')
                .query({ query: 'fantasy' });

            expect(response.status).toBe(200);
            expect(mockGetAllGenres).toHaveBeenCalled();
        });
    });

    describe('GET /genres/:id', () => {
        it('should get genre by id', async () => {
            const response = await request(app).get('/genres/1');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(mockGetGenreById).toHaveBeenCalled();
        });
    });

    describe('PUT /genres/:id', () => {
        it('should update genre', async () => {
            const updateData = { name: 'Updated Fantasy' };

            const response = await request(app)
                .put('/genres/1')
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(mockUpdateGenre).toHaveBeenCalled();
        });
    });

    describe('DELETE /genres/:id', () => {
        it('should delete genre', async () => {
            const response = await request(app).delete('/genres/1');

            expect(response.status).toBe(204);
            expect(mockDeleteGenre).toHaveBeenCalled();
        });
    });
});
