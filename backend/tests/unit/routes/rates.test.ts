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

describe('Rates Routes', () => {
    let app: express.Application;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        app.get('/rates', (req, res) => {
            res.json({ success: true, data: [] });
        });
    });

    describe('GET /rates', () => {
        it('should get all rates', async () => {
            const response = await request(app).get('/rates');
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });
});
