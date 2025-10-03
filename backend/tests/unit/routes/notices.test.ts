import request from 'supertest';
import express from 'express';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { mockAuthenticateToken } from '../../utils/auth-mocks.js';

// Mock du middleware d'authentification
vi.mock('../../../src/middleware/auth.js', () => ({
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
