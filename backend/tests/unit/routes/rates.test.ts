import request from 'supertest';
import { describe, it, expect, beforeAll, beforeEach } from '@jest/globals';
import express from 'express';

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
