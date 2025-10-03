import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import {
    LibrarySearchQuery,
    LibraryParams,
    CreateLibraryInput,
    UpdateLibraryInput
} from '../validation/library.zod';
import Library from '../models/Library';
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

export const createLibrary = async (
    req: AuthenticatedRequest<CreateLibraryInput>,
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
        const libraryData = {
            ...req.body,
            id_user: parseInt(req.user.id)
        };

        const library = await Library.create(libraryData);

        const response: ApiResponse = {
            success: true,
            data: library,
            message: 'Bibliotheque creee avec succes'
        };
        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};

export const getAllLibraries = async (
    req: TypedRequest<any, any, LibrarySearchQuery>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // req.query deja valide par middleware
        const { page, limit, query, is_public } = req.query;

        const where: Record<string, any> = {};

        // Recherche par nom
        if (query) {
            where[Op.or as any] = [
                { name: { [Op.iLike]: `%${query}%` } },
                { description: { [Op.iLike]: `%${query}%` } }
            ];
        }

        // Filtre par visibilite
        if (is_public !== undefined) {
            where['is_public'] = is_public;
        }

        // Filtre par utilisateur (user_id n'existe pas dans le schema)
        // TODO: ajouter user_id au schema si nécessaire

        const offset = (page - 1) * limit;

        const { rows: libraries, count: total } = await Library.findAndCountAll({
            where,
            attributes: ['id_library', 'name', 'description', 'is_public', 'id_user', 'created_at', 'updated_at'],
            // TODO: include User quand setupAssociations sera configure
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });
        
        const totalPages = Math.ceil(total / limit);

        const response: PaginatedResponse = {
            success: true,
            data: libraries,
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

export const getLibraryById = async (
    req: TypedRequest<any, LibraryParams>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // req.params deja valide par middleware
        const { id } = req.params;
        
        const library = await Library.findByPk(id, {
            attributes: ['id_library', 'name', 'description', 'is_public', 'id_user', 'created_at', 'updated_at']
            // TODO: include User et Books quand setupAssociations sera configure
        });

        if (!library) {
            res.status(404).json({
                success: false,
                message: 'Bibliotheque non trouvee'
            });
            return;
        }

        const response: ApiResponse = {
            success: true,
            data: library
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};

export const updateLibrary = async (
    req: AuthenticatedRequest<UpdateLibraryInput, LibraryParams>,
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

        // req.params et req.body deja valides par middlewares
        const { id } = req.params;
        const updateData = req.body;
        
        const library = await Library.findByPk(id);
        if (!library) {
            res.status(404).json({
                success: false,
                message: 'Bibliotheque non trouvee'
            });
            return;
        }

        // Verifier que l'utilisateur est proprietaire
        if (library.id_user !== parseInt(req.user.id)) {
            res.status(403).json({
                success: false,
                message: 'Vous ne pouvez modifier que vos propres bibliotheques'
            });
            return;
        }

        // Mettre a jour seulement les champs fournis
        const cleanData = Object.fromEntries(
            Object.entries(updateData).filter(([, value]) => value !== undefined)
        );
        await library.update(cleanData);

        const response: ApiResponse = {
            success: true,
            data: library,
            message: 'Bibliotheque mise a jour avec succes'
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};

export const deleteLibrary = async (
    req: AuthenticatedRequest<any, LibraryParams>,
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

        // req.params deja valide par middleware
        const { id } = req.params;
        
        const library = await Library.findByPk(id);
        if (!library) {
            res.status(404).json({
                success: false,
                message: 'Bibliotheque non trouvee'
            });
            return;
        }

        // Verifier que l'utilisateur est proprietaire
        if (library.id_user !== parseInt(req.user.id)) {
            res.status(403).json({
                success: false,
                message: 'Vous ne pouvez supprimer que vos propres bibliotheques'
            });
            return;
        }

        await library.destroy();

        // 204 No Content pour DELETE reussi
        res.status(204).end();
    } catch (error) {
        next(error);
    }
};

export const getMyLibraries = async (
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

        const libraries = await Library.findAll({
            where: { id_user: parseInt(req.user.id) },
            attributes: ['id_library', 'name', 'description', 'is_public', 'created_at', 'updated_at'],
            order: [['created_at', 'DESC']]
        });

        const response: ApiResponse = {
            success: true,
            data: libraries
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};