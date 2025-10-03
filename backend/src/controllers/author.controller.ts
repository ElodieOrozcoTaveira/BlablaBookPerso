import { Response, NextFunction } from 'express';
import {
  AuthorSearchQuery,
  AuthorParams,
  AuthorAvatarParams,
  CreateAuthorInput,
  UpdateAuthorInput
} from '../validation/author.zod.js';
import { AuthorService } from '../services/author.service.js';
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

        const authorService = new AuthorService();
        const author = await authorService.create(req.body);

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
        const authorService = new AuthorService();
        const result = await authorService.findAll(req.query);

        const response: PaginatedResponse = {
            success: true,
            data: result.authors,
            pagination: result.pagination
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
        const { id } = req.params;
        const authorService = new AuthorService();
        const author = await authorService.findById(id);

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

        const { id } = req.params;
        const authorService = new AuthorService();
        const author = await authorService.update(id, req.body);
        
        if (!author) {
            res.status(404).json({
                success: false,
                message: 'Auteur non trouve'
            });
            return;
        }

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

        const { id } = req.params;
        const authorService = new AuthorService();
        const deleted = await authorService.delete(id);

        if (!deleted) {
            res.status(404).json({
                success: false,
                message: 'Auteur non trouve'
            });
            return;
        }

        res.status(204).end();
    } catch (error) {
        next(error);
    }
};

// Routes specialisees - deleguent au service
export const getAuthorBio = async (
    req: TypedRequest<any, AuthorParams>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const authorService = new AuthorService();
        const bio = await authorService.getBio(id);

        if (bio === null) {
            res.status(404).json({
                success: false,
                message: 'Auteur non trouve ou pas de bio'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: { bio }
        });
    } catch (error) {
        next(error);
    }
};

export const getAuthorAvatar = async (
    req: TypedRequest<any, AuthorParams>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const authorService = new AuthorService();
        const avatar = await authorService.getAvatar(id);

        if (!avatar) {
            res.status(404).json({
                success: false,
                message: 'Auteur non trouve ou pas d\'avatar'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: avatar
        });
    } catch (error) {
        next(error);
    }
};

export const getAuthorAvatarBySize = async (
    req: TypedRequest<any, AuthorAvatarParams>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id, size } = req.params;
        
        // Valider la taille - plus besoin car fait par Zod
        // if (size !== 'thumb' && size !== 'small') {
        //     res.status(400).json({
        //         success: false,
        //         message: 'Taille d\'avatar invalide. Utilise "thumb" ou "small"'
        //     });
        //     return;
        // }

        const authorService = new AuthorService();
        const avatarUrl = await authorService.getAvatarBySize(id, size);

        if (!avatarUrl) {
            res.status(404).json({
                success: false,
                message: 'Avatar non trouve pour cette taille'
            });
            return;
        }

        // Rediriger vers le fichier d'avatar
        res.redirect(avatarUrl);
    } catch (error) {
        next(error);
    }
};
