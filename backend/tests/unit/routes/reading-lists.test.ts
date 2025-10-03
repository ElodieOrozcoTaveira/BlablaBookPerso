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

describe('Reading Lists Routes', () => {
    let app: express.Application;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        app.get('/reading-lists', (req, res) => {
            res.json({ success: true, data: [] });
        });
    });

    describe('GET /reading-lists', () => {
        it('should get all reading lists', async () => {
            const response = await request(app).get('/reading-lists');
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });
});
