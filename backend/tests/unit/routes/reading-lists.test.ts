import request from 'supertest';
import express from 'express';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { mockAuthenticateToken } from '../../utils/auth-mocks.js';

// Mock du middleware d'authentification
vi.mock('../../../src/middleware/auth.js', () => ({
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
