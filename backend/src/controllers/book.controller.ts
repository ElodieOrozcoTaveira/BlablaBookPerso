import { Response, NextFunction } from 'express';
import {
  BookSearchQuery,
  BookParams,
  CreateBookInput,
  UpdateBookInput
} from '../validation/book.zod.js';
import { BookService } from '../services/book.service.js';
import { TypedRequest, PaginatedResponse, ApiResponse, AuthenticatedRequest } from '../types/express.js';


export const createBook = async (
    req: TypedRequest<any, any, CreateBookInput>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const bookService = new BookService();
        const book = await bookService.create(req.body);

        const response: ApiResponse = {
            success: true,
            data: book,
            message: 'Livre cree avec succes'
        };
        res.status(201).json(response);
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
        const bookService = new BookService();
        const result = await bookService.findAll(req.query);

        const response: PaginatedResponse = {
            success: true,
            data: result.books,
            pagination: result.pagination,
            ...(result.meta && { meta: result.meta })
        };
        res.status(200).json(response);
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
        const { id } = req.params;
        const bookService = new BookService();
        const book = await bookService.findById(id);

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

export const updateBook = async (
    req: AuthenticatedRequest<UpdateBookInput, BookParams>,
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
        const bookService = new BookService();
        const book = await bookService.update(id, req.body);
        
        if (!book) {
            res.status(404).json({
                success: false,
                message: 'Livre non trouve'
            });
            return;
        }

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
    req: AuthenticatedRequest<any, BookParams>,
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
        const bookService = new BookService();
        const deleted = await bookService.delete(id);

        if (!deleted) {
            res.status(404).json({
                success: false,
                message: 'Livre non trouve'
            });
            return;
        }

        // 204 No Content pour DELETE reussi
        res.status(204).end();
    } catch (error) {
        next(error);
    }
};

