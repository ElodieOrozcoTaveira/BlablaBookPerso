import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import {
    LibrarySearchQuery,
    LibraryParams,
    CreateLibraryInput,
    UpdateLibraryInput
} from '../validation/library.zod.js';
import Library from '../models/Library.js';
import User from '../models/User.js';
import Book from '../models/Book.js';
import { TypedRequest, PaginatedResponse, ApiResponse, AuthenticatedRequest } from '../types/express.js';

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
            id_user: req.user.id_user
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

// Filtre par utilisateur
        if (req.query.user_id !== undefined) {
            where['id_user'] = req.query.user_id;
        }

        const offset = (page - 1) * limit;

        const { rows: libraries, count: total } = await Library.findAndCountAll({
            where,
            attributes: ['id_library', 'name', 'description', 'is_public', 'id_user', 'created_at', 'updated_at'],
            include: [{
                model: User,
                as: 'LibraryBelongsToUser',
                attributes: ['id_user', 'username', 'firstname', 'lastname']
            }],
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
            attributes: ['id_library', 'name', 'description', 'is_public', 'id_user', 'created_at', 'updated_at'],
            include: [
                {
                    model: User,
                    as: 'LibraryBelongsToUser',
                    attributes: ['id_user', 'username', 'firstname', 'lastname']
                },
                {
                    model: Book,
                    as: 'LibraryHasBooks',
                    attributes: ['id_book', 'title', 'isbn', 'publication_year'],
                    through: {
                        attributes: ['status', 'created_at'] // Inclut les champs de ReadingList
                    }
                }
            ]
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
        const updateData = req.body;
        const library: any = (req as any).library; // Injecté par requireOwnership
        if (!library) {
            res.status(500).json({ success: false, message: 'Contexte ownership manquant' });
            return;
        }
        const cleanData = Object.fromEntries(Object.entries(updateData).filter(([, v]) => v !== undefined));
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
            res.status(401).json({ success: false, message: 'Utilisateur non authentifie' });
            return;
        }
        let library: any = (req as any).library; // Injecté par requireOwnership normalement
        if (!library) {

// fallback legacy pour tests fresh: rechercher manuellement
            const { id } = req.params;
            library = await Library.findByPk(id);
            if (!library) {
                res.status(404).json({ success: false, message: 'Bibliotheque non trouvee' });
                return;
            }
// Vérification ownership minimale
            if (library.id_user !== req.user.id_user && !(req.user as any).is_admin) {
                res.status(403).json({ success: false, message: 'Acces refuse' });
                return;
            }
        }
        await library.destroy();
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
            where: { id_user: req.user.id_user },
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