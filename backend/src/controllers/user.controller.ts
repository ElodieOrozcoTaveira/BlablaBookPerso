import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import {
  UserSearchQuery,
  UserParams,
  UpdateProfileInput
} from '../validation/user.zod';
import User from '../models/User';
import Role from '../models/Role';
import Permission from '../models/Permission';
import Library from '../models/Library';
import Notice from '../models/Notice';
import Rate from '../models/Rate';
import { TypedRequest, PaginatedResponse, ApiResponse } from '../types/express';

// Interface pour les requetes authentifiees (pour l'auth middleware)
interface AuthenticatedRequest<Body = any, Params extends Record<string, any> = Record<string, any>, Query = any> extends TypedRequest<Body, Params, Query> {
    user?: {
        id: string;
        email: string;
        name: string;
        roles: string[];
        permissions: string[];
    };
}

export const getAllUsers = async (
    req: TypedRequest<any, any, UserSearchQuery>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // req.query deja valide par middleware
        const { page, limit, query, email, username } = req.query;

        const where: Record<string, any> = {};

        // Recherche generale dans plusieurs champs
        if (query) {
            where[Op.or as any] = [
                { firstname: { [Op.iLike]: `%${query}%` } },
                { lastname: { [Op.iLike]: `%${query}%` } },
                { username: { [Op.iLike]: `%${query}%` } },
                { email: { [Op.iLike]: `%${query}%` } }
            ];
        }

        // Recherche specifique par email
        if (email) {
            where['email'] = { [Op.iLike]: `%${email}%` };
        }

        // Recherche specifique par username
        if (username) {
            where['username'] = { [Op.iLike]: `%${username}%` };
        }

        const offset = (page - 1) * limit;

        const { rows: users, count: total } = await User.findAndCountAll({
            where,
            attributes: ['id_user', 'firstname', 'lastname', 'username', 'email', 'created_at', 'connected_at'],
            include: [{
                model: Role,
                as: 'Roles',
                attributes: ['id_role', 'name'],
                through: { attributes: [] }
            }],
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });
        
        const totalPages = Math.ceil(total / limit);

        const response: PaginatedResponse = {
            success: true,
            data: users,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
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
        // req.params deja valide par middleware
        const { id } = req.params;
        
        const user = await User.findByPk(id, {
            attributes: ['id_user', 'firstname', 'lastname', 'username', 'email', 'created_at', 'connected_at'],
            include: [{
                model: Role,
                as: 'Roles',
                attributes: ['id_role', 'name'],
                through: { attributes: [] }
            }]
        });

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
        
        const user = await User.findByPk(req.user.id, {
            attributes: ['id_user', 'firstname', 'lastname', 'username', 'email', 'created_at', 'connected_at'],
            include: [{
                model: Role,
                as: 'Roles',
                attributes: ['id_role', 'name'],
                through: { attributes: [] },
                include: [{
                    model: Permission,
                    as: 'Permissions',
                    attributes: ['label'],
                    through: { attributes: [] }
                }]
            }]
        });
        
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
        
        // req.body deja valide par middleware
        const validatedData = req.body;
        
        const user = await User.findByPk(req.user.id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Utilisateur non trouve'
            });
            return;
        }
        
        // Construire les donnees de mise a jour
        const updateData = Object.fromEntries(
            Object.entries(validatedData).filter(([, value]) => value !== undefined)
        );
        
        await user.update(updateData);
        
        // Recharger l'utilisateur avec les nouvelles donnees
        const updatedUser = await User.findByPk(req.user.id, {
            attributes: ['id_user', 'firstname', 'lastname', 'username', 'email', 'created_at', 'connected_at']
            // TODO: include roles quand setupAssociations sera configure
        });
        
        const response: ApiResponse = {
            success: true,
            data: updatedUser,
            message: 'Profil mis a jour avec succes'
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
        
        const user = await User.findByPk(req.user.id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Utilisateur non trouve'
            });
            return;
        }
        
        await user.destroy();
        
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
    req: TypedRequest<any, UserParams>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // req.params deja valide par middleware
        const { id } = req.params;
        
        const user = await User.findByPk(id, {
            attributes: ['id_user', 'firstname', 'lastname', 'username']
        });
        
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Utilisateur non trouve'
            });
            return;
        }
        
        const [librariesCount, noticesCount, ratesCount] = await Promise.all([
            Library.count({ where: { id_user: id } }),
            Notice.count({ where: { id_user: id } }),
            Rate.count({ where: { id_user: id } })
        ]);
        
        const response: ApiResponse = {
            success: true,
            data: {
                user: {
                    id: user.id_user,
                    name: `${user.firstname} ${user.lastname}`,
                    username: user.username
                },
                stats: {
                    librariesCount,
                    noticesCount,
                    ratesCount
                }
            }
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};