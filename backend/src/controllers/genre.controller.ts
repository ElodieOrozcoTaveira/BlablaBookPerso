import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import {
  GenreSearchQuery,
  GenreParams,
  CreateGenreInput,
  UpdateGenreInput
} from '../validation/genre.zod.js';
import Genre from '../models/Genre.js';
import { TypedRequest, PaginatedResponse, ApiResponse, AuthenticatedRequest } from '../types/express.js';

export const createGenre = async (
    req: AuthenticatedRequest<CreateGenreInput>,
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

        // req.body deja valide et transforme par middleware validateBody()
        const genre = await Genre.create(req.body);

        const response: ApiResponse = {
            success: true,
            data: genre,
            message: 'Genre cree avec succes'
        };
        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};

export const getAllGenres = async (
    req: TypedRequest<any, any, GenreSearchQuery>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // req.query deja valide, transforme et avec defaults par middleware
        const { page, limit, query, name } = req.query;

        const where: Record<string, any> = {};

        // Priorite: name > query pour eviter les conflits
        const searchTerm = name || query;
        if (searchTerm) {
            where[Op.or as any] = [
                { name: { [Op.iLike]: `%${searchTerm}%` } },
                { description: { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }

        const offset = (page - 1) * limit;

        const { rows: genres, count: total } = await Genre.findAndCountAll({
            where,
            limit,
            offset,
            order: [['name', 'ASC']]
        });
        
        const totalPages = Math.ceil(total / limit);

        const response: PaginatedResponse = {
            success: true,
            data: genres,
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

export const getGenreById = async (
    req: TypedRequest<any, GenreParams>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // req.params deja valide et transforme par middleware
        const { id } = req.params;
        const genre = await Genre.findByPk(id);

        if (!genre) {
            res.status(404).json({
                success: false,
                message: 'Genre non trouve'
            });
            return;
        }

        res.json({
            success: true,
            data: genre
        });
    } catch (error) {
        next(error);
    }
};

export const updateGenre = async (
    req: AuthenticatedRequest<UpdateGenreInput, GenreParams>,
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
        
        const genre = await Genre.findByPk(id);
        if (!genre) {
            res.status(404).json({
                success: false,
                message: 'Genre non trouve'
            });
            return;
        }

        // Filtre les valeurs undefined (Zod .partial() peut en creer)
        const cleanData = Object.fromEntries(
            Object.entries(updateData).filter(([, value]) => value !== undefined)
        );

        await genre.update(cleanData);
        await genre.reload(); // Recharge pour avoir les donnees fraiches

        res.json({
            success: true,
            data: genre,
            message: 'Genre mis a jour avec succes'
        });
    } catch (error) {
        next(error);
    }
};

export const deleteGenre = async (
    req: AuthenticatedRequest<any, GenreParams>,
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
        const genre = await Genre.findByPk(id);

        if (!genre) {
            res.status(404).json({
                success: false,
                message: 'Genre non trouve'
            });
            return;
        }

        await genre.destroy();

        // 204 No Content pour DELETE reussi
        res.status(204).end();
    } catch (error) {
        next(error);
    }
};
