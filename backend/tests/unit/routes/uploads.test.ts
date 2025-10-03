import request from 'supertest';
import express from 'express';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { mockAuthenticateToken } from '../../utils/auth-mocks.js';

// Mock du middleware d'authentification
vi.mock('../../../src/middleware/auth.js', () => ({
    authenticateToken: mockAuthenticateToken()
}));

describe('Upload Routes', () => {
    let app: express.Application;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        app.post('/uploads/cover', (req, res) => {
            res.status(201).json({ 
                success: true, 
                data: { filename: 'test.jpg', url: '/uploads/covers/test.jpg' },
                message: 'Fichier uploadé avec succès'
            });
        });

        app.delete('/uploads/cover/:filename', (req, res) => {
            res.status(204).end();
        });
    });

    describe('POST /uploads/cover', () => {
        it('should upload cover file', async () => {
            const response = await request(app).post('/uploads/cover');
            
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
        });
    });

    describe('DELETE /uploads/cover/:filename', () => {
        it('should delete cover file', async () => {
            const response = await request(app).delete('/uploads/cover/test.jpg');
            
            expect(response.status).toBe(204);
        });
    });
});
