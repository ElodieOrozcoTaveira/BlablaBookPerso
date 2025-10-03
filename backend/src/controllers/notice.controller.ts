import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import {
    NoticeSearchQuery,
    NoticeParams,
    CreateNoticeInput,
    UpdateNoticeInput
} from '../validation/notice.zod.js';
import Notice from '../models/Notice.js';
import Book from '../models/Book.js';
import { TypedRequest, PaginatedResponse, ApiResponse, AuthenticatedRequest } from '../types/express.js';

export const createNotice = async (
    req: AuthenticatedRequest<CreateNoticeInput>,
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
        const noticeData = {
            ...req.body,
            id_user: req.user.id_user
        };

        // Verifier que le livre existe
        const book = await Book.findByPk(noticeData.id_book);
        if (!book) {
            res.status(404).json({
                success: false,
                message: 'Livre non trouve'
            });
            return;
        }

        const notice = await Notice.create(noticeData);

        const response: ApiResponse = {
            success: true,
            data: notice,
            message: 'Avis cree avec succes'
        };
        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};

export const getAllNotices = async (
    req: TypedRequest<any, any, NoticeSearchQuery>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // req.query deja valide par middleware
        const { page, limit, query, id_book, id_user, is_public, is_spoiler } = req.query;

        const where: Record<string, any> = {};

        // Recherche par titre ou contenu
        if (query) {
            where[Op.or as any] = [
                { title: { [Op.iLike]: `%${query}%` } },
                { content: { [Op.iLike]: `%${query}%` } }
            ];
        }

        // Filtre par livre
        if (id_book) {
            where['id_book'] = id_book;
        }

        // Filtre par utilisateur
        if (id_user) {
            where['id_user'] = id_user;
        }

        // Filtre par visibilite
        if (is_public !== undefined) {
            where['is_public'] = is_public;
        }

        // Filtre par spoilers
        if (is_spoiler !== undefined) {
            where['is_spoiler'] = is_spoiler;
        }

        const offset = (page - 1) * limit;

        const { rows: notices, count: total } = await Notice.findAndCountAll({
            where,
            attributes: ['id_notice', 'id_user', 'id_book', 'title', 'content', 'is_spoiler', 'is_public', 'created_at', 'updated_at'],
            // TODO: include User et Book quand setupAssociations sera configure
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });
        
        const totalPages = Math.ceil(total / limit);

        const response: PaginatedResponse = {
            success: true,
            data: notices,
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

export const getNoticeById = async (
    req: TypedRequest<any, NoticeParams>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // req.params deja valide par middleware
        const { id } = req.params;
        
        const notice = await Notice.findByPk(id, {
            attributes: ['id_notice', 'id_user', 'id_book', 'title', 'content', 'is_spoiler', 'is_public', 'created_at', 'updated_at']
            // TODO: include User et Book quand setupAssociations sera configure
        });

        if (!notice) {
            res.status(404).json({
                success: false,
                message: 'Avis non trouve'
            });
            return;
        }

        const response: ApiResponse = {
            success: true,
            data: notice
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};

export const updateNotice = async (
    req: AuthenticatedRequest<UpdateNoticeInput, NoticeParams>,
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
        
        const notice = await Notice.findByPk(id);
        if (!notice) {
            res.status(404).json({
                success: false,
                message: 'Avis non trouve'
            });
            return;
        }

        // Verifier que l'utilisateur est proprietaire
        if (notice.id_user !== req.user.id_user) {
            res.status(403).json({
                success: false,
                message: 'Vous ne pouvez modifier que vos propres avis'
            });
            return;
        }

        // Mettre a jour seulement les champs fournis
        const cleanData = Object.fromEntries(
            Object.entries(updateData).filter(([, value]) => value !== undefined)
        );
        await notice.update(cleanData);

        const response: ApiResponse = {
            success: true,
            data: notice,
            message: 'Avis mis a jour avec succes'
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};

export const deleteNotice = async (
    req: AuthenticatedRequest<any, NoticeParams>,
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
        
        const notice = await Notice.findByPk(id);
        if (!notice) {
            res.status(404).json({
                success: false,
                message: 'Avis non trouve'
            });
            return;
        }

        // Verifier que l'utilisateur est proprietaire
        if (notice.id_user !== req.user.id_user) {
            res.status(403).json({
                success: false,
                message: 'Vous ne pouvez supprimer que vos propres avis'
            });
            return;
        }

        await notice.destroy();

        // 204 No Content pour DELETE reussi
        res.status(204).end();
    } catch (error) {
        next(error);
    }
};

export const getMyNotices = async (
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

        const notices = await Notice.findAll({
            where: { id_user: req.user.id_user },
            attributes: ['id_notice', 'id_book', 'title', 'content', 'is_spoiler', 'is_public', 'created_at', 'updated_at'],
            order: [['created_at', 'DESC']]
            // TODO: include Book quand setupAssociations sera configure
        });

        const response: ApiResponse = {
            success: true,
            data: notices
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};

export const getNoticesByBook = async (
    req: TypedRequest<any, { book_id: number }, NoticeSearchQuery>,
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
        const { page, limit, is_spoiler } = req.query;

        const where: Record<string, any> = {
            id_book: book_id,
            is_public: true // Seulement les avis publics pour cette route
        };

        // Filtre par spoilers
        if (is_spoiler !== undefined) {
            where['is_spoiler'] = is_spoiler;
        }

        const offset = (page - 1) * limit;

        const { rows: notices, count: total } = await Notice.findAndCountAll({
            where,
            attributes: ['id_notice', 'id_user', 'title', 'content', 'is_spoiler', 'created_at', 'updated_at'],
            // TODO: include User quand setupAssociations sera configure
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });
        
        const totalPages = Math.ceil(total / limit);

        const response: PaginatedResponse = {
            success: true,
            data: notices,
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