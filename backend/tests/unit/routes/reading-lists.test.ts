import request from 'supertest';
import { describe, it, expect, beforeAll, beforeEach } from '@jest/globals';
import express from 'express';

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
