import { Response, NextFunction } from 'express';
import Book from '../models/Book.js';
import User from '../models/User.js';
import { ImageService } from '../services/image.service.js';
import { TypedRequest, ApiResponse, AuthenticatedRequest, AuthenticatedMulterRequest } from '../types/express.js';

// Schema de validation pour l'upload d'image (TODO: utiliser quand l'upload sera implementé)
// const uploadImageSchema = z.object({
//     book_id: z.number().int().positive('L\'ID du livre doit etre un entier positif')
// });

export const uploadBookCover = async (
    req: AuthenticatedMulterRequest<any, { book_id: number }>,
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

        // Verifier qu'un fichier a ete uploade
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: 'Aucun fichier image fourni'
            });
            return;
        }

        const imageService = new ImageService();
        
        try {
            // Valider que le fichier est une image
            const isValid = await imageService.validateImage(req.file.buffer);
            if (!isValid) {
                res.status(400).json({
                    success: false,
                    message: 'Le fichier fourni n\'est pas une image valide'
                });
                return;
            }

            // Supprimer l'ancienne couverture si elle existe
            if (book.get('cover_url')) {
                await imageService.deleteImages(book.get('cover_url') as string, 'book');
            }

            // Traiter la nouvelle image
            const processedImages = await imageService.processImage(
                req.file.buffer, 
                'book', 
                book_id
            );

            // Mettre a jour le livre
            await book.update({ cover_url: processedImages });

            const response: ApiResponse = {
                success: true,
                data: {
                    book_id,
                    cover_images: JSON.parse(processedImages)
                },
                message: 'Couverture uploadee et traitee avec succes'
            };
            res.json(response);

        } catch (error) {
            console.error(`Erreur upload couverture livre ${book_id}:`, error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors du traitement de l\'image'
            });
        }
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

        // Supprimer l'image du stockage si elle existe
        if (book.get('cover_url')) {
            const imageService = new ImageService();
            await imageService.deleteImages(book.get('cover_url') as string, 'book');
        }

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
    req: AuthenticatedMulterRequest,
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

        // Verifier qu'un fichier a ete uploade
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: 'Aucun fichier image fourni'
            });
            return;
        }

        const imageService = new ImageService();
        
        try {
            // Valider que le fichier est une image
            const isValid = await imageService.validateImage(req.file.buffer);
            if (!isValid) {
                res.status(400).json({
                    success: false,
                    message: 'Le fichier fourni n\'est pas une image valide'
                });
                return;
            }

            // Recuperer l'utilisateur
            const user = await User.findByPk(req.user.id_user);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouve'
                });
                return;
            }

            // Supprimer l'ancien avatar si il existe
            if (user.get('avatar_url')) {
                await imageService.deleteImages(user.get('avatar_url') as string, 'author');
            }

            // Traiter la nouvelle image
            const processedImages = await imageService.processImage(
                req.file.buffer, 
                'author', 
                req.user.id_user
            );

            // Mettre a jour l'utilisateur
            await user.update({ avatar_url: processedImages });

            const response: ApiResponse = {
                success: true,
                data: {
                    user_id: req.user.id_user,
                    avatar_images: JSON.parse(processedImages)
                },
                message: 'Avatar uploade et traite avec succes'
            };
            res.json(response);

        } catch (error) {
            console.error(`Erreur upload avatar utilisateur ${req.user.id_user}:`, error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors du traitement de l\'image'
            });
        }
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

        // Recuperer l'utilisateur
        const user = await User.findByPk(req.user.id_user);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Utilisateur non trouve'
            });
            return;
        }

        // Supprimer l'avatar du stockage si il existe
        if (user.get('avatar_url')) {
            const imageService = new ImageService();
            await imageService.deleteImages(user.get('avatar_url') as string, 'author');
        }

        // Mettre a jour l'utilisateur pour supprimer l'URL d'avatar
        await user.update({ avatar_url: undefined });

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

        // Recuperer les livres de l'utilisateur avec leurs couvertures
        const books = await Book.findAll({
            where: { /* TODO: ajouter id_user au modele Book ou filtrer par proprietaire */ },
            attributes: ['id_book', 'title', 'cover_url']
        });

        // Recuperer l'utilisateur avec son avatar
        const user = await User.findByPk(req.user.id_user, {
            attributes: ['id_user', 'firstname', 'lastname', 'avatar_url']
        });

        const images = [];

        // Ajouter les couvertures de livres
        for (const book of books) {
            if (book.get('cover_url')) {
                images.push({
                    type: 'book_cover',
                    book_id: book.get('id_book'),
                    title: book.get('title'),
                    images: JSON.parse(book.get('cover_url') as string)
                });
            }
        }

        // Ajouter l'avatar utilisateur
        if (user && user.get('avatar_url')) {
            images.push({
                type: 'user_avatar',
                user_id: user.get('id_user'),
                name: `${user.get('firstname')} ${user.get('lastname')}`,
                images: JSON.parse(user.get('avatar_url') as string)
            });
        }

        const response: ApiResponse = {
            success: true,
            data: images,
            message: `${images.length} image(s) trouvee(s)`
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};