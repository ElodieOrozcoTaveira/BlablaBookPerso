import { Response, NextFunction } from 'express';
import {
    UserSearchQuery,
    UserParams,
    UpdateProfileInput,
    PatchProfileInput,
    ChangePasswordInput,
    CreateUserInput,
    LoginInput
} from '../validation/user.zod.js';
import { UserService } from '../services/user.service.js';
import { TypedRequest, PaginatedResponse, ApiResponse, AuthenticatedRequest } from '../types/express.js';
import User from '../models/User.js';
import Role from '../models/Role.js';
import UserRole from '../models/UserRole.js';
import * as argon2 from 'argon2';
import { createAuthenticatedSession } from '../middleware/session.js';
import { Op } from 'sequelize';

/**
 * Inscription d un nouvel utilisateur
 */
export const registerUser = async (
    req: TypedRequest<CreateUserInput>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        console.log('Debut inscription:', req.body.email);

// Je verifie si l email ou le username existe deja
        const existingUserByEmail = await User.findOne({
            where: { email: req.body.email }
        });

        if (existingUserByEmail) {
            console.log('Email deja utilise:', req.body.email);
            res.status(409).json({
                success: false,
                message: 'Cet email est deja utilise par un autre compte'
            });
            return;
        }

        const existingUserByUsername = await User.findOne({
            where: { username: req.body.username }
        });

        if (existingUserByUsername) {
            console.log('Username deja utilise:', req.body.username);
            res.status(409).json({
                success: false,
                message: 'Ce nom d utilisateur est deja pris'
            });
            return;
        }

// Je hash le mot de passe
        const hashedPassword = await argon2.hash(req.body.password);

// Je cree l utilisateur
        const user = await User.create({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        });

// J assigne le role user par defaut
        const userRole = await Role.findOne({ where: { name: 'user' } });
        console.log('Role trouve:', userRole?.dataValues);
        if (userRole) {
            const roleId = userRole.get('id_role') as number;
            console.log('Creation UserRole:', { id_user: user.id_user, id_role: roleId });
            await UserRole.create({
                id_user: user.id_user,
                id_role: roleId
            });
            console.log('Role user assigne');
        } else {
            console.log('Role user non trouve !');
        }

// Je cree la session automatiquement apres inscription
        await createAuthenticatedSession(req, {
            id_user: user.id_user,
            email: user.email,
            username: user.username
        });

        console.log('Inscription reussie et session creee:', user.username);

        res.status(201).json({
            success: true,
            message: 'Inscription reussie. Vous etes maintenant connecte.',
            data: {
                user: {
                    id_user: user.id_user,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    username: user.username,
                    email: user.email
                }
            }
        });
    } catch (error) {
        console.error('Erreur lors de l inscription:', error);
        next(error);
    }
};

export const getAllUsers = async (
    req: AuthenticatedRequest<any, any, UserSearchQuery>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Utilisateur non authentifie'
            });
            return;
        }

        const userService = new UserService();
        const result = await userService.findAll(req.query);

        const response: PaginatedResponse = {
            success: true,
            data: result.users,
            pagination: result.pagination
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};

export const getUserById = async (
    req: TypedRequest<any, UserParams>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const userService = new UserService();
        const user = await userService.findById(id);

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Utilisateur non trouve'
            });
            return;
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

export const getMyProfile = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Utilisateur non authentifie'
            });
            return;
        }

        const userService = new UserService();
        const user = await userService.findProfileById(req.user.id_user);

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Utilisateur non trouve'
            });
            return;
        }

        const response: ApiResponse = {
            success: true,
            data: user
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};

export const updateMyProfile = async (
    req: AuthenticatedRequest<UpdateProfileInput>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Utilisateur non authentifie'
            });
            return;
        }

        const userService = new UserService();
        const user = await userService.updateProfile(req.user.id_user, req.body);

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Utilisateur non trouve'
            });
            return;
        }

        const response: ApiResponse = {
            success: true,
            data: user,
            message: 'Profil mis a jour avec succes'
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};

export const patchMyProfile = async (
    req: AuthenticatedRequest<PatchProfileInput>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Utilisateur non authentifie'
            });
            return;
        }

        const userService = new UserService();
        const user = await userService.updateProfile(req.user.id_user, req.body);

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Utilisateur non trouve'
            });
            return;
        }

        const response: ApiResponse = {
            success: true,
            data: user,
            message: 'Profil partiellement mis a jour avec succes'
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};

export const changeMyPassword = async (
    req: AuthenticatedRequest<ChangePasswordInput>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Utilisateur non authentifie'
            });
            return;
        }

        const { current_password, new_password } = req.body;

// Je recupere l utilisateur avec son mot de passe
        const user = await User.findOne({
            where: { id_user: req.user.id_user },
            attributes: ['id_user', 'email', 'password']
        });

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Utilisateur non trouve'
            });
            return;
        }

// Je verifie l ancien mot de passe
        const isCurrentPasswordValid = await argon2.verify(user.password, current_password);
        if (!isCurrentPasswordValid) {
            res.status(400).json({
                success: false,
                message: 'Mot de passe actuel incorrect'
            });
            return;
        }

// Je hash le nouveau mot de passe
        const hashedNewPassword = await argon2.hash(new_password);

// Je mets a jour le mot de passe
        await user.update({
            password: hashedNewPassword
        });

        const response: ApiResponse = {
            success: true,
            message: 'Mot de passe mis a jour avec succes'
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};

export const deleteMyAccount = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Utilisateur non authentifie'
            });
            return;
        }

        const userService = new UserService();
        const deleted = await userService.delete(req.user.id_user);

        if (!deleted) {
            res.status(404).json({
                success: false,
                message: 'Utilisateur non trouve'
            });
            return;
        }

        const response: ApiResponse = {
            success: true,
            message: 'Compte supprime avec succes'
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};

export const getUserStats = async (
    req: AuthenticatedRequest<any, UserParams>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Utilisateur non authentifie'
            });
            return;
        }

        const { id } = req.params;
        const userService = new UserService();
        const result = await userService.getUserStats(id);

        if (!result) {
            res.status(404).json({
                success: false,
                message: 'Utilisateur non trouve'
            });
            return;
        }

        const response: ApiResponse = {
            success: true,
            data: result
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};