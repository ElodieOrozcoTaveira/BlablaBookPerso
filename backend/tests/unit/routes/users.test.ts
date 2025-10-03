import request from 'supertest';
import express from 'express';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { mockAuthenticateToken, mockRequirePermission } from '../../utils/auth-mocks.js';

// Mock des controllers avec vi.fn()
const mockGetAllUsers = vi.fn((req, res) => res.status(200).json({ success: true, data: [] }));
const mockGetUserById = vi.fn((req, res) => res.status(200).json({ success: true, data: { id_user: 1 } }));
const mockCreateUser = vi.fn((req, res) => res.status(201).json({ success: true, data: { id_user: 1 } }));
const mockUpdateUser = vi.fn((req, res) => res.status(200).json({ success: true, data: { id_user: 1 } }));
const mockDeleteUser = vi.fn((req, res) => res.status(200).json({ success: true, message: 'Deleted' }));
const mockGetUserStats = vi.fn((req, res) => res.status(200).json({ success: true, data: { totalBooks: 5, totalRatings: 10 } }));
const mockGetMyProfile = vi.fn((req, res) => res.status(200).json({ success: true, data: { id_user: 1, username: 'test' } }));
const mockUpdateMyProfile = vi.fn((req, res) => res.status(200).json({ success: true, data: { id_user: 1, username: 'test' } }));
const mockDeleteMyAccount = vi.fn((req, res) => res.status(200).json({ success: true, message: 'Account deleted' }));

// Mock des middleware d'authentification et d'autorisation
vi.mock('../../../src/middleware/auth.js', () => ({
    authenticateToken: mockAuthenticateToken()
}));

vi.mock('../../../src/middleware/permission.js', () => ({
    requirePermission: mockRequirePermission()
}));

// Mock des middlewares de validation
vi.mock('../../../src/middleware/validation.js', () => ({
    validateBody: vi.fn(() => (req: any, res: any, next: any) => next()),
    validateParams: vi.fn(() => (req: any, res: any, next: any) => next()),
    validateQuery: vi.fn(() => (req: any, res: any, next: any) => next())
}));

// Mock du module controller
vi.mock('../../../src/controllers/user.controller.js', () => ({
    createUser: mockCreateUser,
    registerUser: vi.fn((req:any,res:any)=>res.status(201).json({success:true})),
    getAllUsers: mockGetAllUsers,
    getUserById: mockGetUserById,
    updateUser: mockUpdateUser,
    deleteUser: mockDeleteUser,
    getUserStats: mockGetUserStats,
    getMyProfile: mockGetMyProfile,
    updateMyProfile: mockUpdateMyProfile,
    deleteMyAccount: mockDeleteMyAccount
}));

describe('User Routes', () => {
    let app: express.Application;

    beforeEach(async () => {
    vi.clearAllMocks();

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

        const { default: userRoutes } = await import("../../../src/routes/users.js");
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
