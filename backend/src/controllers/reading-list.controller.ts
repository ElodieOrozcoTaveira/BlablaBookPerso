import { Response, NextFunction } from 'express';
import { Op, fn, col } from 'sequelize';
import {
    ReadingListSearchQuery,
    ReadingListParams,
    CreateReadingListInput,
    UpdateReadingListInput
} from '../validation/reading-list.zod.js';
import ReadingList from '../models/ReadingList.js';
import Library from '../models/Library.js';
import Book from '../models/Book.js';
import { BookActionService } from '../services/book-action.service.js';
import { ReadingListService } from '../services/reading-list.service.js';
import { TypedRequest, PaginatedResponse, ApiResponse, AuthenticatedRequest } from '../types/express.js';

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
    const { id_library, id_book, open_library_key, reading_status } = req.body as any;

// ownership: je recupere la library deja injectee par middleware sinon fallback
        let library: any = (req as any).targetLibrary;
        if (!library) {
            library = await Library.findByPk(id_library);
        }
        if (!library) {
            res.status(404).json({ success: false, message: 'Bibliotheque non trouvee' });
            return;
        }
        if ((library.dataValues?.id_user || library.get('id_user')) !== req.user.id_user && !(req.user as any).roles?.includes('admin')) {
            // Je verifie que l'utilisateur est proprietaire de la bibliotheque
            res.status(403).json({ success: false, message: 'Vous ne pouvez ajouter des livres qu\'a vos propres bibliotheques' });
            return;
        }

        const service = new ReadingListService();
        try {
            const { entry, error } = await service.addEntry({ id_library, id_book, open_library_key, reading_status }, req.user.id_user);
            if (error) {
                res.status(error.code).json({ success: false, message: error.message });
                return;
            }
            const response: ApiResponse = { success: true, data: entry, message: 'Livre ajoute a la liste de lecture avec succes' };
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

export const getReadingList = async (
    req: TypedRequest<any, { library_id: number }, ReadingListSearchQuery>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Je recupere les parametres de la requete
        const { library_id } = req.params;
        const { page, limit, reading_status } = req.query;

        // J'utilise le service pour recuperer la liste de lecture
        const service = new ReadingListService();
        const { readingList, pagination, error } = await service.listEntries(library_id as any, {
            page: page || 1,
            limit: limit || 20,
            reading_status
        } as any) as any;
        if (error) {
            res.status(error.code).json({ success: false, message: error.message });
            return;
        }
        const response: PaginatedResponse = { success: true, data: readingList, pagination };
        res.json(response);
    } catch (error) {
        next(error);
    }
};

// --- Listes de lecture nommées ---

// GET /api/reading-lists/me/lists
export const getMyNamedLists = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
            return;
        }
        
        // Récupère toutes les listes nommées de l'utilisateur
        const libraries = await Library.findAll({ 
            where: { id_user: req.user.id_user },
            paranoid: false
        });
        
        const libraryIds = libraries
            .map(lib => lib.dataValues?.id_library || lib.get('id_library'))
            .filter((id): id is number => id !== null && id !== undefined);
        
        if (libraryIds.length === 0) {
            res.json({ success: true, data: [] });
            return;
        }
        
        const lists = await ReadingList.findAll({
            where: {
                id_library: { [Op.in]: libraryIds }
            },
            attributes: ['list_name'],
            group: ['list_name'],
            raw: true
        }) as unknown as { list_name: string | null }[];
        
        // Filtrer les listes avec un nom non nul
        const filteredLists = lists.filter((list) => list.list_name !== null);
        
        const listNames = filteredLists.map(list => list.list_name as string);
        res.json({ success: true, data: listNames });
    } catch (error) {
        next(error);
    }
};

// POST /api/reading-lists/create-list
export const createNamedList = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
            return;
        }
        const { list_name } = req.body;
        if (!list_name) {
            res.status(400).json({ success: false, message: 'Nom de liste manquant' });
            return;
        }
        // Note: Une liste nommée sera créée lors de l'ajout du premier livre
        res.status(201).json({ 
            success: true, 
            message: 'Liste nommée enregistrée (sera visible dès ajout d\'un livre)',
            data: { list_name }
        });
    } catch (error) {
        next(error);
    }
};


