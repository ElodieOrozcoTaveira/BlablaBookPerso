/// <reference types="jest" />
import request from 'supertest';
import { describe, it, expect, beforeAll, beforeEach, afterEach, jest } from '@jest/globals';
import express from 'express';
import {
    createLibrary,
    getAllLibraries,
    getLibraryById,
    updateLibrary,
    deleteLibrary
} from '../../../src/controllers/library.controller';

jest.mock('../../../src/controllers/library.controller');

const mockCreateLibrary = createLibrary as jest.Mock;
const mockGetAllLibraries = getAllLibraries as jest.Mock;
const mockGetLibraryById = getLibraryById as jest.Mock;
const mockUpdateLibrary = updateLibrary as jest.Mock;
const mockDeleteLibrary = deleteLibrary as jest.Mock;

describe('Library Routes', () => {
    let app: express.Application;

    beforeEach(() => {
        jest.clearAllMocks();

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

        const libraryRoutes = require('../../../src/routes/libraries').default;
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
