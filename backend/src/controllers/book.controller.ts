import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import {
  BookSearchQuery,
  BookParams,
  CreateBookInput,
  UpdateBookInput
} from '../validation/book.zod';
import Book from '../models/Book';
import Author from '../models/Author';
import Genre from '../models/Genre';
import { TypedRequest, PaginatedResponse, ApiResponse } from '../types/express';


export const createBook = async (
    req: TypedRequest<CreateBookInput>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // req.body deja valide par middleware
        const { author_ids, genre_ids, ...bookData } = req.body;

        // Creer le livre d'abord (sans relations pour l'instant)
        const book = await Book.create(bookData);

        // Gestion des relations Many-to-Many
        if (author_ids && author_ids.length > 0) {
            await book.setBookHasAuthors(author_ids);
        }
        if (genre_ids && genre_ids.length > 0) {
            await book.setBookHasGenres(genre_ids);
        }

        const response: ApiResponse = {
            success: true,
            data: book,
            message: 'Livre cree avec succes (relations TODO)'
        };
        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};

export const getBookById = async (
    req: TypedRequest<any, BookParams>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // req.params deja valide par middleware
        const { id } = req.params;
        
        // Include relations
        const book = await Book.findByPk(id, {
            include: [
                { model: Author, as: 'BookHasAuthors', through: { attributes: [] } },
                { model: Genre, as: 'BookHasGenres', through: { attributes: [] } }
            ]
        });

        if (!book) {
            res.status(404).json({
                success: false,
                message: 'Livre non trouve'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: book
        });
    } catch (error) {
        next(error);
    }
};


export const getAllBooks = async (
    req: TypedRequest<any, any, BookSearchQuery>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // req.query deja valide par middleware
        const { page, limit, query, isbn, publication_year } = req.query;

        const where: Record<string, any> = {};

        // Recherche par titre
        if (query) {
            where['title'] = { [Op.iLike]: `%${query}%` };
        }

        // Recherche par ISBN
        if (isbn) {
            where['isbn'] = { [Op.iLike]: `%${isbn}%` };
        }

        // Recherche par annee
        if (publication_year) {
            where['publication_year'] = publication_year;
        }

        // TODO: Recherche par auteur et genre (necessite des jointures)
        
        const offset = (page - 1) * limit;

        const { rows: books, count: total } = await Book.findAndCountAll({
            where,
            include: [
                { model: Author, as: 'BookHasAuthors', through: { attributes: [] } },
                { model: Genre, as: 'BookHasGenres', through: { attributes: [] } }
            ],
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });
        
        const totalPages = Math.ceil(total / limit);

        const response: PaginatedResponse = {
            success: true,
            data: books,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        };
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const updateBook = async (
    req: TypedRequest<UpdateBookInput, BookParams>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // req.params et req.body deja valides par middlewares
        const { id } = req.params;
        const { author_ids, genre_ids, ...updateData } = req.body;
        
        const book = await Book.findByPk(id);
        if (!book) {
            res.status(404).json({
                success: false,
                message: 'Livre non trouve'
            });
            return;
        }

        // Mettre a jour les champs du livre
        const cleanData = Object.fromEntries(
            Object.entries(updateData).filter(([, value]) => value !== undefined)
        );
        await book.update(cleanData);

        // Gestion des relations Many-to-Many avec alias
        if (author_ids !== undefined) {
            await book.setBookHasAuthors(author_ids);
        }
        if (genre_ids !== undefined) {
            await book.setBookHasGenres(genre_ids);
        }

        // Recharger avec les relations
        await book.reload({
            include: [
                { model: Author, as: 'BookHasAuthors', through: { attributes: [] } },
                { model: Genre, as: 'BookHasGenres', through: { attributes: [] } }
            ]
        });

        res.status(200).json({
            success: true,
            data: book,
            message: 'Livre mis a jour avec succes'
        });
    } catch (error) {
        next(error);
    }
};

export const deleteBook = async (
    req: TypedRequest<any, BookParams>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // req.params deja valide par middleware
        const { id } = req.params;
        const book = await Book.findByPk(id);

        if (!book) {
            res.status(404).json({
                success: false,
                message: 'Livre non trouve'
            });
            return;
        }

        // Les relations Many-to-Many sont supprimees automatiquement
        await book.destroy();

        // 204 No Content pour DELETE reussi
        res.status(204).end();
    } catch (error) {
        next(error);
    }
};
