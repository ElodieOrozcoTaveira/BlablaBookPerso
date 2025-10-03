import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import ReadingListCollection from '../models/ReadingListCollection.js';
import ReadingList from '../models/ReadingList.js';
import Book from '../models/Book.js';
import Library from '../models/Library.js';
import { BookActionService } from '../services/book-action.service.js';
import { AuthenticatedRequest, ApiResponse, PaginatedResponse } from '../types/express.js';

// Interface pour les paramètres de création
interface CreateReadingListCollectionBody {
    name: string;
    description?: string;
    is_public?: boolean;
}

// Interface pour les paramètres de mise à jour
interface UpdateReadingListCollectionBody {
    name?: string;
    description?: string;
    is_public?: boolean;
}

export const createReadingListCollection = async (
    req: AuthenticatedRequest<CreateReadingListCollectionBody>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Utilisateur non authentifié'
            });
            return;
        }

        const { name, description, is_public = false } = req.body;

        // Vérifier si une liste avec ce nom existe déjà pour cet utilisateur
        const existing = await ReadingListCollection.findOne({
            where: {
                id_user: req.user.id_user,
                name
            }
        });

        if (existing) {
            res.status(409).json({
                success: false,
                message: 'Une liste de lecture avec ce nom existe déjà'
            });
            return;
        }

        const collection = await ReadingListCollection.create({
            id_user: req.user.id_user,
            name,
            description,
            is_public
        });

        const response: ApiResponse = {
            success: true,
            data: collection,
            message: 'Liste de lecture créée avec succès'
        };
        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};

export const getMyReadingListCollections = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Utilisateur non authentifié'
            });
            return;
        }

        const collections = await ReadingListCollection.findAll({
            where: { id_user: req.user.id_user },
            order: [['created_at', 'DESC']]
        });

        const response: ApiResponse = {
            success: true,
            data: collections
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};

export const getReadingListCollection = async (
    req: AuthenticatedRequest<any, { id: number }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;

        const collection = await ReadingListCollection.findByPk(id);
        
        if (!collection) {
            res.status(404).json({
                success: false,
                message: 'Liste de lecture non trouvée'
            });
            return;
        }

        // Vérifier l'accès : propriétaire ou liste publique
        if (!req.user || (collection.id_user !== req.user.id_user && !collection.is_public)) {
            res.status(403).json({
                success: false,
                message: 'Accès refusé'
            });
            return;
        }

        // Récupérer les livres de cette collection
        const books = await ReadingList.findAll({
            where: { 
                id_reading_list_collection: id,
                reading_status: { [Op.ne]: 'owned' } // Exclure les livres "owned" (collection permanente)
            },
            include: [{
                model: Book,
                as: 'ReadingListBelongsToBook'
            }],
            order: [['added_at', 'DESC']]
        });

        const response: ApiResponse = {
            success: true,
            data: {
                ...collection.toJSON(),
                books
            }
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};

export const updateReadingListCollection = async (
    req: AuthenticatedRequest<UpdateReadingListCollectionBody, { id: number }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Utilisateur non authentifié'
            });
            return;
        }

        const { id } = req.params;
        const updateData = req.body;

        const collection = await ReadingListCollection.findByPk(id);
        
        if (!collection) {
            res.status(404).json({
                success: false,
                message: 'Liste de lecture non trouvée'
            });
            return;
        }

        // Vérifier ownership
        if (collection.id_user !== req.user.id_user) {
            res.status(403).json({
                success: false,
                message: 'Accès refusé'
            });
            return;
        }

        // Vérifier unicité du nom si changé
        if (updateData.name && updateData.name !== collection.name) {
            const existing = await ReadingListCollection.findOne({
                where: {
                    id_user: req.user.id_user,
                    name: updateData.name,
                    id_reading_list_collection: { [Op.ne]: id }
                }
            });

            if (existing) {
                res.status(409).json({
                    success: false,
                    message: 'Une liste de lecture avec ce nom existe déjà'
                });
                return;
            }
        }

        await collection.update(updateData);

        const response: ApiResponse = {
            success: true,
            data: collection,
            message: 'Liste de lecture mise à jour avec succès'
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};

