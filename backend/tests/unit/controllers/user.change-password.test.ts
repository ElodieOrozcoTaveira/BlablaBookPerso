import { describe, it, expect, vi, beforeEach } from 'vitest';
import { changeMyPassword } from '../../../src/controllers/user.controller.js';
import User from '../../../src/models/User.js';
import * as argon2 from 'argon2';

// Environnement strict sans DB
process.env.UNIT_NO_DB = 'true';

// Mock des dépendances
vi.mock('../../../src/models/User.js');
vi.mock('argon2');

describe('changeMyPassword Controller', () => {
    let mockReq: any;
    let mockRes: any;
    let mockNext: any;

    beforeEach(() => {
        mockReq = {
            user: { id_user: 1 },
            body: {
                current_password: 'OldPassword123@',
                new_password: 'NewPassword456@',
                confirm_password: 'NewPassword456@'
            }
        };
        mockRes = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };
        mockNext = vi.fn();

        // Reset mocks
        vi.clearAllMocks();
    });

    it('should return 401 when user is not authenticated', async () => {
        mockReq.user = null;

        await changeMyPassword(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'Utilisateur non authentifie'
        });
    });

    it('should return 404 when user is not found', async () => {
        (User.findOne as any).mockResolvedValue(null);

        await changeMyPassword(mockReq, mockRes, mockNext);

        expect(User.findOne).toHaveBeenCalledWith({
            where: { id_user: 1 },
            attributes: ['id_user', 'email', 'password']
        });
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'Utilisateur non trouve'
        });
    });

    it('should return 400 when current password is incorrect', async () => {
        const mockUser = {
            id_user: 1,
            email: 'test@example.com',
            password: 'hashedOldPassword'
        };
        (User.findOne as any).mockResolvedValue(mockUser);
        (argon2.verify as any).mockResolvedValue(false); // Mot de passe incorrect

        await changeMyPassword(mockReq, mockRes, mockNext);

        expect(argon2.verify).toHaveBeenCalledWith('hashedOldPassword', 'OldPassword123@');
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: 'Mot de passe actuel incorrect'
        });
    });

    it('should successfully change password when all validations pass', async () => {
        const mockUser = {
            id_user: 1,
            email: 'test@example.com',
            password: 'hashedOldPassword',
            update: vi.fn().mockResolvedValue(true)
        };
        (User.findOne as any).mockResolvedValue(mockUser);
        (argon2.verify as any).mockResolvedValue(true); // Mot de passe correct
        (argon2.hash as any).mockResolvedValue('hashedNewPassword');

        await changeMyPassword(mockReq, mockRes, mockNext);

        expect(argon2.verify).toHaveBeenCalledWith('hashedOldPassword', 'OldPassword123@');
        expect(argon2.hash).toHaveBeenCalledWith('NewPassword456@');
        expect(mockUser.update).toHaveBeenCalledWith({
            password: 'hashedNewPassword'
        });
        expect(mockRes.json).toHaveBeenCalledWith({
            success: true,
            message: 'Mot de passe mis a jour avec succes'
        });
    });

    it('should call next with error when database operation fails', async () => {
        const error = new Error('Database error');
        (User.findOne as any).mockRejectedValue(error);

        await changeMyPassword(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should call next with error when password verification fails', async () => {
        const mockUser = {
            id_user: 1,
            email: 'test@example.com',
            password: 'hashedOldPassword'
        };
        const error = new Error('Argon2 error');
        (User.findOne as any).mockResolvedValue(mockUser);
        (argon2.verify as any).mockRejectedValue(error);

        await changeMyPassword(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should call next with error when password hashing fails', async () => {
        const mockUser = {
            id_user: 1,
            email: 'test@example.com',
            password: 'hashedOldPassword',
            update: vi.fn()
        };
        const error = new Error('Hashing error');
        (User.findOne as any).mockResolvedValue(mockUser);
        (argon2.verify as any).mockResolvedValue(true);
        (argon2.hash as any).mockRejectedValue(error);

        await changeMyPassword(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(error);
    });
});