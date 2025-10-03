import request from 'supertest';
import express from 'express';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { mockAuthenticateToken } from '../../utils/auth-mocks.js';

// Mock des controllers avec vi.fn()
const mockCreateLibrary = vi.fn((req, res) => res.status(201).json({ success: true, data: { id_library: 1 } }));
const mockGetAllLibraries = vi.fn((req, res) => res.status(200).json({ success: true, data: [] }));
const mockGetLibraryById = vi.fn((req, res) => res.status(200).json({ success: true, data: { id_library: 1 } }));
const mockUpdateLibrary = vi.fn((req, res) => res.status(200).json({ success: true, data: { id_library: 1 } }));
const mockDeleteLibrary = vi.fn((req, res) => res.status(204).send());
const mockGetMyLibraries = vi.fn((req, res) => res.status(200).json({ success: true, data: [] }));

// Mock du middleware d'authentification
vi.mock('../../../src/middleware/auth.js', () => ({
    authenticateToken: mockAuthenticateToken()
}));

// Mock des middlewares de validation
vi.mock('../../../src/middleware/validation.js', () => ({
    validateBody: vi.fn(() => (req: any, res: any, next: any) => next()),
    validateParams: vi.fn(() => (req: any, res: any, next: any) => next()),
    validateQuery: vi.fn(() => (req: any, res: any, next: any) => next())
}));

// Mock du module controller
vi.mock('../../../src/controllers/library.controller.js', () => ({
  createLibrary: mockCreateLibrary,
  getAllLibraries: mockGetAllLibraries,
  getLibraryById: mockGetLibraryById,
  updateLibrary: mockUpdateLibrary,
  deleteLibrary: mockDeleteLibrary,
  getMyLibraries: mockGetMyLibraries
}));describe('Library Routes', () => {
    let app: express.Application;

    beforeEach(async () => {
        vi.clearAllMocks();

        mockCreateLibrary.mockImplementation(async (req: any, res: any) => {
            res.status(201).json({
                success: true,
                data: { id_library: 1, name: 'My Library' },
                message: 'Bibliothèque créée avec succès'
            });
        });

        mockGetAllLibraries.mockImplementation(async (req: any, res: any) => {
            res.json({
                success: true,
                data: [{ id_library: 1, name: 'Public Library', is_public: true }],
                pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
            });
        });

        mockGetLibraryById.mockImplementation(async (req: any, res: any) => {
            res.json({
                success: true,
                data: { id_library: 1, name: 'Test Library', Books: [] }
            });
        });

        mockUpdateLibrary.mockImplementation(async (req: any, res: any) => {
            res.json({
                success: true,
                data: { id_library: 1, name: 'Updated Library' },
                message: 'Bibliothèque mise à jour avec succès'
            });
        });

        mockDeleteLibrary.mockImplementation(async (req: any, res: any) => {
            res.status(204).end();
        });

        app = express();
        app.use(express.json());

        const { default: libraryRoutes } = await import("../../../src/routes/libraries.js");
        app.use('/libraries', libraryRoutes);
    });

    describe('POST /libraries', () => {
        it('should create a new library', async () => {
            const libraryData = { name: 'My Library', is_public: true };

            const response = await request(app)
                .post('/libraries')
                .send(libraryData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(mockCreateLibrary).toHaveBeenCalled();
        });
    });

    describe('GET /libraries', () => {
        it('should get all public libraries', async () => {
            const response = await request(app).get('/libraries');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(mockGetAllLibraries).toHaveBeenCalled();
        });
    });

    describe('GET /libraries/:id', () => {
        it('should get library by id with books', async () => {
            const response = await request(app).get('/libraries/1');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(mockGetLibraryById).toHaveBeenCalled();
        });
    });

    describe('PUT /libraries/:id', () => {
        it('should update library', async () => {
            const updateData = { name: 'Updated Library' };

            const response = await request(app)
                .put('/libraries/1')
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(mockUpdateLibrary).toHaveBeenCalled();
        });
    });

    describe('DELETE /libraries/:id', () => {
        it('should delete library', async () => {
            const response = await request(app).delete('/libraries/1');

            expect(response.status).toBe(204);
            expect(mockDeleteLibrary).toHaveBeenCalled();
        });
    });
});
