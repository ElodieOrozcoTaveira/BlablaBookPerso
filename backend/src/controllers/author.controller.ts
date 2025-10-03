import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import {
  AuthorSearchQuery,
  AuthorParams,
  CreateAuthorInput,
  UpdateAuthorInput
} from '../validation/author.zod.js';
import Author from '../models/Author.js';
import { TypedRequest, PaginatedResponse, ApiResponse, AuthenticatedRequest } from '../types/express.js';

export const createAuthor = async (
    req: AuthenticatedRequest<CreateAuthorInput>,
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
        const author = await Author.create(req.body);

        const response: ApiResponse = {
            success: true,
            data: author,
            message: 'Auteur cree avec succes'
        };
        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};

export const getAllAuthors = async (
    req: TypedRequest<any, any, AuthorSearchQuery>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // req.query deja valide, transforme et avec defaults par middleware
        const { page, limit, query, name, birth_year, death_year } = req.query;

        const where: Record<string, any> = {};

        // Priorite: name > query pour eviter les conflits
        const searchTerm = name || query;
        if (searchTerm) {
            where['name'] = { [Op.iLike]: `%${searchTerm}%` };
        }

        if (birth_year) {
            where['birth_year'] = birth_year;
        }
        if (death_year) {
            where['death_year'] = death_year;
        }

        const offset = (page - 1) * limit;

        const { rows: authors, count: total } = await Author.findAndCountAll({
            where,
            limit,
            offset,
            order: [['name', 'ASC']]
        });
        
        const totalPages = Math.ceil(total / limit);

        const response: PaginatedResponse = {
            success: true,
            data: authors,
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

export const getAuthorById = async (
    req: TypedRequest<any, AuthorParams>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // req.params deja valide et transforme par middleware
        const { id } = req.params;
        const author = await Author.findByPk(id);

        if (!author) {
            res.status(404).json({
                success: false,
                message: 'Auteur non trouve'
            });
            return;
        }

        res.json({
            success: true,
            data: author
        });
    } catch (error) {
        next(error);
    }
};

export const updateAuthor = async (
    req: AuthenticatedRequest<UpdateAuthorInput, AuthorParams>,
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
        
        const author = await Author.findByPk(id);
        if (!author) {
            res.status(404).json({
                success: false,
                message: 'Auteur non trouve'
            });
            return;
        }

        // Filtre les valeurs undefined (Zod .partial() peut en creer)
        const cleanData = Object.fromEntries(
            Object.entries(updateData).filter(([, value]) => value !== undefined)
        );

        await author.update(cleanData);
        await author.reload(); // Recharge pour avoir les donnees fraiches

        res.json({
            success: true,
            data: author,
            message: 'Auteur mis a jour avec succes'
        });
    } catch (error) {
        next(error);
    }
};

export const deleteAuthor = async (
    req: AuthenticatedRequest<any, AuthorParams>,
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
        const author = await Author.findByPk(id);

        if (!author) {
            res.status(404).json({
                success: false,
                message: 'Auteur non trouve'
            });
            return;
        }

        await author.destroy();

        // 204 No Content pour DELETE reussi
        res.status(204).end();
    } catch (error) {
        next(error);
    }
};