export const deleteReadingListCollection = async (
    req: AuthenticatedRequest<any, { id: number }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Utilisateur non authentifié'
            });
            return;
        }

        const { id } = req.params;

        const collection = await ReadingListCollection.findByPk(id);
        
        if (!collection) {
            res.status(404).json({
                success: false,
                message: 'Liste de lecture non trouvée'
            });
            return;
        }

        // Vérifier ownership
        if (collection.id_user !== req.user.id_user) {
            res.status(403).json({
                success: false,
                message: 'Accès refusé'
            });
            return;
        }

        // Supprimer les entrées liées (remise en statut "owned" dans la bibliothèque)
        await ReadingList.update(
            { 
                id_reading_list_collection: null,
                reading_status: 'owned',
                started_at: null,
                finished_at: null
            },
            { 
                where: { id_reading_list_collection: id } 
            }
        );

        await collection.destroy();

        const response: ApiResponse = {
            success: true,
            message: 'Liste de lecture supprimée avec succès'
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};

export const addBookToCollection = async (
    req: AuthenticatedRequest<{ id_book?: number; open_library_key?: string; reading_status?: string }, { id: number }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Utilisateur non authentifié'
            });
            return;
        }

        const { id } = req.params;
        const { id_book, open_library_key, reading_status = 'to_read' } = req.body;

        // Vérifier que la collection existe et appartient à l'utilisateur
        const collection = await ReadingListCollection.findByPk(id);
        
        if (!collection) {
            res.status(404).json({
                success: false,
                message: 'Collection non trouvée'
            });
            return;
        }

        if (collection.id_user !== req.user.id_user) {
            res.status(403).json({
                success: false,
                message: 'Accès refusé'
            });
            return;
        }

        let bookId = id_book;

        // Import depuis OpenLibrary si nécessaire
        if (!bookId && open_library_key) {
            try {
                const bookActionService = new BookActionService();
                const importResult = await bookActionService.ensureBookExists({ open_library_key });
                if (importResult.book) {
                    bookId = importResult.book.id_book;
                } else {
                    res.status(404).json({
                        success: false,
                        message: 'Impossible d\'importer le livre depuis OpenLibrary'
                    });
                    return;
                }
            } catch (error) {
                res.status(400).json({
                    success: false,
                    message: 'Erreur lors de l\'import OpenLibrary',
                    error: error.message
                });
                return;
            }
        }

        if (!bookId) {
            res.status(400).json({
                success: false,
                message: 'Il faut fournir soit id_book soit open_library_key'
            });
            return;
        }

        // Pour ajouter à une collection, il faut d'abord que le livre soit dans une bibliothèque de l'utilisateur
        const userLibraries = await Library.findAll({
            where: { id_user: req.user.id_user },
            attributes: ['id_library']
        });

        if (userLibraries.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Vous devez avoir au moins une bibliothèque pour créer des listes de lecture'
            });
            return;
        }

        // Chercher si le livre existe déjà dans une des bibliothèques de l'utilisateur
        let existingEntry = null;
        for (const lib of userLibraries) {
            existingEntry = await ReadingList.findOne({
                where: {
                    id_library: lib.id_library,
                    id_book: bookId
                }
            });
            if (existingEntry) break;
        }

        // Si le livre n'existe pas encore, l'ajouter à la première bibliothèque en status "owned"
        if (!existingEntry) {
            existingEntry = await ReadingList.create({
                id_library: userLibraries[0].id_library,
                id_book: bookId,
                reading_status: 'owned',
                added_at: new Date()
            });
        }

        // Vérifier si le livre est déjà dans cette collection
        const existingInCollection = await ReadingList.findOne({
            where: {
                id_reading_list_collection: id,
                id_book: bookId
            }
        });

        if (existingInCollection) {
            res.status(409).json({
                success: false,
                message: 'Ce livre est déjà dans cette collection'
            });
            return;
        }

        // Créer une nouvelle entrée pour la collection
        const collectionEntry = await ReadingList.create({
            id_library: existingEntry.id_library,
            id_book: bookId,
            id_reading_list_collection: id,
            reading_status,
            added_at: new Date()
        });

        const response: ApiResponse = {
            success: true,
            data: collectionEntry,
            message: 'Livre ajouté à la collection avec succès'
        };
        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};