import request from 'supertest';

// Mock du middleware d'authentification
import { mockAuthenticateToken } from '../../utils/auth-mocks.js';
jest.mock('../../../src/middleware/auth.js', () => ({
    authenticateToken: mockAuthenticateToken()
}));
import { describe, it, expect, beforeAll, beforeEach } from '@jest/globals';

// Mock du middleware d'authentification
jest.mock('../../../src/middleware/auth.js', () => ({
    authenticateToken: mockAuthenticateToken()
}));
import express from 'express';

// Mock du middleware d'authentification
jest.mock('../../../src/middleware/auth.js', () => ({
    authenticateToken: mockAuthenticateToken()
}));
// Fichier auth vide pour l'instant

describe('Auth Routes', () => {
    let app: express.Application;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        // Routes auth vides pour l'instant
        app.get('/auth/status', (req, res) => {
            res.json({ status: 'Auth routes not implemented yet' });
        });
    });

    describe('Auth Status', () => {
        it('should return auth status', async () => {
            const response = await request(app).get('/auth/status');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status');
        });
    });
});
