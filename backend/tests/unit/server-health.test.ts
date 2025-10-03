import request from 'supertest';
import { describe, it, test, expect, beforeAll, afterAll } from '@jest/globals';
import sequelize from '../../src/config/database';

describe('Server Health Check', () => {
    beforeAll(async () => {
        // S'assurer que la base est connectée
        try {
            await sequelize.authenticate();
            console.log('✅ Database connected for tests');
        } catch (error) {
            console.error('❌ Database connection failed:', error);
            throw error;
        }
    });

    afterAll(async () => {
        // Nettoyer après les tests
        await sequelize.close();
    });

    test('should respond to health check', async () => {
        // Test simple sans Better Auth pour vérifier que le serveur répond
        const { app } = await import('../../src/server');
        
        const response = await request(app)
            .get('/api/health')
            .expect(200);

        expect(response.body).toHaveProperty('message');
    });
});
