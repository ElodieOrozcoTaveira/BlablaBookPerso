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
import { BookActionService } from '../services/book-action.service.js'; // conservé pour compat tests si injecté ailleurs
import { NoticeService } from '../services/notice.service.js';
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
        const { id_book, open_library_key, title, content, is_spoiler, is_public } = req.body as any;
        const service = new NoticeService();
        try {
            const { notice, error } = await service.createNotice({ id_book, open_library_key, title, content, is_spoiler, is_public }, req.user.id_user);
            if (error) {
                res.status(error.code).json({ success: false, message: error.message });
                return;
            }
            const response: ApiResponse = { success: true, data: notice, message: 'Avis cree avec succes' };
            res.status(201).json(response);
        } catch (e: any) {
            if (e?.message?.startsWith('OPENLIB_IMPORT_FAILED:')) {
                res.status(404).json({ success: false, message: 'Impossible d\'importer le livre (OpenLibrary)', error: e.message.split(':',2)[1] });
            } else {
                next(e);
            }
        }
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
    const service = new NoticeService();
    const { notices, pagination } = await service.listNotices({ page, limit, query, id_book, id_user, is_public, is_spoiler } as any);
    const response: PaginatedResponse = { success: true, data: notices, pagination };
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
            res.status(401).json({ success: false, message: 'Utilisateur non authentifie' });
            return;
        }
        const updateData = req.body;
        let notice: any = (req as any).notice; // peut être injecté par ownership
        if (!notice) {
            const { id } = req.params;
            notice = await Notice.findByPk(id);
            if (!notice) {
                res.status(404).json({ success: false, message: 'Avis non trouve' });
                return;
            }
            if (notice.id_user !== req.user.id_user && !(req.user as any).is_admin) {
                res.status(403).json({ success: false, message: 'Acces refuse' });
                return;
            }
        }
        const cleanData = Object.fromEntries(Object.entries(updateData).filter(([, v]) => v !== undefined));
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
            res.status(401).json({ success: false, message: 'Utilisateur non authentifie' });
            return;
        }
        let notice: any = (req as any).notice;
        if (!notice) {
            const { id } = req.params;
            notice = await Notice.findByPk(id);
            if (!notice) {
                res.status(404).json({ success: false, message: 'Avis non trouve' });
                return;
            }
            if (notice.id_user !== req.user.id_user && !(req.user as any).is_admin) {
                res.status(403).json({ success: false, message: 'Acces refuse' });
                return;
            }
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
        const { book_id } = req.params;
        const book = await Book.findByPk(book_id);
        if (!book) {
            res.status(404).json({ success: false, message: 'Livre non trouve' });
            return;
        }
        const { page, limit, is_spoiler } = req.query;
        const service = new NoticeService();
        const { notices, pagination } = await service.listPublicNoticesByBook(book_id as any, { page, limit, is_spoiler } as any);
        const response: PaginatedResponse = { success: true, data: notices, pagination };
        res.json(response);
    } catch (error) {
        next(error);
    }
};