/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, MockedFunction } from 'vitest';
import { Response, NextFunction } from 'express';
import { getAllUsers, getUserById, getMyProfile, updateMyProfile, deleteMyAccount, getUserStats } from '../../../src/controllers/user.controller.js';
import { UserService } from '../../../src/services/user.service.js';
import { AuthenticatedRequest, TypedRequest } from '../../../src/types/express.js';

// Mock du UserService
vi.mock('../../../src/services/user.service.js', () => ({
    UserService: vi.fn()
}));

describe('User Controller - Tests from scratch', () => {
    let mockUserService: any;
    let MockUserServiceConstructor: MockedFunction<any>;
    let mockReq: any;
    let mockRes: any;
    let mockNext: NextFunction;
    let mockJson: MockedFunction<any>;
    let mockStatus: MockedFunction<any>;

    beforeEach(() => {
        // Reset des mocks
        vi.clearAllMocks();

        // Mock du service
        mockUserService = {
            findAll: vi.fn(),
            findById: vi.fn(),
            findProfileById: vi.fn(),
            updateProfile: vi.fn(),
            delete: vi.fn(),
            getUserStats: vi.fn()
        };

        MockUserServiceConstructor = vi.mocked(UserService);
        MockUserServiceConstructor.mockImplementation(() => mockUserService);

        // Mock de la response Express
        mockJson = vi.fn();
        mockStatus = vi.fn().mockReturnValue({ json: mockJson });
        mockRes = {
            json: mockJson,
            status: mockStatus
        } as unknown as Response;

        // Mock du next
        mockNext = vi.fn();
    });

    describe('getAllUsers', () => {
        beforeEach(() => {
            mockReq = {
                user: { id_user: 1, username: 'testuser' },
                query: { page: 1, limit: 10 }
            } as AuthenticatedRequest<any, any, any>;
        });

        it('should return paginated users successfully', async () => {
            const mockResult = {
                users: [
                    { id_user: 1, username: 'user1', email: 'user1@test.com' },
                    { id_user: 2, username: 'user2', email: 'user2@test.com' }
                ],
                pagination: {
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: 2,
                    itemsPerPage: 10
                }
            };

            mockUserService.findAll.mockResolvedValue(mockResult);

            await getAllUsers(mockReq, mockRes, mockNext);

            expect(mockUserService.findAll).toHaveBeenCalledWith(mockReq.query);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockResult.users,
                pagination: mockResult.pagination
            });
        });

        it('should return 401 if user is not authenticated', async () => {
            mockReq.user = null;

            await getAllUsers(mockReq, mockRes, mockNext);

            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Utilisateur non authentifie'
            });
            expect(mockUserService.findAll).not.toHaveBeenCalled();
        });

        it('should handle service errors', async () => {
            const error = new Error('Database error');
            mockUserService.findAll.mockRejectedValue(error);

            await getAllUsers(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('getUserById', () => {
        beforeEach(() => {
            mockReq = {
                params: { id: 1 }
            } as TypedRequest<any, any>;
        });

        it('should return user by id successfully', async () => {
            const mockUser = {
                id_user: 1,
                username: 'testuser',
                email: 'test@example.com'
            };

            mockUserService.findById.mockResolvedValue(mockUser);

            await getUserById(mockReq, mockRes, mockNext);

            expect(mockUserService.findById).toHaveBeenCalledWith(1);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockUser
            });
        });

        it('should return 404 if user not found', async () => {
            mockUserService.findById.mockResolvedValue(null);

            await getUserById(mockReq, mockRes, mockNext);

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Utilisateur non trouve'
            });
        });

        it('should handle service errors', async () => {
            const error = new Error('Database error');
            mockUserService.findById.mockRejectedValue(error);

            await getUserById(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });

    describe('getMyProfile', () => {
        beforeEach(() => {
            mockReq = {
                user: { id_user: 1, username: 'testuser' }
            } as AuthenticatedRequest;
        });

        it('should return user profile successfully', async () => {
            const mockProfile = {
                id_user: 1,
                username: 'testuser',
                email: 'test@example.com',
                firstname: 'Test',
                lastname: 'User'
            };

            mockUserService.findProfileById.mockResolvedValue(mockProfile);

            await getMyProfile(mockReq, mockRes, mockNext);

            expect(mockUserService.findProfileById).toHaveBeenCalledWith(1);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockProfile
            });
        });

        it('should return 401 if user is not authenticated', async () => {
            mockReq.user = null;

            await getMyProfile(mockReq, mockRes, mockNext);

            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Utilisateur non authentifie'
            });
            expect(mockUserService.findProfileById).not.toHaveBeenCalled();
        });

        it('should return 404 if user profile not found', async () => {
            mockUserService.findProfileById.mockResolvedValue(null);

            await getMyProfile(mockReq, mockRes, mockNext);

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Utilisateur non trouve'
            });
        });
    });

    describe('updateMyProfile', () => {
        beforeEach(() => {
            mockReq = {
                user: { id_user: 1, username: 'testuser' },
                body: {
                    firstname: 'Updated',
                    lastname: 'User'
                }
            } as AuthenticatedRequest<any>;
        });

        it('should update user profile successfully', async () => {
            const mockUpdatedUser = {
                id_user: 1,
                username: 'testuser',
                firstname: 'Updated',
                lastname: 'User',
                email: 'test@example.com'
            };

            mockUserService.updateProfile.mockResolvedValue(mockUpdatedUser);

            await updateMyProfile(mockReq, mockRes, mockNext);

            expect(mockUserService.updateProfile).toHaveBeenCalledWith(1, mockReq.body);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockUpdatedUser,
                message: 'Profil mis a jour avec succes'
            });
        });

        it('should return 401 if user is not authenticated', async () => {
            mockReq.user = null;

            await updateMyProfile(mockReq, mockRes, mockNext);

            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Utilisateur non authentifie'
            });
            expect(mockUserService.updateProfile).not.toHaveBeenCalled();
        });

        it('should return 404 if user not found', async () => {
            mockUserService.updateProfile.mockResolvedValue(null);

            await updateMyProfile(mockReq, mockRes, mockNext);

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Utilisateur non trouve'
            });
        });
    });

    describe('deleteMyAccount', () => {
        beforeEach(() => {
            mockReq = {
                user: { id_user: 1, username: 'testuser' }
            } as AuthenticatedRequest;
        });

        it('should delete user account successfully', async () => {
            mockUserService.delete.mockResolvedValue(true);

            await deleteMyAccount(mockReq, mockRes, mockNext);

            expect(mockUserService.delete).toHaveBeenCalledWith(1);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Compte supprime avec succes'
            });
        });

        it('should return 401 if user is not authenticated', async () => {
            mockReq.user = null;

            await deleteMyAccount(mockReq, mockRes, mockNext);

            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Utilisateur non authentifie'
            });
            expect(mockUserService.delete).not.toHaveBeenCalled();
        });

        it('should return 404 if user not found', async () => {
            mockUserService.delete.mockResolvedValue(false);

            await deleteMyAccount(mockReq, mockRes, mockNext);

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Utilisateur non trouve'
            });
        });
    });

    describe('getUserStats', () => {
        beforeEach(() => {
            mockReq = {
                user: { id_user: 1, username: 'testuser' },
                params: { id: 2 }
            } as AuthenticatedRequest<any, any>;
        });

        it('should return user stats successfully', async () => {
            const mockStats = {
                totalBooks: 15,
                totalLibraries: 3,
                totalRatings: 12,
                averageRating: 4.2,
                favoriteGenres: ['Fantasy', 'Science-Fiction']
            };

            mockUserService.getUserStats.mockResolvedValue(mockStats);

            await getUserStats(mockReq, mockRes, mockNext);

            expect(mockUserService.getUserStats).toHaveBeenCalledWith(2);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                data: mockStats
            });
        });

        it('should return 401 if user is not authenticated', async () => {
            mockReq.user = null;

            await getUserStats(mockReq, mockRes, mockNext);

            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Utilisateur non authentifie'
            });
            expect(mockUserService.getUserStats).not.toHaveBeenCalled();
        });

        it('should return 404 if user stats not found', async () => {
            mockUserService.getUserStats.mockResolvedValue(null);

            await getUserStats(mockReq, mockRes, mockNext);

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Utilisateur non trouve'
            });
        });

        it('should handle service errors', async () => {
            const error = new Error('Database error');
            mockUserService.getUserStats.mockRejectedValue(error);

            await getUserStats(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
});
