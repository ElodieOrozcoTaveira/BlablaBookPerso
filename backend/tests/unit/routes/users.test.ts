import request from 'supertest';
import express from 'express';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { mockAuthenticateToken, mockRequirePermission } from '../../utils/auth-mocks.js';
import { getAllUsers, getUserById } from '../../../src/controllers/user.controller';

// Mock des middleware d'authentification et d'autorisation
jest.mock('../../../src/middleware/auth.js', () => ({
    authenticateToken: mockAuthenticateToken()
}));

jest.mock('../../../src/middleware/permission.js', () => ({
    requirePermission: mockRequirePermission()
}));

jest.mock('../../../src/controllers/user.controller');

const mockGetAllUsers = getAllUsers as jest.Mock;
const mockGetUserById = getUserById as jest.Mock;

describe('User Routes', () => {
    let app: express.Application;

    beforeEach(() => {
        jest.clearAllMocks();

        mockGetAllUsers.mockImplementation(async (req: any, res: any) => {
            res.json({
                success: true,
                data: [{ id_user: 1, firstname: 'John', lastname: 'Doe' }],
                pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
            });
        });

        mockGetUserById.mockImplementation(async (req: any, res: any) => {
            res.json({
                success: true,
                data: { id_user: 1, firstname: 'John', lastname: 'Doe' }
            });
        });

        app = express();
        app.use(express.json());

        const userRoutes = require('../../../src/routes/users').default;
        app.use('/users', userRoutes);
    });

    describe('GET /users', () => {
        it('should get all users', async () => {
            const response = await request(app).get('/users');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(mockGetAllUsers).toHaveBeenCalled();
        });
    });

    describe('GET /users/:id', () => {
        it('should get user by id', async () => {
            const response = await request(app).get('/users/1');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(mockGetUserById).toHaveBeenCalled();
        });
    });
});
