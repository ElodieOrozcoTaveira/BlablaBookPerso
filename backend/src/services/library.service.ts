import { Op } from 'sequelize';
import Library from '../models/Library.js';
import User from '../models/User.js';
import Book from '../models/Book.js';
import ReadingList from '../models/ReadingList.js';
import { CreateLibraryInput, UpdateLibraryInput, LibrarySearchQuery } from '../validation/library.zod.js';

export class LibraryService {

    public async create(userId: number, data: CreateLibraryInput): Promise<Library> {
        const libraryData: any = {
            name: data.name,
            is_public: data.is_public,
            id_user: userId
        };
        if (data.description !== undefined) {
            libraryData.description = data.description;
        }
        const library = await Library.create(libraryData);
        return library;
    }

    public async findAll(searchQuery: LibrarySearchQuery, userId?: number) {
        const { page = 1, limit = 20, query, name, is_public } = searchQuery;
        const offset = (page - 1) * limit;

        const where: any = {};

        if (query) {
            where[Op.or as any] = [
                { name: { [Op.iLike]: `%${query}%` } },
                { description: { [Op.iLike]: `%${query}%` } }
            ];
        }

        if (name) {
            where.name = { [Op.iLike]: `%${name}%` };
        }

        if (is_public !== undefined) {
            where.is_public = is_public;
        }

        if (!userId) {
            where.is_public = true;
        } else if (is_public === undefined) {
            where[Op.or as any] = [
                { is_public: true },
                { id_user: userId }
            ];
        }

        const { count, rows } = await Library.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'LibraryBelongsToUser',
                    attributes: ['id_user', 'firstname', 'lastname', 'email']
                }
            ],
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });

        return { libraries: rows, total: count, page, limit };
    }

    public async findById(libraryId: number, userId?: number): Promise<Library | null> {
        const library = await Library.findByPk(libraryId, {
            include: [
                {
                    model: User,
                    as: 'LibraryBelongsToUser',
                    attributes: ['id_user', 'firstname', 'lastname', 'email']
                }
            ]
        });

        if (!library) {return null;}

        const isOwner = userId && library.get('id_user') === userId;
        const isPublic = library.get('is_public');

        if (isPublic || isOwner) {
            return library;
        }

        return null; // Renvoie null si l'acces n'est pas autorise
    }

    public async update(libraryId: number, userId: number, data: UpdateLibraryInput): Promise<Library | null> {
        const library = await Library.findByPk(libraryId);

        if (!library) {return null;}

        if (library.get('id_user') !== userId) {
            const error = new Error('Forbidden') as any;
            error.statusCode = 403;
            throw error;
        }

        // Nettoyer les donnees pour eviter les `undefined` explicites
        const cleanData: { name?: string; description?: string; is_public?: boolean } = {};
        if (data.name !== undefined) {cleanData.name = data.name;}
        if (data.description !== undefined) {cleanData.description = data.description;}
        if (data.is_public !== undefined) {cleanData.is_public = data.is_public;}

        await library.update(cleanData);
        return this.findById(libraryId, userId);
    }

    public async delete(libraryId: number, userId: number): Promise<boolean> {
        const library = await Library.findByPk(libraryId);

        if (!library) {return false;}

        if (library.get('id_user') !== userId) {
            const error = new Error('Forbidden') as any;
            error.statusCode = 403;
            throw error;
        }

        await library.destroy();
        return true;
    }

    public async findUserLibraries(userId: number): Promise<Library[]> {
        return Library.findAll({
            where: { id_user: userId },
            include: [
                {
                    model: User,
                    attributes: ['id_user', 'firstname', 'lastname', 'username']
                }
            ],
            order: [['created_at', 'DESC']]
        });
    }

    public async addBookToLibrary(libraryId: number, bookId: number, userId: number): Promise<boolean> {
        const library = await Library.findByPk(libraryId);

        if (!library) {
            const error = new Error('Bibliothèque non trouvée') as any;
            error.statusCode = 404;
            throw error;
        }

        if (library.get('id_user') !== userId) {
            const error = new Error('Forbidden') as any;
            error.statusCode = 403;
            throw error;
        }

        const book = await Book.findByPk(bookId);
        if (!book) {
            const error = new Error('Livre non trouvé') as any;
            error.statusCode = 404;
            throw error;
        }

        const existingEntry = await ReadingList.findOne({
            where: { id_library: libraryId, id_book: bookId }
        });

        if (existingEntry) {
            const error = new Error('Le livre est déjà dans cette bibliothèque') as any;
            error.statusCode = 409;
            throw error;
        }

        await ReadingList.create({
            id_library: libraryId,
            id_book: bookId,
            reading_status: 'to_read',
            added_at: new Date()
        });

        return true;
    }

    public async removeBookFromLibrary(libraryId: number, bookId: number, userId: number): Promise<boolean> {
        const library = await Library.findByPk(libraryId);

        if (!library) {
            const error = new Error('Bibliothèque non trouvée') as any;
            error.statusCode = 404;
            throw error;
        }

        if (library.get('id_user') !== userId) {
            const error = new Error('Forbidden') as any;
            error.statusCode = 403;
            throw error;
        }

        const readingListEntry = await ReadingList.findOne({
            where: { id_library: libraryId, id_book: bookId }
        });

        if (!readingListEntry) {
            return false;
        }

        await readingListEntry.destroy();
        return true;
    }
}

