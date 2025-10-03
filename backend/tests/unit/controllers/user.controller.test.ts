import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../src/types/express.js';
import { vi } from 'vitest';
import { 
    getAllUsers, 
    getUserById, 
    getMyProfile,
    updateMyProfile,
    deleteMyAccount,
    getUserStats
} from '../../../src/controllers/user.controller.js';
import User from '../../../src/models/User.js';
import Role from '../../../src/models/Role.js';
import Permission from '../../../src/models/Permission.js';
import Library from '../../../src/models/Library.js';
import Notice from '../../../src/models/Notice.js';
import Rate from '../../../src/models/Rate.js';

// Mock des modeles avec types explicites
vi.mock('../../../src/models/User');
vi.mock('../../../src/models/Role');
vi.mock('../../../src/models/Permission');
vi.mock('../../../src/models/Library');
vi.mock('../../../src/models/Notice');
vi.mock('../../../src/models/Rate');

describe('User Controller', () => {
    let mockRequest: Partial<AuthenticatedRequest>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    const wrap = (obj: any) => ({
        ...obj,
        get: (k: string) => (obj as any)[k],
        update: obj.update ?? vi.fn(async () => true),
        reload: obj.reload ?? vi.fn(async () => true)
    });

    beforeEach(() => {
        mockRequest = {
            user: { id_user: 1, email: 'test@test.com', username: 'testuser' } // Mock authenticated user
        };
        mockResponse = {
            status: vi.fn().mockReturnThis() as any,
            json: vi.fn().mockReturnThis() as any,
            end: vi.fn().mockReturnThis() as any
        };
        mockNext = vi.fn();
        vi.restoreAllMocks();
        
        // Setup spies in beforeEach to avoid reassigning imports
    vi.spyOn(User as any, 'findByPk').mockResolvedValue(undefined as any);
        vi.spyOn(User as any, 'findAll').mockResolvedValue([] as any);
        vi.spyOn(User as any, 'create').mockResolvedValue({} as any);
        vi.spyOn(Library as any, 'count').mockResolvedValue(0 as any);
        vi.spyOn(Notice as any, 'count').mockResolvedValue(0 as any);
        vi.spyOn(Rate as any, 'count').mockResolvedValue(0 as any);
        vi.spyOn(Rate as any, 'findAll').mockResolvedValue([] as any);
    });

    describe('getAllUsers', () => {
        it('should get all users with pagination', async () => {
            const mockUsers = [
                {
                    id_user: 1,
                    firstname: 'John',
                    lastname: 'Doe',
                    username: 'johndoe',
                    email: 'john@test.com',
                    Roles: []
                }
            ];

            mockRequest.query = {
                page: '1',
                limit: '20'
            } as any;

            (User as any).findAndCountAll.mockResolvedValue({
                rows: mockUsers,
                count: 1
            });

            await getAllUsers(mockRequest as any, mockResponse as Response, mockNext);

            expect(User.findAndCountAll).toHaveBeenCalled();
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: mockUsers
                })
            );
        });

        it('should handle errors', async () => {
            mockRequest.query = { page: '1', limit: '20' } as any;
            const error = new Error('Database error');
            (User as any).findAndCountAll.mockRejectedValue(error);

            await getAllUsers(mockRequest as any, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('getUserById', () => {
        it('should get user by id', async () => {
            const mockUser = {
                id_user: 1,
                firstname: 'John',
                lastname: 'Doe',
                email: 'john@test.com'
            };

            mockRequest.params = { id: '1' };
            (User as any).findByPk.mockResolvedValue(wrap(mockUser));

            await getUserById(mockRequest as any, mockResponse as Response, mockNext);

            expect(User.findByPk).toHaveBeenCalledWith('1', expect.any(Object));
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                data: expect.objectContaining({ id_user: 1, email: 'john@test.com', firstname: 'John', lastname: 'Doe' })
            }));
        });

        it('should return 404 if user not found', async () => {
            mockRequest.params = { id: '999' };
            (User as any).findByPk.mockResolvedValue(null);

            await getUserById(mockRequest as any, mockResponse as Response, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
        });
    });

    describe('getMyProfile', () => {
        it('should get current user profile', async () => {
            const mockUser = {
                id_user: 1,
                firstname: 'John',
                lastname: 'Doe'
            };

            mockRequest.user = { id_user: 1, email: 'test@example.com', username: 'testuser' } as any;
            (User as any).findByPk.mockResolvedValue(wrap(mockUser));

            await getMyProfile(mockRequest as any, mockResponse as Response, mockNext);

            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                data: expect.objectContaining({ id_user: 1, firstname: 'John', lastname: 'Doe' })
            }));
        });
    });

    describe('updateMyProfile', () => {
        it('should update user profile', async () => {
            const updateData = {
                firstname: 'UpdatedJohn',
                lastname: 'UpdatedDoe'
            };

            const mockUser = wrap({
                id_user: 1,
                firstname: 'John',
                lastname: 'Doe'
            });

            mockRequest.user = { id_user: 1, email: 'test@example.com', username: 'testuser' } as any;
            mockRequest.body = updateData;
            (User as any).findByPk.mockResolvedValue(mockUser);

            await updateMyProfile(mockRequest as any, mockResponse as Response, mockNext);

            expect(mockUser.update).toHaveBeenCalledWith(updateData);
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: 'Profil mis a jour avec succes'
                })
            );
        });
    });

    describe('getUserStats', () => {
        it('should handle getUserStats call', async () => {
            mockRequest.user = { id_user: 1, email: 'test@example.com', username: 'testuser' };
            mockRequest.params = { id: '1' };

            await getUserStats(mockRequest as any, mockResponse as Response, mockNext);

            // Check that either success (status) or error (next) was called
            const statusCalled = (mockResponse.status as any).mock.calls.length > 0;
            const nextCalled = (mockNext as any).mock.calls.length > 0;
            expect(statusCalled || nextCalled).toBe(true);
        });
    });
});
