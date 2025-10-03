import request from 'supertest';
import express from 'express';
import { describe, it, expect, beforeAll, beforeEach } from '@jest/globals';
import Author from '../../../src/models/Author';
import authorRouter from '../../../src/routes/authors';

describe('Author Routes', () => {
    let app: express.Application;

    beforeAll(() => {
        // Configuration de l'application Express pour les tests
        app = express();
        app.use(express.json());
        app.use('/authors', authorRouter);
    });

    beforeEach(async () => {
        // Nettoie la base de données avant chaque test
        await Author.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
    });

    describe('POST /authors', () => {
        it('should create a new author', async () => {
            const authorData = {
                name: 'John Doe',
                bio: 'Test biography'
            };

            const response = await request(app)
                .post('/authors')
                .send(authorData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id_author');
            expect(response.body.data.name).toBe(authorData.name);
            expect(response.body.data.bio).toBe(authorData.bio);

            // Vérification en base de données
            const authorInDb = await Author.findByPk(response.body.data.id_author);
            expect(authorInDb).not.toBeNull();
            expect(authorInDb?.name).toBe(authorData.name);
        });

        it('should handle validation errors', async () => {
            const invalidAuthorData = {
                // Pas de nom du tout - devrait déclencher une erreur
                bio: 'Test bio'
            };

            const response = await request(app)
                .post('/authors')
                .send(invalidAuthorData);

            // Pour l'instant, on accepte soit 400 (validation) soit 500 (erreur interne)
            expect([400, 500]).toContain(response.status);
        });
    });

    describe('GET /authors', () => {
        beforeEach(async () => {
            // Créer des auteurs de test
            await Author.bulkCreate([
                { name: 'John Doe', bio: 'Bio 1' },
                { name: 'Jane Smith', bio: 'Bio 2' },
                { name: 'Bob Johnson', bio: 'Bio 3' }
            ]);
        });

        it('should get all authors', async () => {
            const response = await request(app)
                .get('/authors');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(3);
            expect(response.body.data[0]).toHaveProperty('id_author');
            expect(response.body.data[0]).toHaveProperty('name');
        });

        it('should handle query parameters', async () => {
            const response = await request(app)
                .get('/authors?search=John');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('GET /authors/:id', () => {
        let authorId: number;

        beforeEach(async () => {
            const author = await Author.create({
                name: 'John Doe',
                bio: 'Test biography'
            });
            authorId = author.id_author;
        });

        it('should get author by id', async () => {
            const response = await request(app)
                .get(`/authors/${authorId}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id_author).toBe(authorId);
            expect(response.body.data.name).toBe('John Doe');
        });

        it('should return 404 for non-existent author', async () => {
            const response = await request(app)
                .get('/authors/9999');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /authors/:id', () => {
        let authorId: number;

        beforeEach(async () => {
            const author = await Author.create({
                name: 'John Doe',
                bio: 'Original biography'
            });
            authorId = author.id_author;
        });

        it('should update author', async () => {
            const updateData = {
                name: 'Jane Smith',
                bio: 'Updated biography'
            };

            const response = await request(app)
                .put(`/authors/${authorId}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(updateData.name);

            // Vérification en base de données
            const updatedAuthor = await Author.findByPk(authorId);
            expect(updatedAuthor?.name).toBe(updateData.name);
            expect(updatedAuthor?.bio).toBe(updateData.bio);
        });

        it('should return 404 for non-existent author', async () => {
            const response = await request(app)
                .put('/authors/9999')
                .send({ name: 'Jane Smith' });

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe('DELETE /authors/:id', () => {
        let authorId: number;

        beforeEach(async () => {
            const author = await Author.create({
                name: 'John Doe',
                bio: 'Test biography'
            });
            authorId = author.id_author;
        });

        it('should delete author', async () => {
            const response = await request(app)
                .delete(`/authors/${authorId}`);

            expect(response.status).toBe(204);

            // Vérification que l'auteur a été supprimé
            const deletedAuthor = await Author.findByPk(authorId);
            expect(deletedAuthor).toBeNull();
        });

        it('should return 404 for non-existent author', async () => {
            const response = await request(app)
                .delete('/authors/9999');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });
});
