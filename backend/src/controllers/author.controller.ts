import { Request, Response } from 'express';
import { AuthenticatedRequest, IAuthor, ApiResponse, PaginatedResponse, SearchQuery } from '../types';

/**
 * Author Controller
 * Handles author management (Admin functionality)
 * Routes: GET/POST /api/authors, GET/PUT/DELETE /api/authors/:id
 */
export class AuthorController {
  
  /**
   * Get all authors with search
   * GET /api/authors?search=...&page=...&limit=...
   */
  async getAuthors(req: Request, res: Response): Promise<void> {
    try {
      const query: SearchQuery = {
        search: req.query.search as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sortBy: req.query.sortBy as string || 'lastname',
        sortOrder: (req.query.sortOrder as 'ASC' | 'DESC') || 'ASC'
      };

      // TODO: Implement author search with Sequelize
      // const whereCondition = query.search ? {
      //   [Op.or]: [
      //     { firstname: { [Op.iLike]: `%${query.search}%` } },
      //     { lastname: { [Op.iLike]: `%${query.search}%` } }
      //   ]
      // } : {};

      // const { authors, count } = await Author.findAndCountAll({
      //   where: whereCondition,
      //   order: [[query.sortBy, query.sortOrder]],
      //   limit: query.limit,
      //   offset: (query.page - 1) * query.limit,
      //   include: [{
      //     model: Book,
      //     through: BookAuthor,
      //     attributes: ['id_book', 'title']
      //   }]
      // });

      // Mock response
      const mockAuthors: IAuthor[] = [
        {
          id_author: 1,
          firstname: 'Robert',
          lastname: 'Martin',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id_author: 2,
          firstname: 'Kyle',
          lastname: 'Simpson',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id_author: 3,
          lastname: 'Tolkien',
          firstname: 'J.R.R.',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      const filteredAuthors = query.search 
        ? mockAuthors.filter(author => 
            author.lastname.toLowerCase().includes(query.search!.toLowerCase()) ||
            (author.firstname && author.firstname.toLowerCase().includes(query.search!.toLowerCase()))
          )
        : mockAuthors;

      const totalPages = Math.ceil(filteredAuthors.length / query.limit!);

      res.json({
        success: true,
        data: filteredAuthors,
        message: 'Authors retrieved successfully',
        pagination: {
          page: query.page,
          limit: query.limit,
          total: filteredAuthors.length,
          totalPages
        }
      } as PaginatedResponse<IAuthor>);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving authors',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Get author by ID
   * GET /api/authors/:id
   */
  async getAuthorById(req: Request, res: Response): Promise<void> {
    try {
      const authorId = parseInt(req.params.id);
      
      if (!authorId) {
        res.status(400).json({
          success: false,
          message: 'Invalid author ID'
        } as ApiResponse);
        return;
      }

      // TODO: Fetch author with their books
      // const author = await Author.findByPk(authorId, {
      //   include: [{
      //     model: Book,
      //     through: BookAuthor,
      //     attributes: ['id_book', 'title', 'isbn', 'published_at', 'cover_url']
      //   }]
      // });

      // Mock response
      const mockAuthor = {
        id_author: authorId,
        firstname: 'Robert',
        lastname: 'Martin',
        created_at: new Date(),
        updated_at: new Date(),
        books: [
          {
            id_book: 1,
            title: 'Clean Code',
            isbn: '978-0-132350-88-4',
            published_at: new Date('2008-08-01'),
            cover_url: '/uploads/covers/clean-code.jpg'
          }
        ]
      };

      res.json({
        success: true,
        data: mockAuthor,
        message: 'Author retrieved successfully'
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving author',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Create new author (Admin only)
   * POST /api/authors
   */
  async createAuthor(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // TODO: Check admin permissions
      // if (!hasPermission(req.user, 'CREATE_AUTHOR')) {
      //   return res.status(403).json({
      //     success: false,
      //     message: 'Insufficient permissions - Admin access required'
      //   });
      // }

      const { firstname, lastname } = req.body;

      // Validate required fields
      if (!lastname) {
        res.status(400).json({
          success: false,
          message: 'Author lastname is required'
        } as ApiResponse);
        return;
      }

      // TODO: Check if author already exists
      // const existingAuthor = await Author.findOne({
      //   where: { firstname, lastname }
      // });

      // if (existingAuthor) {
      //   return res.status(409).json({
      //     success: false,
      //     message: 'Author already exists'
      //   });
      // }

      // TODO: Create author in database
      // const newAuthor = await Author.create({
      //   firstname,
      //   lastname
      // });

      // Mock response
      const newAuthor: IAuthor = {
        id_author: 999,
        firstname,
        lastname,
        created_at: new Date(),
        updated_at: new Date()
      };

      res.status(201).json({
        success: true,
        data: newAuthor,
        message: 'Author created successfully'
      } as ApiResponse<IAuthor>);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating author',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Update author (Admin only)
   * PUT /api/authors/:id
   */
  async updateAuthor(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // TODO: Check admin permissions
      // if (!hasPermission(req.user, 'UPDATE_AUTHOR')) {
      //   return res.status(403).json({
      //     success: false,
      //     message: 'Insufficient permissions - Admin access required'
      //   });
      // }

      const authorId = parseInt(req.params.id);
      const { firstname, lastname } = req.body;

      if (!authorId) {
        res.status(400).json({
          success: false,
          message: 'Invalid author ID'
        } as ApiResponse);
        return;
      }

      if (!lastname) {
        res.status(400).json({
          success: false,
          message: 'Author lastname is required'
        } as ApiResponse);
        return;
      }

      // TODO: Update author in database
      // const [affectedRows] = await Author.update(
      //   { firstname, lastname, updated_at: new Date() },
      //   { where: { id_author: authorId } }
      // );

      // if (affectedRows === 0) {
      //   return res.status(404).json({
      //     success: false,
      //     message: 'Author not found'
      //   });
      // }

      res.json({
        success: true,
        message: 'Author updated successfully'
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating author',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Delete author (Admin only)
   * DELETE /api/authors/:id
   */
  async deleteAuthor(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // TODO: Check admin permissions
      // if (!hasPermission(req.user, 'DELETE_AUTHOR')) {
      //   return res.status(403).json({
      //     success: false,
      //     message: 'Insufficient permissions - Admin access required'
      //   });
      // }

      const authorId = parseInt(req.params.id);

      if (!authorId) {
        res.status(400).json({
          success: false,
          message: 'Invalid author ID'
        } as ApiResponse);
        return;
      }

      // TODO: Check if author has books before deleting
      // const bookCount = await BookAuthor.count({
      //   where: { id_author: authorId }
      // });

      // if (bookCount > 0) {
      //   return res.status(409).json({
      //     success: false,
      //     message: 'Cannot delete author with associated books'
      //   });
      // }

      // TODO: Delete author
      // const deletedRows = await Author.destroy({
      //   where: { id_author: authorId }
      // });

      // if (deletedRows === 0) {
      //   return res.status(404).json({
      //     success: false,
      //     message: 'Author not found'
      //   });
      // }

      res.json({
        success: true,
        message: 'Author deleted successfully'
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting author',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }
}

export default new AuthorController();