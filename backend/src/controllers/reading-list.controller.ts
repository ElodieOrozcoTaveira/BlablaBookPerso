import { Request, Response } from 'express';
import { AuthenticatedRequest, IReadingList, CreateReadingListDTO, ApiResponse, PaginatedResponse } from '../types';

/**
 * Reading List Controller
 * Handles user reading lists management
 * Routes: GET/POST /api/reading-lists, GET/PUT/DELETE /api/reading-lists/:id, POST/DELETE /api/reading-lists/:id/books/:bookId
 */
export class ReadingListController {
  
  /**
   * Get user's reading lists
   * GET /api/reading-lists
   */
  async getUserReadingLists(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - User not authenticated'
        } as ApiResponse);
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // TODO: Fetch user reading lists with book count
      // const { readingLists, count } = await ReadingList.findAndCountAll({
      //   where: { 
      //     id_user: req.user.id_user,
      //     deleted_at: null 
      //   },
      //   include: [{
      //     model: Book,
      //     through: BookInList,
      //     attributes: ['id_book', 'title', 'cover_url']
      //   }],
      //   limit,
      //   offset: (page - 1) * limit,
      //   order: [['created_at', 'DESC']]
      // });

      // Mock response
      const mockReadingLists: IReadingList[] = [
        {
          id_reading_list: 1,
          id_user: req.user.id_user!,
          title: 'À lire absolument',
          description: 'Ma liste de livres incontournables',
          is_public: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id_reading_list: 2,
          id_user: req.user.id_user!,
          title: 'Livres techniques 2024',
          description: 'Objectifs de lecture technique pour cette année',
          is_public: false,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      const totalPages = Math.ceil(2 / limit);

      res.json({
        success: true,
        data: mockReadingLists,
        message: 'Reading lists retrieved successfully',
        pagination: {
          page,
          limit,
          total: 2,
          totalPages
        }
      } as PaginatedResponse<IReadingList>);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving reading lists',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Get reading list details with books
   * GET /api/reading-lists/:id
   */
  async getReadingListById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const listId = parseInt(req.params.id);
      
      if (!listId) {
        res.status(400).json({
          success: false,
          message: 'Invalid reading list ID'
        } as ApiResponse);
        return;
      }

      // TODO: Fetch reading list with books and check ownership/public access
      // const readingList = await ReadingList.findByPk(listId, {
      //   include: [{
      //     model: Book,
      //     through: BookInList,
      //     include: [
      //       { model: Author, through: BookAuthor },
      //       { model: Genre, through: BookGenre }
      //     ]
      //   }]
      // });

      // Check if reading list exists and user has access
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        } as ApiResponse);
        return;
      }

      // Mock response
      const mockReadingList = {
        id_reading_list: listId,
        id_user: req.user.id_user,
        title: 'À lire absolument',
        description: 'Ma liste de livres incontournables',
        is_public: true,
        created_at: new Date(),
        updated_at: new Date(),
        books: [
          {
            id_book: 1,
            title: 'Clean Code',
            isbn: '978-0-132350-88-4',
            cover_url: '/uploads/covers/clean-code.jpg',
            authors: ['Robert C. Martin']
          }
        ]
      };

      res.json({
        success: true,
        data: mockReadingList,
        message: 'Reading list retrieved successfully'
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving reading list',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Create new reading list
   * POST /api/reading-lists
   */
  async createReadingList(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - User not authenticated'
        } as ApiResponse);
        return;
      }

      const listData: CreateReadingListDTO = req.body;

      if (!listData.title) {
        res.status(400).json({
          success: false,
          message: 'Reading list title is required'
        } as ApiResponse);
        return;
      }

      // TODO: Create reading list in database
      // const newReadingList = await ReadingList.create({
      //   ...listData,
      //   id_user: req.user.id_user
      // });

      // Mock response
      const newReadingList: IReadingList = {
        id_reading_list: 999,
        id_user: req.user.id_user!,
        title: listData.title,
        description: listData.description,
        is_public: listData.is_public || false,
        created_at: new Date(),
        updated_at: new Date()
      };

      res.status(201).json({
        success: true,
        data: newReadingList,
        message: 'Reading list created successfully'
      } as ApiResponse<IReadingList>);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating reading list',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Update reading list
   * PUT /api/reading-lists/:id
   */
  async updateReadingList(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - User not authenticated'
        } as ApiResponse);
        return;
      }

      const listId = parseInt(req.params.id);
      const updateData = req.body;

      if (!listId) {
        res.status(400).json({
          success: false,
          message: 'Invalid reading list ID'
        } as ApiResponse);
        return;
      }

      // TODO: Check ownership and update
      // const [affectedRows] = await ReadingList.update(updateData, {
      //   where: { 
      //     id_reading_list: listId,
      //     id_user: req.user.id_user 
      //   }
      // });

      res.json({
        success: true,
        message: 'Reading list updated successfully'
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating reading list',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Delete reading list
   * DELETE /api/reading-lists/:id
   */
  async deleteReadingList(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - User not authenticated'
        } as ApiResponse);
        return;
      }

      const listId = parseInt(req.params.id);

      if (!listId) {
        res.status(400).json({
          success: false,
          message: 'Invalid reading list ID'
        } as ApiResponse);
        return;
      }

      // TODO: Soft delete reading list
      // await ReadingList.update(
      //   { deleted_at: new Date() },
      //   { where: { id_reading_list: listId, id_user: req.user.id_user } }
      // );

      res.json({
        success: true,
        message: 'Reading list deleted successfully'
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting reading list',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Add book to reading list
   * POST /api/reading-lists/:id/books
   * Body: { id_book: number }
   */
  async addBookToReadingList(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - User not authenticated'
        } as ApiResponse);
        return;
      }

      const listId = parseInt(req.params.id);
      const { id_book } = req.body;

      if (!listId || !id_book) {
        res.status(400).json({
          success: false,
          message: 'Invalid reading list ID or book ID'
        } as ApiResponse);
        return;
      }

      // TODO: Add book to reading list (check ownership and book existence)
      // await BookInList.create({
      //   id_reading_list: listId,
      //   id_book: id_book
      // });

      res.json({
        success: true,
        message: 'Book added to reading list successfully'
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error adding book to reading list',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Remove book from reading list
   * DELETE /api/reading-lists/:id/books/:bookId
   */
  async removeBookFromReadingList(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - User not authenticated'
        } as ApiResponse);
        return;
      }

      const listId = parseInt(req.params.id);
      const bookId = parseInt(req.params.bookId);

      if (!listId || !bookId) {
        res.status(400).json({
          success: false,
          message: 'Invalid reading list ID or book ID'
        } as ApiResponse);
        return;
      }

      // TODO: Remove book from reading list (check ownership)
      // await BookInList.destroy({
      //   where: {
      //     id_reading_list: listId,
      //     id_book: bookId
      //   }
      // });

      res.json({
        success: true,
        message: 'Book removed from reading list successfully'
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error removing book from reading list',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }
}

export default new ReadingListController();