import { Response, NextFunction } from 'express';
import { Op, fn, col } from 'sequelize';
import {
    ReadingListSearchQuery,
    ReadingListParams,
    CreateReadingListInput,
    UpdateReadingListInput
} from '../validation/reading-list.zod';
import ReadingList from '../models/ReadingList';
import Library from '../models/Library';
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

export const addBookToReadingList = async (
    req: AuthenticatedRequest<CreateReadingListInput>,
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
        const { id_library, id_book, reading_status } = req.body;

        // Verifier que la bibliotheque existe et appartient a l'utilisateur
        const library = await Library.findByPk(id_library);
        if (!library) {
            res.status(404).json({
                success: false,
                message: 'Bibliotheque non trouvee'
            });
            return;
        }

        if (library.id_user !== parseInt(req.user.id)) {
            res.status(403).json({
                success: false,
                message: 'Vous ne pouvez ajouter des livres qu\'a vos propres bibliotheques'
            });
            return;
        }

        // Verifier que le livre existe
        const book = await Book.findByPk(id_book);
        if (!book) {
            res.status(404).json({
                success: false,
                message: 'Livre non trouve'
            });
            return;
        }

        // Verifier si le livre n'est pas deja dans la liste de lecture
        const existingEntry = await ReadingList.findOne({
            where: {
                id_library,
                id_book
            }
        });

        if (existingEntry) {
            res.status(409).json({
                success: false,
                message: 'Ce livre est deja dans cette liste de lecture'
            });
            return;
        }

        const readingListData = {
            id_library,
            id_book,
            reading_status: reading_status || 'to_read',
            added_at: new Date(),
            started_at: reading_status === 'reading' ? new Date() : undefined,
            finished_at: reading_status === 'read' ? new Date() : undefined
        };

        const readingListEntry = await ReadingList.create(readingListData);

        const response: ApiResponse = {
            success: true,
            data: readingListEntry,
            message: 'Livre ajoute a la liste de lecture avec succes'
        };
        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};

export const getReadingList = async (
    req: TypedRequest<any, { library_id: number }, ReadingListSearchQuery>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // req.params deja valide par middleware
        const { library_id } = req.params;

        // Verifier que la bibliotheque existe
        const library = await Library.findByPk(library_id);
        if (!library) {
            res.status(404).json({
                success: false,
                message: 'Bibliotheque non trouvee'
            });
            return;
        }

        // req.query deja valide par middleware
        const { page, limit, reading_status } = req.query;

        const where: Record<string, any> = {
            id_library: library_id
        };

        // Filtre par statut de lecture
        if (reading_status) {
            where['reading_status'] = reading_status;
        }

        const offset = (page - 1) * limit;

        const { rows: readingList, count: total } = await ReadingList.findAndCountAll({
            where,
            attributes: ['id_reading_list', 'id_book', 'reading_status', 'added_at', 'started_at', 'finished_at', 'created_at', 'updated_at'],
            // TODO: include Book quand setupAssociations sera configure
            limit,
            offset,
            order: [['added_at', 'DESC']]
        });
        
        const totalPages = Math.ceil(total / limit);

        const response: PaginatedResponse = {
            success: true,
            data: readingList,
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

export const updateReadingStatus = async (
    req: AuthenticatedRequest<UpdateReadingListInput, ReadingListParams>,
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
        const { reading_status } = req.body;
        
        const readingListEntry = await ReadingList.findByPk(id);
        if (!readingListEntry) {
            res.status(404).json({
                success: false,
                message: 'Entree de liste de lecture non trouvee'
            });
            return;
        }

        // Verifier que la bibliotheque appartient a l'utilisateur
        const library = await Library.findByPk(readingListEntry.id_library);
        if (!library || library.id_user !== parseInt(req.user.id)) {
            res.status(403).json({
                success: false,
                message: 'Vous ne pouvez modifier que vos propres listes de lecture'
            });
            return;
        }

        const updateData: any = { reading_status };

        // Mettre a jour les dates selon le statut
        switch (reading_status) {
            case 'reading':
                if (!readingListEntry.started_at) {
                    updateData.started_at = new Date();
                }
                break;
            case 'read':
                if (!readingListEntry.started_at) {
                    updateData.started_at = new Date();
                }
                updateData.finished_at = new Date();
                break;
            case 'abandoned':
                updateData.finished_at = new Date();
                break;
            case 'to_read':
                updateData.started_at = null;
                updateData.finished_at = null;
                break;
        }

        await readingListEntry.update(updateData);

        const response: ApiResponse = {
            success: true,
            data: readingListEntry,
            message: 'Statut de lecture mis a jour avec succes'
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};

export const removeBookFromReadingList = async (
    req: AuthenticatedRequest<any, ReadingListParams>,
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
        
        const readingListEntry = await ReadingList.findByPk(id);
        if (!readingListEntry) {
            res.status(404).json({
                success: false,
                message: 'Entree de liste de lecture non trouvee'
            });
            return;
        }

        // Verifier que la bibliotheque appartient a l'utilisateur
        const library = await Library.findByPk(readingListEntry.id_library);
        if (!library || library.id_user !== parseInt(req.user.id)) {
            res.status(403).json({
                success: false,
                message: 'Vous ne pouvez supprimer que de vos propres listes de lecture'
            });
            return;
        }

        await readingListEntry.destroy();

        // 204 No Content pour DELETE reussi
        res.status(204).end();
    } catch (error) {
        next(error);
    }
};

export const getMyReadingStats = async (
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

        // Obtenir toutes les bibliotheques de l'utilisateur
        const userLibraries = await Library.findAll({
            where: { id_user: parseInt(req.user.id) },
            attributes: ['id_library']
        });

        const libraryIds = userLibraries.map(lib => lib.id_library);

        if (libraryIds.length === 0) {
            const response: ApiResponse = {
                success: true,
                data: {
                    totalBooks: 0,
                    toRead: 0,
                    reading: 0,
                    read: 0,
                    abandoned: 0
                }
            };
            res.json(response);
            return;
        }

        // Compter les livres par statut
        const stats = await ReadingList.findAll({
            where: {
                id_library: { [Op.in]: libraryIds }
            },
            attributes: [
                'reading_status',
                [fn('COUNT', col('reading_status')), 'count']
            ],
            group: ['reading_status'],
            raw: true
        }) as any[];

        const statsMap = stats.reduce((acc, stat) => {
            acc[stat.reading_status] = parseInt(stat.count);
            return acc;
        }, {});

        const response: ApiResponse = {
            success: true,
            data: {
                totalBooks: stats.reduce((sum, stat) => sum + parseInt(stat.count), 0),
                toRead: statsMap.to_read || 0,
                reading: statsMap.reading || 0,
                read: statsMap.read || 0,
                abandoned: statsMap.abandoned || 0
            }
        };
        res.json(response);
    } catch (error) {
        next(error);
    }
};