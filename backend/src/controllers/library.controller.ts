import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import {
    LibrarySearchQuery,
    LibraryParams,
    CreateLibraryInput,
    UpdateLibraryInput
} from '../validation/library.zod.js';
import Library from '../models/Library.js';
import User from '../models/User.js';
import Book from '../models/Book.js';
import ReadingList from '../models/ReadingList.js';
import { BookActionService } from '../services/book-action.service.js';
import { TypedRequest, PaginatedResponse, ApiResponse, AuthenticatedRequest } from '../types/express.js';

export const createLibrary = async (
    req: AuthenticatedRequest<CreateLibraryInput>,
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
        const libraryData = {
            ...req.body,
            id_user: req.user.id_user
        };

        const library = await Library.create(libraryData);

        const response: ApiResponse = {
            success: true,
            data: library,
            message: 'Bibliotheque creee avec succes'
        };
        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};

export const getAllLibraries = async (
    req: TypedRequest<any, any, LibrarySearchQuery>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {

// req.query deja valide par middleware
        const { page, limit, query, is_public } = req.query;

        const where: Record<string, any> = {};

// Recherche par nom
        if (query) {
            where[Op.or as any] = [
                { name: { [Op.iLike]: `%${query}%` } },
                { description: { [Op.iLike]: `%${query}%` } }
            ];
        }

// Filtre par visibilite
        if (is_public !== undefined) {
            where['is_public'] = is_public;
        }

// Filtre par utilisateur
        if (req.query.user_id !== undefined && req.query.user_id !== null) {

            where['id_user'] = req.query.user_id;
        }

        const offset = ((page || 1) - 1) * (limit || 20);

        const { rows: libraries, count: total } = await Library.findAndCountAll({
            where,
            attributes: ['id_library', 'name', 'description', 'is_public', 'id_user', 'created_at', 'updated_at'],
            include: [{
                model: User,
                as: 'LibraryBelongsToUser',
                attributes: ['id_user', 'username', 'firstname', 'lastname']
            }],
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });
        
        const totalPages = Math.ceil(total / (limit || 20));

        const response: PaginatedResponse = {
            success: true,
            data: libraries,
            pagination: {
                page: page || 1,
                limit: limit || 20,
                total,
                totalPages,
                hasNext: (page || 1) < totalPages,
                hasPrev: (page || 1) > 1
            }
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};

export const getLibraryById = async (
    req: TypedRequest<any, LibraryParams>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {

// req.params deja valide par middleware
        const { id } = req.params;
        
        const library = await Library.findByPk(id, {
            attributes: ['id_library', 'name', 'description', 'is_public', 'id_user', 'created_at', 'updated_at'],
            include: [
                {
                    model: User,
                    as: 'LibraryBelongsToUser',
                    attributes: ['id_user', 'username', 'firstname', 'lastname']
                },
                {
                    model: Book,
                    as: 'LibraryHasBooks',
                    attributes: ['id_book', 'title', 'isbn', 'publication_year'],
                    through: {
                        attributes: ['reading_status', 'created_at'] // Inclut les champs de ReadingList
                    }
                }
            ]
        });

        if (!library) {
            res.status(404).json({
                success: false,
                message: 'Bibliotheque non trouvee'
            });
            return;
        }

        const response: ApiResponse = {
            success: true,
            data: library
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};

export const updateLibrary = async (
    req: AuthenticatedRequest<UpdateLibraryInput, LibraryParams>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const updateData = req.body;
        const library: any = (req as any).library; // Injecté par requireOwnership
        if (!library) {
            res.status(500).json({ success: false, message: 'Contexte ownership manquant' });
            return;
        }
        const cleanData = Object.fromEntries(Object.entries(updateData).filter(([, v]) => v !== undefined));
        await library.update(cleanData);

        const response: ApiResponse = {
            success: true,
            data: library,
            message: 'Bibliotheque mise a jour avec succes'
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};

export const deleteLibrary = async (
    req: AuthenticatedRequest<any, LibraryParams>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Utilisateur non authentifie' });
            return;
        }
        let library: any = (req as any).library; // Injecté par requireOwnership normalement
        if (!library) {

// fallback legacy pour tests fresh: rechercher manuellement
            const { id } = req.params;
            library = await Library.findByPk(id);
            if (!library) {
                res.status(404).json({ success: false, message: 'Bibliotheque non trouvee' });
                return;
            }
// Vérification ownership minimale
            if ((library.dataValues?.id_user || library.get('id_user')) !== req.user.id_user && !(req.user as any).is_admin) {

                res.status(403).json({ success: false, message: 'Acces refuse' });
                return;
            }
        }
        await library.destroy();
        res.status(204).end();
    } catch (error) {
        next(error);
    }
};

export const getMyLibraries = async (
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

        const libraries = await Library.findAll({
            where: { id_user: req.user.id_user },
            attributes: ['id_library', 'name', 'description', 'is_public', 'created_at', 'updated_at'],
            order: [['created_at', 'DESC']]
        });

        const response: ApiResponse = {
            success: true,
            data: libraries
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};

export const addBookToLibrary = async (
    req: AuthenticatedRequest<{ id_book?: number; open_library_key?: string }, LibraryParams>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    // console.log('=== CONTROLLER addBookToLibrary APPELÉ ===');
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Utilisateur non authentifie'
            });
            return;
        }

        const { id } = req.params;
        const { id_book, open_library_key } = req.body;

        // Vérifier que la bibliothèque existe et appartient à l'utilisateur
        let library: any = (req as any).library;
        if (!library) {
            library = await Library.findByPk(id);
            if (!library) {
                res.status(404).json({ success: false, message: 'Bibliothèque non trouvée' });
                return;
            }
            const libraryUserId = library.dataValues?.id_user || library.get('id_user');
            if (libraryUserId !== req.user.id_user && !(req.user as any).is_admin) {
                res.status(403).json({ success: false, message: 'Accès refusé' });
                return;
            }
        }

        // Résoudre l'ID du livre (existant ou import OpenLibrary)
        let effectiveBookId = id_book;
        if (!effectiveBookId && open_library_key) {
            try {
                const actionSvc = new BookActionService();
                const prep = await actionSvc.prepareBookForAction(
                    open_library_key,
                    req.user.id_user,
                    'add_to_library'
                );
                if (prep.book && prep.book.import_status !== 'confirmed') {
                    await prep.book.update({
                        import_status: 'confirmed',
                        imported_reason: 'library'
                    });
                }
                effectiveBookId = prep.book.id_book;
            } catch (error: any) {
                res.status(404).json({
                    success: false,
                    message: "Impossible d'importer le livre (OpenLibrary)",
                    error: error?.message || 'unknown'
                });
                return;
            }
        }

        if (!effectiveBookId) {
            res.status(400).json({
                success: false,
                message: 'Aucun identifiant de livre fourni'
            });
            return;
        }

        // Vérifier que le livre existe
        const book = await Book.findByPk(effectiveBookId);
        if (!book) {
            res.status(404).json({
                success: false,
                message: 'Livre non trouvé'
            });
            return;
        }

        // Vérifier si le livre est déjà dans la bibliothèque
        const existingEntry = await ReadingList.findOne({
            where: { id_library: id, id_book: effectiveBookId }
        });

        if (existingEntry) {
            res.status(409).json({
                success: false,
                message: 'Ce livre est déjà dans cette bibliothèque'
            });
            return;
        }

        // Ajouter le livre avec status 'owned'
        const entry = await ReadingList.create({
            id_library: id,
            id_book: effectiveBookId,
            reading_status: 'owned',
            added_at: new Date()
        });

        const response: ApiResponse = {
            success: true,
            data: {
                entry,
                book: {
                    id_book: book.get('id_book'),
                    title: book.get('title'),
                    isbn: book.get('isbn')
                }
            },
            message: 'Livre ajouté à la bibliothèque avec succès'
        };
        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};