import { Request, Response } from 'express';
import { AuthenticatedRequest, IBook, CreateBookDTO, BookSearchQuery, ApiResponse, PaginatedResponse } from '../types';

/**
 * Book Controller
 * Handles book search, CRUD operations and management
 * Routes: GET/POST /api/books, GET/PUT/DELETE /api/books/:id
 */
export class BookController {
  
  /**
   * Search books
   * GET /api/books?search=...&genre=...&author=...&page=...&limit=...
   */
  async searchBooks(req: Request, res: Response): Promise<void> {
    try {
      const query: BookSearchQuery = {
        search: req.query.search as string,
        genre: req.query.genre as string,
        author: req.query.author as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sortBy: req.query.sortBy as string || 'title',
        sortOrder: (req.query.sortOrder as 'ASC' | 'DESC') || 'ASC'
      };

      // TODO: Implement book search using Sequelize with joins
      // const { books, count } = await Book.findAndCountAll({
      //   include: [
      //     { model: Author, through: BookAuthor },
      //     { model: Genre, through: BookGenre }
      //   ],
      //   where: buildSearchConditions(query),
      //   order: [[query.sortBy, query.sortOrder]],
      //   limit: query.limit,
      //   offset: (query.page - 1) * query.limit
      // });

      // Mock response for now
      const mockBooks: IBook[] = [
        {
          id_book: 1,
          isbn: '978-2-123456-78-9',
          title: 'Le Guide du Développeur JavaScript',
          summary: 'Un guide complet pour apprendre JavaScript moderne',
          nb_pages: 450,
          published_at: new Date('2023-01-15'),
          cover_url: '/uploads/covers/book-1.jpg',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      const totalPages = Math.ceil(1 / query.limit!);

      res.json({
        success: true,
        data: mockBooks,
        message: 'Books retrieved successfully',
        pagination: {
          page: query.page,
          limit: query.limit,
          total: 1,
          totalPages
        }
      } as PaginatedResponse<IBook>);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error searching books',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Get book details
   * GET /api/books/:id
   */
  async getBookById(req: Request, res: Response): Promise<void> {
    try {
      const bookId = parseInt(req.params.id);
      
      if (!bookId) {
        res.status(400).json({
          success: false,
          message: 'Invalid book ID'
        } as ApiResponse);
        return;
      }

      // TODO: Fetch book with authors, genres, and ratings
      // const book = await Book.findByPk(bookId, {
      //   include: [
      //     { model: Author, through: BookAuthor },
      //     { model: Genre, through: BookGenre },
      //     { model: Rate, include: [User] }
      //   ]
      // });

      // Mock response
      const mockBook: IBook = {
        id_book: bookId,
        isbn: '978-2-123456-78-9',
        title: 'Le Guide du Développeur JavaScript',
        summary: 'Un guide complet pour apprendre JavaScript moderne',
        nb_pages: 450,
        published_at: new Date('2023-01-15'),
        cover_url: '/uploads/covers/book-1.jpg',
        created_at: new Date(),
        updated_at: new Date()
      };

      res.json({
        success: true,
        data: mockBook,
        message: 'Book retrieved successfully'
      } as ApiResponse<IBook>);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving book',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Create new book (Admin only)
   * POST /api/books
   */
  async createBook(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // TODO: Check admin permissions
      // if (!hasPermission(req.user, 'CREATE_BOOK')) {
      //   return res.status(403).json({
      //     success: false,
      //     message: 'Insufficient permissions'
      //   });
      // }

      const bookData: CreateBookDTO = req.body;

      // Validate required fields
      if (!bookData.title) {
        res.status(400).json({
          success: false,
          message: 'Book title is required'
        } as ApiResponse);
        return;
      }

      // TODO: Create book in database
      // const newBook = await Book.create(bookData);
      
      // Mock response
      const newBook: IBook = {
        id_book: 999,
        ...bookData,
        created_at: new Date(),
        updated_at: new Date()
      };

      res.status(201).json({
        success: true,
        data: newBook,
        message: 'Book created successfully'
      } as ApiResponse<IBook>);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating book',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Update book (Admin only)
   * PUT /api/books/:id
   */
  async updateBook(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const bookId = parseInt(req.params.id);
      
      if (!bookId) {
        res.status(400).json({
          success: false,
          message: 'Invalid book ID'
        } as ApiResponse);
        return;
      }

      const updateData = req.body;

      // TODO: Update book in database
      // const [affectedRows] = await Book.update(updateData, {
      //   where: { id_book: bookId }
      // });

      res.json({
        success: true,
        message: 'Book updated successfully'
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating book',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Delete book (Admin only)
   * DELETE /api/books/:id
   */
  async deleteBook(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const bookId = parseInt(req.params.id);
      
      if (!bookId) {
        res.status(400).json({
          success: false,
          message: 'Invalid book ID'
        } as ApiResponse);
        return;
      }

      // TODO: Delete book (or soft delete)
      // await Book.destroy({ where: { id_book: bookId } });

      res.json({
        success: true,
        message: 'Book deleted successfully'
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting book',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }
}

export default new BookController();