import { Response, NextFunction } from 'express';
import {
    RateSearchQuery,
    RateParams,
    CreateRateInput,
    UpdateRateInput
} from '../validation/rate.zod.js';
import Rate from '../models/Rate.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import { RateService } from '../services/rate.service.js';
import { TypedRequest, PaginatedResponse, ApiResponse, AuthenticatedRequest } from '../types/express.js';

export const createRate = async (
    req: AuthenticatedRequest<CreateRateInput>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Utilisateur non authentifie' });
            return;
        }
        const { id_book, open_library_key, rating } = req.body as any;
        const service = new RateService();
        const { rate, error } = await service.createRate({ id_book, open_library_key, rating }, req.user.id_user);
        if (error) {
            res.status(error.code).json({ success: false, message: error.message });
            return;
        }
        const response: ApiResponse = { success: true, data: rate, message: 'Note ajoutee avec succes' };
        res.status(201).json(response);
    } catch (error: any) {
        if (error?.message?.startsWith('OPENLIB_IMPORT_FAILED:')) {
            res.status(404).json({ success: false, message: 'Impossible d\'importer le livre (OpenLibrary)', error: error.message.split(':',2)[1] });
            return;
        }
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
    const service = new RateService();
    const { rates, pagination } = await service.listRates({ page, limit, id_book, id_user, rating } as any);
    const response: PaginatedResponse = { success: true, data: rates, pagination };
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
            attributes: ['id_rate', 'id_user', 'id_book', 'rating', 'created_at', 'updated_at'],
            include: [
                {
                    model: User,
                    as: 'RateBelongsToUser',
                    attributes: ['id_user', 'username', 'firstname', 'lastname']
                },
                {
                    model: Book,
                    as: 'RateBelongsToBook',
                    attributes: ['id_book', 'title', 'isbn', 'publication_year']
                }
            ]
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
            res.status(401).json({ success: false, message: 'Utilisateur non authentifie' });
            return;
        }
        const { rating } = req.body;
        let rate: any = (req as any).rate; // peut être injecté par ownership
        if (!rate) {
            // Fallback legacy pour compatibilité tests unitaires
            const { id } = req.params;
            rate = await Rate.findByPk(id);
            if (!rate) {
                res.status(404).json({ success: false, message: 'Note non trouvee' });
                return;
            }
            if ((rate.dataValues?.id_user || rate.get('id_user')) !== req.user.id_user && !(req.user as any).is_admin) {
                res.status(403).json({ success: false, message: 'Acces refuse' });
                return;
            }
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
            res.status(401).json({ success: false, message: 'Utilisateur non authentifie' });
            return;
        }
        let rate: any = (req as any).rate;
        if (!rate) {
            const { id } = req.params;
            rate = await Rate.findByPk(id);
            if (!rate) {
                res.status(404).json({ success: false, message: 'Note non trouvee' });
                return;
            }
            if ((rate.dataValues?.id_user || rate.get('id_user')) !== req.user.id_user && !(req.user as any).is_admin) {
                res.status(403).json({ success: false, message: 'Acces refuse' });
                return;
            }
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
            where: { id_user: req.user.id_user },
            attributes: ['id_rate', 'id_book', 'rating', 'created_at', 'updated_at'],
            include: [{
                model: Book,
                as: 'RateBelongsToBook',
                attributes: ['id_book', 'title', 'isbn', 'publication_year']
            }],
            order: [['created_at', 'DESC']]
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
        
// Verifie que le livre existe
        const book = await Book.findByPk(book_id);
        if (!book) {
            res.status(404).json({
                success: false,
                message: 'Livre non trouve'
            });
            return;
        }

// req.query deja valide par middleware

        const { page = 1, limit = 10, rating } = req.query;


        const where: Record<string, any> = {
            id_book: book_id
        };

// Filtre par note exacte (pour l'instant)
        if (rating) {
            where['rating'] = rating;
        }

        const offset = ((page as number) - 1) * (limit as number);

        const { rows: rates, count: total } = await Rate.findAndCountAll({
            where,
            attributes: ['id_rate', 'id_user', 'rating', 'created_at', 'updated_at'],
            include: [{
                model: User,
                as: 'RateBelongsToUser',
                attributes: ['id_user', 'username', 'firstname', 'lastname']
            }],
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });

// Calcule la moyenne des notes
        const averageRating = total > 0 
            ? rates.reduce((sum, rate) => sum + rate.rating, 0) / total
            : 0;
        
        const totalPages = Math.ceil(total / (limit as number));

        const response: PaginatedResponse & { statistics?: any } = {
            success: true,
            data: rates,
            pagination: {
                page: page as number,
                limit: limit as number,
                total,
                totalPages,
                hasNext: (page as number) < totalPages,
                hasPrev: (page as number) > 1
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
                id_user: req.user.id_user,
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