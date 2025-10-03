import { Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import Book from '../models/Book.js';
import User from '../models/User.js';
import { ImageService } from '../services/image.service.js';
import { TypedRequest, ApiResponse, AuthenticatedRequest, AuthenticatedMulterRequest } from '../types/express.js';

// J'upload la couverture d'un livre
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

// Je recupere l'id du livre
        const { book_id } = req.params;

// Je verifie si le livre existe
        const book = await Book.findByPk(book_id);
        if (!book) {
            res.status(404).json({
                success: false,
                message: 'Book not found'
            });
            return;
        }

// Je verifie si un fichier a ete uploade
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
            return;
        }

        const imageService = new ImageService();

        try {

// Je valide que le fichier est une image
            const isValid = await imageService.validateImage(req.file.buffer);
            if (!isValid) {
                res.status(400).json({
                    success: false,
                    message: 'The provided file is not a valid image'
                });
                return;
            }

// Je supprime l'ancienne couverture si elle existe
            if (book.get('cover_url')) {
                await imageService.deleteImages(book.get('cover_url') as string, 'book');
            }

// Je traite la nouvelle image
            const processedImages = await imageService.processImage(
                req.file.buffer,
                'book',
                book_id
            );

// Je mets a jour le livre
            await book.update({ cover_url: processedImages });

            const response: ApiResponse = {
                success: true,
                data: {
                    book_id,
                    cover_images: JSON.parse(processedImages)
                },
                message: 'Cover uploaded and processed successfully'
            };
            res.json(response);

        } catch (error) {
            console.error(`Error uploading book cover ${book_id}:`, error);
            res.status(500).json({
                success: false,
                message: 'Error processing image'
            });
        }
    } catch (error) {
        next(error);
    }
};

// Je supprime la couverture d'un livre
export const deleteBookCover = async (
    req: AuthenticatedRequest<any, { book_id: number }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }

// Je recupere l'id du livre
        const { book_id } = req.params;

// Je verifie si le livre existe
        const book = await Book.findByPk(book_id);
        if (!book) {
            res.status(404).json({
                success: false,
                message: 'Book not found'
            });
            return;
        }

// Je supprime l'image du stockage si elle existe
        if (book.get('cover_url')) {
            const imageService = new ImageService();
            await imageService.deleteImages(book.get('cover_url') as string, 'book');
        }

// Je mets a jour le livre pour supprimer l'url de couverture
        await book.update({ cover_url: undefined });

        const response: ApiResponse = {
            success: true,
            message: 'Cover deleted successfully'
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};

// J'upload l'avatar utilisateur
export const uploadUserAvatar = async (
    req: AuthenticatedMulterRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }

// Je verifie si un fichier a ete uploade
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: 'Aucun fichier image fourni'
            });
            return;
        }

        const imageService = new ImageService();
        
        try {

// Je valide que le fichier est une image
            const isValid = await imageService.validateImage(req.file.buffer);
            if (!isValid) {
                res.status(400).json({
                    success: false,
                    message: 'Le fichier fourni n\'est pas une image valide'
                });
                return;
            }

// Je recupere l'utilisateur
            const user = await User.findByPk(req.user.id_user);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouve'
                });
                return;
            }

// Je supprime l'ancien avatar si il existe
            if (user.get('avatar_url')) {
                await imageService.deleteImages(user.get('avatar_url') as string, 'author');
            }

// Je traite la nouvelle image
            const processedImages = await imageService.processImage(
                req.file.buffer, 
                'author', 
                req.user.id_user
            );

 // Je mets a jour l'utilisateur
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

// Je supprime l'avatar utilisateur
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

// Je recupere l'utilisateur
        const user = await User.findByPk(req.user.id_user);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Utilisateur non trouve'
            });
            return;
        }

// Je supprime l'avatar du stockage si il existe
        if (user.get('avatar_url')) {
            const imageService = new ImageService();
            await imageService.deleteImages(user.get('avatar_url') as string, 'author');
        }

// Je mets a jour l'utilisateur pour supprimer l'URL d'avatar
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

// Je recupere les images uploadees
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

// Je recupere les livres importes par l'utilisateur avec leurs couvertures
        const books = await Book.findAll({
            where: { imported_by: req.user.id_user },
            attributes: ['id_book', 'title', 'cover_url']
        });

// Je recupere l'utilisateur avec son avatar
        const user = await User.findByPk(req.user.id_user, {
            attributes: ['id_user', 'firstname', 'lastname', 'avatar_url']
        });

        const images = [];

// J'ajoute les couvertures de livres
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

// J'ajoute l'avatar utilisateur
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

export const getBookCover = async (
    req: TypedRequest<any, { book_id: number; size: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { book_id, size } = req.params;
        
        // Valider la taille demandee
        const validSizes = ['thumb', 'small', 'medium'];
        if (!validSizes.includes(size)) {
            res.status(400).json({
                success: false,
                message: `Taille invalide. Tailles disponibles: ${validSizes.join(', ')}`
            });
            return;
        }

        // Recuperer le livre
        const book = await Book.findByPk(book_id, {
            attributes: ['id_book', 'cover_url']
        });

        if (!book) {
            res.status(404).json({
                success: false,
                message: 'Livre non trouve'
            });
            return;
        }

        const coverUrl = book.get('cover_url') as string;
        if (!coverUrl) {
            res.status(404).json({
                success: false,
                message: 'Aucune couverture disponible pour ce livre'
            });
            return;
        }

        try {
            // Parser le JSON des URLs
            const imageUrls = JSON.parse(coverUrl);
            const requestedImageUrl = imageUrls[size];

            if (!requestedImageUrl) {
                res.status(404).json({
                    success: false,
                    message: `Taille ${size} non disponible pour ce livre`
                });
                return;
            }

            // Extraire le nom de fichier de l'URL
            const filename = requestedImageUrl.split('/').pop();
            const filePath = path.join(process.cwd(), 'uploads', 'covers', filename);

            // Verifier que le fichier existe
            if (!fs.existsSync(filePath)) {
                res.status(404).json({
                    success: false,
                    message: 'Fichier image non trouve sur le serveur'
                });
                return;
            }

            // Headers optimaux pour images
            res.setHeader('Content-Type', 'image/webp');
            res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 jours
            // TODO V2: Remplacer par hash du fichier pour meilleur cache
            res.setHeader('ETag', `"${book_id}-${size}-basic"`);
            
            // Envoyer le fichier
            res.sendFile(filePath);

        } catch (parseError) {
            // Fallback pour anciennes images (URL simple)
            const filename = coverUrl.split('/').pop();
            const filePath = path.join(process.cwd(), 'uploads', 'covers', filename || '');

            if (fs.existsSync(filePath)) {
                res.setHeader('Content-Type', 'image/jpeg'); // Assume JPEG for legacy
                res.setHeader('Cache-Control', 'public, max-age=2592000');
                res.sendFile(filePath);
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Image non trouvee'
                });
            }
        }

    } catch (error) {
        next(error);
    }
};