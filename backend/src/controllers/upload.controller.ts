import { Response, NextFunction } from 'express';
import Book from '../models/Book';
import { TypedRequest, ApiResponse } from '../types/express';

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

// Schema de validation pour l'upload d'image (TODO: utiliser quand l'upload sera implementé)
// const uploadImageSchema = z.object({
//     book_id: z.number().int().positive('L\'ID du livre doit etre un entier positif')
// });

export const uploadBookCover = async (
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

        // Verifier que le livre existe
        const book = await Book.findByPk(book_id);
        if (!book) {
            res.status(404).json({
                success: false,
                message: 'Livre non trouve'
            });
            return;
        }

        // TODO: Implementer l'upload d'image avec multer ou autre middleware
        // Pour l'instant, simulation
        res.status(501).json({
            success: false,
            message: 'Fonctionnalite d\'upload non encore implementee - TODO: integrer avec service d\'images'
        });
    } catch (error) {
        next(error);
    }
};

export const deleteBookCover = async (
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

        // Verifier que le livre existe
        const book = await Book.findByPk(book_id);
        if (!book) {
            res.status(404).json({
                success: false,
                message: 'Livre non trouve'
            });
            return;
        }

        // TODO: Supprimer l'image du service de stockage
        // Mettre a jour le livre pour supprimer l'URL de couverture
        await book.update({ cover_url: undefined });

        const response: ApiResponse = {
            success: true,
            message: 'Couverture supprimee avec succes'
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};

export const uploadUserAvatar = async (
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

        // TODO: Implementer l'upload d'avatar utilisateur
        // Pour l'instant, simulation
        res.status(501).json({
            success: false,
            message: 'Fonctionnalite d\'upload d\'avatar non encore implementee - TODO: integrer avec service d\'images'
        });
    } catch (error) {
        next(error);
    }
};

export const deleteUserAvatar = async (
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

        // TODO: Implementer la suppression d'avatar utilisateur
        const response: ApiResponse = {
            success: true,
            message: 'Avatar supprime avec succes'
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};

export const getUploadedImages = async (
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

        // TODO: Lister les images uploadees par l'utilisateur
        const response: ApiResponse = {
            success: true,
            data: [],
            message: 'Aucune image trouvee - TODO: implementer le listage des images'
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};