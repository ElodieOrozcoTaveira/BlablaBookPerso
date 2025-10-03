import request from 'supertest';
import express from 'express';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { mockAuthenticateToken } from '../../utils/auth-mocks.js';

// Mock du middleware d'authentification
vi.mock('../../../src/middleware/auth.js', () => ({
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
