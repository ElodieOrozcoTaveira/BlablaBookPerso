import { Response, NextFunction } from 'express';
import {
    RateSearchQuery,
    RateParams,
    CreateRateInput,
    UpdateRateInput
} from '../validation/rate.zod';
import Rate from '../models/Rate';
import Book from '../models/Book';
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

export const createRate = async (
    req: AuthenticatedRequest<CreateRateInput>,
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
        const rateData = {
            ...req.body,
            id_user: parseInt(req.user.id)
        };

        // Verifier que le livre existe
        const book = await Book.findByPk(rateData.id_book);
        if (!book) {
            res.status(404).json({
                success: false,
                message: 'Livre non trouve'
            });
            return;
        }

        // Verifier si l'utilisateur a deja note ce livre
        const existingRate = await Rate.findOne({
            where: {
                id_user: rateData.id_user,
                id_book: rateData.id_book
            }
        });

        if (existingRate) {
            res.status(409).json({
                success: false,
                message: 'Vous avez deja note ce livre. Utilisez PUT pour modifier votre note.'
            });
            return;
        }

        const rate = await Rate.create(rateData);

        const response: ApiResponse = {
            success: true,
            data: rate,
            message: 'Note ajoutee avec succes'
        };
        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};

export const getAllRates = async (
    req: TypedRequest<any, any, RateSearchQuery>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // req.query deja valide par middleware
        const { page, limit, id_book, id_user, rating } = req.query;

        const where: Record<string, any> = {};

        // Filtre par livre
        if (id_book) {
            where['id_book'] = id_book;
        }

        // Filtre par utilisateur
        if (id_user) {
            where['id_user'] = id_user;
        }

        // Filtre par note exacte (pour l'instant)
        if (rating) {
            where['rating'] = rating;
        }

        const offset = (page - 1) * limit;

        const { rows: rates, count: total } = await Rate.findAndCountAll({
            where,
            attributes: ['id_rate', 'id_user', 'id_book', 'rating', 'created_at', 'updated_at'],
            // TODO: include User et Book quand setupAssociations sera configure
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });
        
        const totalPages = Math.ceil(total / limit);

        const response: PaginatedResponse = {
            success: true,
            data: rates,
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

export const getRateById = async (
    req: TypedRequest<any, RateParams>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // req.params deja valide par middleware
        const { id } = req.params;
        
        const rate = await Rate.findByPk(id, {
            attributes: ['id_rate', 'id_user', 'id_book', 'rating', 'created_at', 'updated_at']
            // TODO: include User et Book quand setupAssociations sera configure
        });

        if (!rate) {
            res.status(404).json({
                success: false,
                message: 'Note non trouvee'
            });
            return;
        }

        const response: ApiResponse = {
            success: true,
            data: rate
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};

export const updateRate = async (
    req: AuthenticatedRequest<UpdateRateInput, RateParams>,
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
        const { rating } = req.body;
        
        const rate = await Rate.findByPk(id);
        if (!rate) {
            res.status(404).json({
                success: false,
                message: 'Note non trouvee'
            });
            return;
        }

        // Verifier que l'utilisateur est proprietaire
        if (rate.id_user !== parseInt(req.user.id)) {
            res.status(403).json({
                success: false,
                message: 'Vous ne pouvez modifier que vos propres notes'
            });
            return;
        }

        await rate.update({ rating });

        const response: ApiResponse = {
            success: true,
            data: rate,
            message: 'Note mise a jour avec succes'
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};

export const deleteRate = async (
    req: AuthenticatedRequest<any, RateParams>,
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
        
        const rate = await Rate.findByPk(id);
        if (!rate) {
            res.status(404).json({
                success: false,
                message: 'Note non trouvee'
            });
            return;
        }

        // Verifier que l'utilisateur est proprietaire
        if (rate.id_user !== parseInt(req.user.id)) {
            res.status(403).json({
                success: false,
                message: 'Vous ne pouvez supprimer que vos propres notes'
            });
            return;
        }

        await rate.destroy();

        // 204 No Content pour DELETE reussi
        res.status(204).end();
    } catch (error) {
        next(error);
    }
};

export const getMyRates = async (
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

        const rates = await Rate.findAll({
            where: { id_user: parseInt(req.user.id) },
            attributes: ['id_rate', 'id_book', 'rating', 'created_at', 'updated_at'],
            order: [['created_at', 'DESC']]
            // TODO: include Book quand setupAssociations sera configure
        });

        const response: ApiResponse = {
            success: true,
            data: rates
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};

export const getRatesByBook = async (
    req: TypedRequest<any, { book_id: number }, RateSearchQuery>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // req.params deja valide par middleware
        const { book_id } = req.params;
        
        // Verifier que le livre existe
        const book = await Book.findByPk(book_id);
        if (!book) {
            res.status(404).json({
                success: false,
                message: 'Livre non trouve'
            });
            return;
        }

        // req.query deja valide par middleware
        const { page, limit, rating } = req.query;

        const where: Record<string, any> = {
            id_book: book_id
        };

        // Filtre par note exacte (pour l'instant)
        if (rating) {
            where['rating'] = rating;
        }

        const offset = (page - 1) * limit;

        const { rows: rates, count: total } = await Rate.findAndCountAll({
            where,
            attributes: ['id_rate', 'id_user', 'rating', 'created_at', 'updated_at'],
            // TODO: include User quand setupAssociations sera configure
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });

        // Calculer la moyenne des notes
        const averageRating = total > 0 
            ? rates.reduce((sum, rate) => sum + rate.rating, 0) / total
            : 0;
        
        const totalPages = Math.ceil(total / limit);

        const response: PaginatedResponse & { statistics?: any } = {
            success: true,
            data: rates,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            },
            statistics: {
                averageRating: parseFloat(averageRating.toFixed(2)),
                totalRatings: total
            }
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};

export const getMyRateForBook = async (
    req: AuthenticatedRequest<any, { book_id: number }>,
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
        const { book_id } = req.params;
        
        const rate = await Rate.findOne({
            where: {
                id_user: parseInt(req.user.id),
                id_book: book_id
            },
            attributes: ['id_rate', 'rating', 'created_at', 'updated_at']
        });

        if (!rate) {
            res.status(404).json({
                success: false,
                message: 'Vous n\'avez pas encore note ce livre'
            });
            return;
        }

        const response: ApiResponse = {
            success: true,
            data: rate
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};