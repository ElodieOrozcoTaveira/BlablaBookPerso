import { Request, Response } from 'express';
import { AuthenticatedRequest, INotice, CreateNoticeDTO, ApiResponse, PaginatedResponse } from '../types';

/**
 * Notice Controller
 * Handles book reviews and notices
 * Routes: GET/POST /api/notices, GET/PUT/DELETE /api/notices/:id
 */
export class NoticeController {
  
  /**
   * Get notices with filters
   * GET /api/notices?book=...&user=...&page=...&limit=...
   */
  async getNotices(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const bookId = req.query.book ? parseInt(req.query.book as string) : undefined;
      const userId = req.query.user ? parseInt(req.query.user as string) : undefined;

      // TODO: Fetch notices with filters, include user and book info
      // const { notices, count } = await Notice.findAndCountAll({
      //   where: buildNoticeFilters({ bookId, userId }),
      //   include: [
      //     { 
      //       model: User, 
      //       attributes: ['id_user', 'username', 'firstname', 'lastname'] 
      //     },
      //     { 
      //       model: Book, 
      //       attributes: ['id_book', 'title', 'cover_url'],
      //       include: [
      //         { model: Author, through: BookAuthor },
      //         { model: Genre, through: BookGenre }
      //       ]
      //     }
      //   ],
      //   limit,
      //   offset: (page - 1) * limit,
      //   order: [['published_at', 'DESC']]
      // });

      // Mock response
      const mockNotices: (INotice & { user?: any; book?: any })[] = [
        {
          id_notice: 1,
          id_user: 1,
          id_book: 1,
          content: 'Un excellent livre sur JavaScript ! Les concepts sont bien expliqués et les exemples pratiques.',
          published_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
          user: {
            id_user: 1,
            username: 'john_doe',
            firstname: 'John',
            lastname: 'Doe'
          },
          book: {
            id_book: 1,
            title: 'Le Guide du Développeur JavaScript',
            cover_url: '/uploads/covers/book-1.jpg'
          }
        }
      ];

      const totalPages = Math.ceil(1 / limit);

      res.json({
        success: true,
        data: mockNotices,
        message: 'Notices retrieved successfully',
        pagination: {
          page,
          limit,
          total: 1,
          totalPages
        }
      } as PaginatedResponse<INotice>);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving notices',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Get notice by ID
   * GET /api/notices/:id
   */
  async getNoticeById(req: Request, res: Response): Promise<void> {
    try {
      const noticeId = parseInt(req.params.id);
      
      if (!noticeId) {
        res.status(400).json({
          success: false,
          message: 'Invalid notice ID'
        } as ApiResponse);
        return;
      }

      // TODO: Fetch notice with user and book info
      // const notice = await Notice.findByPk(noticeId, {
      //   include: [
      //     { model: User, attributes: ['id_user', 'username', 'firstname', 'lastname'] },
      //     { model: Book, attributes: ['id_book', 'title', 'cover_url'] }
      //   ]
      // });

      // Mock response
      const mockNotice = {
        id_notice: noticeId,
        id_user: 1,
        id_book: 1,
        content: 'Un excellent livre sur JavaScript ! Les concepts sont bien expliqués et les exemples pratiques.',
        published_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        user: {
          id_user: 1,
          username: 'john_doe',
          firstname: 'John',
          lastname: 'Doe'
        },
        book: {
          id_book: 1,
          title: 'Le Guide du Développeur JavaScript',
          cover_url: '/uploads/covers/book-1.jpg'
        }
      };

      res.json({
        success: true,
        data: mockNotice,
        message: 'Notice retrieved successfully'
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving notice',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Create new notice
   * POST /api/notices
   */
  async createNotice(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - User not authenticated'
        } as ApiResponse);
        return;
      }

      const noticeData: CreateNoticeDTO = req.body;

      // Validate required fields
      if (!noticeData.id_book || !noticeData.content) {
        res.status(400).json({
          success: false,
          message: 'Book ID and content are required'
        } as ApiResponse);
        return;
      }

      if (noticeData.content.trim().length < 10) {
        res.status(400).json({
          success: false,
          message: 'Notice content must be at least 10 characters long'
        } as ApiResponse);
        return;
      }

      // TODO: Create notice in database
      // const newNotice = await Notice.create({
      //   ...noticeData,
      //   id_user: req.user.id_user,
      //   published_at: new Date()
      // });

      // Mock response
      const newNotice: INotice = {
        id_notice: 999,
        id_user: req.user.id_user!,
        id_book: noticeData.id_book,
        id_reading_list: noticeData.id_reading_list,
        content: noticeData.content,
        published_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      };

      res.status(201).json({
        success: true,
        data: newNotice,
        message: 'Notice created successfully'
      } as ApiResponse<INotice>);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating notice',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Update notice
   * PUT /api/notices/:id
   */
  async updateNotice(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - User not authenticated'
        } as ApiResponse);
        return;
      }

      const noticeId = parseInt(req.params.id);
      const { content } = req.body;

      if (!noticeId) {
        res.status(400).json({
          success: false,
          message: 'Invalid notice ID'
        } as ApiResponse);
        return;
      }

      if (!content || content.trim().length < 10) {
        res.status(400).json({
          success: false,
          message: 'Notice content must be at least 10 characters long'
        } as ApiResponse);
        return;
      }

      // TODO: Check ownership and update
      // const [affectedRows] = await Notice.update(
      //   { content, updated_at: new Date() },
      //   { 
      //     where: { 
      //       id_notice: noticeId,
      //       id_user: req.user.id_user 
      //     }
      //   }
      // );

      res.json({
        success: true,
        message: 'Notice updated successfully'
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating notice',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Delete notice
   * DELETE /api/notices/:id
   */
  async deleteNotice(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized - User not authenticated'
        } as ApiResponse);
        return;
      }

      const noticeId = parseInt(req.params.id);

      if (!noticeId) {
        res.status(400).json({
          success: false,
          message: 'Invalid notice ID'
        } as ApiResponse);
        return;
      }

      // TODO: Check ownership and delete
      // await Notice.destroy({
      //   where: { 
      //     id_notice: noticeId,
      //     id_user: req.user.id_user 
      //   }
      // });

      res.json({
        success: true,
        message: 'Notice deleted successfully'
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting notice',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Get notices for a specific book
   * GET /api/books/:bookId/notices
   */
  async getNoticesForBook(req: Request, res: Response): Promise<void> {
    try {
      const bookId = parseInt(req.params.bookId);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;

      if (!bookId) {
        res.status(400).json({
          success: false,
          message: 'Invalid book ID'
        } as ApiResponse);
        return;
      }

      // TODO: Fetch notices for specific book
      // const { notices, count } = await Notice.findAndCountAll({
      //   where: { id_book: bookId },
      //   include: [
      //     { model: User, attributes: ['id_user', 'username', 'firstname', 'lastname'] }
      //   ],
      //   limit,
      //   offset: (page - 1) * limit,
      //   order: [['published_at', 'DESC']]
      // });

      // Mock response
      const mockNotices = [
        {
          id_notice: 1,
          id_user: 1,
          id_book: bookId,
          content: 'Un excellent livre ! Très recommandé.',
          published_at: new Date(),
          user: {
            id_user: 1,
            username: 'john_doe',
            firstname: 'John',
            lastname: 'Doe'
          }
        }
      ];

      const totalPages = Math.ceil(1 / limit);

      res.json({
        success: true,
        data: mockNotices,
        message: 'Book notices retrieved successfully',
        pagination: {
          page,
          limit,
          total: 1,
          totalPages
        }
      } as PaginatedResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving book notices',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }
}

export default new NoticeController();