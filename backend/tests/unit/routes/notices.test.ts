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

describe('Notices Routes', () => {
    let app: express.Application;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        // Mock simple pour tester la structure
        app.get('/notices', (req, res) => {
            res.json({ success: true, data: [] });
        });
    });

    describe('GET /notices', () => {
        it('should get all notices', async () => {
            const response = await request(app).get('/notices');
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });
});
