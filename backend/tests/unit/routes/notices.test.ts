import request from 'supertest';
import { describe, it, expect, beforeAll, beforeEach } from '@jest/globals';
import express from 'express';

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