// POST /api/reading-lists/add-to-list
export const addBookToNamedList = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
            return;
        }
        const { id_library, id_book, list_name, reading_status } = req.body;
        if (!id_library || !id_book || !list_name) {
            res.status(400).json({ success: false, message: 'Paramètres manquants' });
            return;
        }
        
        const library = await Library.findByPk(id_library);
        if (!library || (library.dataValues?.id_user || library.get('id_user')) !== req.user.id_user) {
            res.status(403).json({ success: false, message: 'Accès refusé à la bibliothèque' });
            return;
        }
        
        // Ajoute le livre à la liste nommée
        const entry = await ReadingList.create({
            id_library,
            id_book,
            list_name,
            reading_status: reading_status || 'to_read',
            added_at: new Date()
        });
        
        res.status(201).json({ 
            success: true, 
            data: entry, 
            message: 'Livre ajouté à la liste nommée' 
        });
    } catch (error) {
        next(error);
    }
};


// GET /api/reading-lists/all
export const getAllReadingLists = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const lists = await ReadingList.findAll();
        res.json({ success: true, data: lists });
    } catch (error) {
        next(error);
    }
};



// GET /api/reading-lists/:id
export const getReadingListById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const entry = await ReadingList.findByPk(id);
        if (!entry) {
            res.status(404).json({ success: false, message: 'Entrée non trouvée' });
            return;
        }
        res.json({ success: true, data: entry });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/reading-lists/remove-list
export const removeNamedList = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
            return;
        }
        const { id_library, list_name } = req.body;
        if (!id_library || !list_name) {
            res.status(400).json({ success: false, message: 'Paramètres manquants' });
            return;
        }
        const library = await Library.findByPk(id_library);
        if (!library || (library.dataValues?.id_user || library.get('id_user')) !== req.user.id_user) {
            res.status(403).json({ success: false, message: 'Accès refusé à la bibliothèque' });
            return;
        }
        // Supprime toutes les entrées de la liste nommée
        await ReadingList.destroy({ where: { id_library, list_name } });
        res.json({ success: true, message: 'Liste nommée supprimée' });
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
            res.status(401).json({ success: false, message: 'Utilisateur non authentifie' });
            return;
        }
        const { reading_status, list_name } = req.body;
        let readingListEntry: any = (req as any).readingListEntry;
        if (!readingListEntry) {
            const { id } = req.params;
            readingListEntry = await ReadingList.findByPk(id);
            if (!readingListEntry) {
                res.status(404).json({ success: false, message: 'Entree de liste de lecture non trouvee' });
                return;
            }
// Vérifie propriétaire via la library liée (si disponible)
            const library = await Library.findByPk(readingListEntry.id_library);
            if (library && (library.dataValues?.id_user || library.get('id_user')) !== req.user.id_user && !(req.user as any).is_admin) {
                res.status(403).json({ success: false, message: 'Acces refuse' });
                return;
            }
        }
        const updateData: any = {};

// Mettre à jour le statut de lecture s'il est fourni
        if (reading_status) {
            updateData.reading_status = reading_status;
        }

// Mettre à jour le nom de liste s'il est fourni
        if (list_name !== undefined) {
            updateData.list_name = list_name;
        }

// Mettre a jour les dates selon le statut
        if (reading_status) {
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
            res.status(401).json({ success: false, message: 'Utilisateur non authentifie' });
            return;
        }
        let readingListEntry: any = (req as any).readingListEntry;
        if (!readingListEntry) {
            const { id } = req.params;
            readingListEntry = await ReadingList.findByPk(id);
            if (!readingListEntry) {
                res.status(404).json({ success: false, message: 'Entree de liste de lecture non trouvee' });
                return;
            }
            const library = await Library.findByPk(readingListEntry.dataValues?.id_library || readingListEntry.get('id_library'));
            // Je verifie que l'utilisateur est proprietaire de la bibliotheque
            if (library && (library.dataValues?.id_user || library.get('id_user')) !== req.user.id_user && !(req.user as any).is_admin) {
                res.status(403).json({ success: false, message: 'Acces refuse' });
                return;
            }
        }
        // Au lieu de supprimer, revenir à "owned" (reste dans la collection)
        await readingListEntry.update({ 
            reading_status: 'owned',
            started_at: null,
            finished_at: null 
        });

        const response: ApiResponse = {
            success: true,
            data: readingListEntry,
            message: 'Livre retiré de la liste de lecture (conservé dans la collection)'
        };
        res.json(response);

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
            where: { id_user: req.user.id_user },
            attributes: ['id_library']
        });

        const libraryIds = userLibraries
            .map(lib => lib.dataValues?.id_library || lib.get('id_library'))
            .filter((id): id is number => id !== null && id !== undefined);

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