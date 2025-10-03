import { Request, Response } from 'express';
import { AuthenticatedRequest, ILibrary, CreateLibraryDTO, ApiResponse, PaginatedResponse } from '../types';

/**
 * Library Controller
 * Handles personal book libraries
 * Routes: GET/POST /api/libraries, GET/PUT/DELETE /api/libraries/:id, POST/DELETE /api/libraries/:id/books/:bookId
 */
export class LibraryController {
  
  /**
   * Get user's libraries
   * GET /api/libraries
   */
  async getUserLibraries(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      // TODO: Fetch user libraries with book count
      // const { libraries, count } = await Library.findAndCountAll({
      //   where: { 
      //     id_user: req.user.id_user,
      //     deleted_at: null 
      //   },
      //   include: [{
      //     model: Book,
      //     through: BookLibrary,
      //     attributes: ['id_book', 'title', 'cover_url']
      //   }],
      //   limit,
      //   offset: (page - 1) * limit,
      //   order: [['created_at', 'DESC']]
      // });

      // Mock response
      const mockLibraries: ILibrary[] = [
        {
          id_library: 1,
          id_user: req.user.id_user!,
          name: 'Ma bibliothèque de développement',
          description: 'Livres techniques et guides de programmation',
          is_public: false,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      const totalPages = Math.ceil(1 / limit);

      res.json({
        success: true,
        data: mockLibraries,
        message: 'Libraries retrieved successfully',
        pagination: {
          page,
          limit,
          total: 1,
          totalPages
        }
      } as PaginatedResponse<ILibrary>);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving libraries',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Get library details with books
   * GET /api/libraries/:id
   */
  async getLibraryById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const libraryId = parseInt(req.params.id);
      
      if (!libraryId) {
        res.status(400).json({
          success: false,
          message: 'Invalid library ID'
        } as ApiResponse);
        return;
      }

      // TODO: Fetch library with books and check ownership/public access
      // const library = await Library.findByPk(libraryId, {
      //   include: [{
      //     model: Book,
      //     through: BookLibrary,
      //     include: [
      //       { model: Author, through: BookAuthor },
      //       { model: Genre, through: BookGenre }
      //     ]
      //   }]
      // });

      // Check if library exists and user has access
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        } as ApiResponse);
        return;
      }

      // Mock response
      const mockLibrary = {
        id_library: libraryId,
        id_user: req.user.id_user,
        name: 'Ma bibliothèque de développement',
        description: 'Livres techniques et guides de programmation',
        is_public: false,
        created_at: new Date(),
        updated_at: new Date(),
        books: []
      };

      res.json({
        success: true,
        data: mockLibrary,
        message: 'Library retrieved successfully'
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving library',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Create new library
   * POST /api/libraries
   */
  async createLibrary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - User not authenticated'
        } as ApiResponse);
        return;
      }

      const libraryData: CreateLibraryDTO = req.body;

      if (!libraryData.name) {
        res.status(400).json({
          success: false,
          message: 'Library name is required'
        } as ApiResponse);
        return;
      }

      // TODO: Create library in database
      // const newLibrary = await Library.create({
      //   ...libraryData,
      //   id_user: req.user.id_user
      // });

      // Mock response
      const newLibrary: ILibrary = {
        id_library: 999,
        id_user: req.user.id_user!,
        name: libraryData.name,
        description: libraryData.description,
        is_public: libraryData.is_public || false,
        created_at: new Date(),
        updated_at: new Date()
      };

      res.status(201).json({
        success: true,
        data: newLibrary,
        message: 'Library created successfully'
      } as ApiResponse<ILibrary>);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating library',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Update library
   * PUT /api/libraries/:id
   */
  async updateLibrary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - User not authenticated'
        } as ApiResponse);
        return;
      }

      const libraryId = parseInt(req.params.id);
      const updateData = req.body;

      if (!libraryId) {
        res.status(400).json({
          success: false,
          message: 'Invalid library ID'
        } as ApiResponse);
        return;
      }

      // TODO: Check ownership and update
      // const [affectedRows] = await Library.update(updateData, {
      //   where: { 
      //     id_library: libraryId,
      //     id_user: req.user.id_user 
      //   }
      // });

      res.json({
        success: true,
        message: 'Library updated successfully'
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating library',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Delete library
   * DELETE /api/libraries/:id
   */
  async deleteLibrary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - User not authenticated'
        } as ApiResponse);
        return;
      }

      const libraryId = parseInt(req.params.id);

      if (!libraryId) {
        res.status(400).json({
          success: false,
          message: 'Invalid library ID'
        } as ApiResponse);
        return;
      }

      // TODO: Soft delete library
      // await Library.update(
      //   { deleted_at: new Date() },
      //   { where: { id_library: libraryId, id_user: req.user.id_user } }
      // );

      res.json({
        success: true,
        message: 'Library deleted successfully'
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting library',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Add book to library
   * POST /api/libraries/:id/books/:bookId
   */
  async addBookToLibrary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - User not authenticated'
        } as ApiResponse);
        return;
      }

      const libraryId = parseInt(req.params.id);
      const bookId = parseInt(req.params.bookId);

      if (!libraryId || !bookId) {
        res.status(400).json({
          success: false,
          message: 'Invalid library or book ID'
        } as ApiResponse);
        return;
      }

      // TODO: Add book to library (check ownership and book existence)
      // await BookLibrary.create({
      //   id_library: libraryId,
      //   id_book: bookId
      // });

      res.json({
        success: true,
        message: 'Book added to library successfully'
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error adding book to library',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Remove book from library
   * DELETE /api/libraries/:id/books/:bookId
   */
  async removeBookFromLibrary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - User not authenticated'
        } as ApiResponse);
        return;
      }

      const libraryId = parseInt(req.params.id);
      const bookId = parseInt(req.params.bookId);

      if (!libraryId || !bookId) {
        res.status(400).json({
          success: false,
          message: 'Invalid library or book ID'
        } as ApiResponse);
        return;
      }

      // TODO: Remove book from library (check ownership)
      // await BookLibrary.destroy({
      //   where: {
      //     id_library: libraryId,
      //     id_book: bookId
      //   }
      // });

      res.json({
        success: true,
        message: 'Book removed from library successfully'
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error removing book from library',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }
}

export default new LibraryController();