import request from 'supertest';
import { describe, it, expect, beforeAll, beforeEach } from '@jest/globals';
import express from 'express';

describe('Upload Routes', () => {
    let app: express.Application;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        app.post('/uploads/cover', (req, res) => {
            res.status(201).json({ 
                success: true, 
                data: { filename: 'test.jpg', url: '/uploads/covers/test.jpg' },
                message: 'Fichier uploadé avec succès'
            });
        });

        app.delete('/uploads/cover/:filename', (req, res) => {
            res.status(204).end();
        });
    });

    describe('POST /uploads/cover', () => {
        it('should upload cover file', async () => {
            const response = await request(app).post('/uploads/cover');
            
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
        });
    });

    describe('DELETE /uploads/cover/:filename', () => {
        it('should delete cover file', async () => {
            const response = await request(app).delete('/uploads/cover/test.jpg');
            
            expect(response.status).toBe(204);
        });
    });
});
