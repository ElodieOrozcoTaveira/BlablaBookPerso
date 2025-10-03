import { Request, Response } from 'express';
import { AuthenticatedRequest, IGenre, ApiResponse, PaginatedResponse } from '../types';

/**
 * Genre Controller
 * Handles genre management (Admin functionality)
 * Routes: GET/POST /api/genres, GET/PUT/DELETE /api/genres/:id
 */
export class GenreController {
  
  /**
   * Get all genres
   * GET /api/genres
   */
  async getGenres(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const search = req.query.search as string;

      // TODO: Implement genre listing with Sequelize
      // const whereCondition = search ? {
      //   name: { [Op.iLike]: `%${search}%` }
      // } : {};

      // const { genres, count } = await Genre.findAndCountAll({
      //   where: whereCondition,
      //   order: [['name', 'ASC']],
      //   limit,
      //   offset: (page - 1) * limit,
      //   include: [{
      //     model: Book,
      //     through: BookGenre,
      //     attributes: ['id_book', 'title']
      //   }]
      // });

      // Mock response
      const mockGenres: IGenre[] = [
        {
          id_genre: 1,
          name: 'Science-Fiction',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id_genre: 2,
          name: 'Fantasy',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id_genre: 3,
          name: 'Thriller',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id_genre: 4,
          name: 'Romance',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id_genre: 5,
          name: 'Développement personnel',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id_genre: 6,
          name: 'Technique/Informatique',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      const filteredGenres = search 
        ? mockGenres.filter(genre => 
            genre.name.toLowerCase().includes(search.toLowerCase())
          )
        : mockGenres;

      const totalPages = Math.ceil(filteredGenres.length / limit);

      res.json({
        success: true,
        data: filteredGenres,
        message: 'Genres retrieved successfully',
        pagination: {
          page,
          limit,
          total: filteredGenres.length,
          totalPages
        }
      } as PaginatedResponse<IGenre>);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving genres',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Get genre by ID
   * GET /api/genres/:id
   */
  async getGenreById(req: Request, res: Response): Promise<void> {
    try {
      const genreId = parseInt(req.params.id);
      
      if (!genreId) {
        res.status(400).json({
          success: false,
          message: 'Invalid genre ID'
        } as ApiResponse);
        return;
      }

      // TODO: Fetch genre with books
      // const genre = await Genre.findByPk(genreId, {
      //   include: [{
      //     model: Book,
      //     through: BookGenre,
      //     attributes: ['id_book', 'title', 'isbn', 'published_at', 'cover_url'],
      //     include: [{
      //       model: Author,
      //       through: BookAuthor,
      //       attributes: ['id_author', 'firstname', 'lastname']
      //     }]
      //   }]
      // });

      // Mock response
      const mockGenre = {
        id_genre: genreId,
        name: 'Science-Fiction',
        created_at: new Date(),
        updated_at: new Date(),
        books: [
          {
            id_book: 1,
            title: 'Dune',
            isbn: '978-2-266-32014-7',
            published_at: new Date('1965-08-01'),
            cover_url: '/uploads/covers/dune.jpg',
            authors: [
              {
                id_author: 1,
                firstname: 'Frank',
                lastname: 'Herbert'
              }
            ]
          }
        ]
      };

      res.json({
        success: true,
        data: mockGenre,
        message: 'Genre retrieved successfully'
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving genre',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Create new genre (Admin only)
   * POST /api/genres
   */
  async createGenre(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // TODO: Check admin permissions
      // if (!hasPermission(req.user, 'CREATE_GENRE')) {
      //   return res.status(403).json({
      //     success: false,
      //     message: 'Insufficient permissions - Admin access required'
      //   });
      // }

      const { name } = req.body;

      // Validate required fields
      if (!name || name.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Genre name is required'
        } as ApiResponse);
        return;
      }

      if (name.trim().length < 2) {
        res.status(400).json({
          success: false,
          message: 'Genre name must be at least 2 characters long'
        } as ApiResponse);
        return;
      }

      // TODO: Check if genre already exists
      // const existingGenre = await Genre.findOne({
      //   where: { 
      //     name: { [Op.iLike]: name.trim() }
      //   }
      // });

      // if (existingGenre) {
      //   return res.status(409).json({
      //     success: false,
      //     message: 'Genre already exists'
      //   });
      // }

      // TODO: Create genre in database
      // const newGenre = await Genre.create({
      //   name: name.trim()
      // });

      // Mock response
      const newGenre: IGenre = {
        id_genre: 999,
        name: name.trim(),
        created_at: new Date(),
        updated_at: new Date()
      };

      res.status(201).json({
        success: true,
        data: newGenre,
        message: 'Genre created successfully'
      } as ApiResponse<IGenre>);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating genre',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Update genre (Admin only)
   * PUT /api/genres/:id
   */
  async updateGenre(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // TODO: Check admin permissions
      // if (!hasPermission(req.user, 'UPDATE_GENRE')) {
      //   return res.status(403).json({
      //     success: false,
      //     message: 'Insufficient permissions - Admin access required'
      //   });
      // }

      const genreId = parseInt(req.params.id);
      const { name } = req.body;

      if (!genreId) {
        res.status(400).json({
          success: false,
          message: 'Invalid genre ID'
        } as ApiResponse);
        return;
      }

      if (!name || name.trim().length < 2) {
        res.status(400).json({
          success: false,
          message: 'Genre name must be at least 2 characters long'
        } as ApiResponse);
        return;
      }

      // TODO: Check if another genre with the same name exists
      // const existingGenre = await Genre.findOne({
      //   where: { 
      //     name: { [Op.iLike]: name.trim() },
      //     id_genre: { [Op.ne]: genreId }
      //   }
      // });

      // if (existingGenre) {
      //   return res.status(409).json({
      //     success: false,
      //     message: 'A genre with this name already exists'
      //   });
      // }

      // TODO: Update genre in database
      // const [affectedRows] = await Genre.update(
      //   { name: name.trim(), updated_at: new Date() },
      //   { where: { id_genre: genreId } }
      // );

      // if (affectedRows === 0) {
      //   return res.status(404).json({
      //     success: false,
      //     message: 'Genre not found'
      //   });
      // }

      res.json({
        success: true,
        message: 'Genre updated successfully'
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating genre',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Delete genre (Admin only)
   * DELETE /api/genres/:id
   */
  async deleteGenre(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // TODO: Check admin permissions
      // if (!hasPermission(req.user, 'DELETE_GENRE')) {
      //   return res.status(403).json({
      //     success: false,
      //     message: 'Insufficient permissions - Admin access required'
      //   });
      // }

      const genreId = parseInt(req.params.id);

      if (!genreId) {
        res.status(400).json({
          success: false,
          message: 'Invalid genre ID'
        } as ApiResponse);
        return;
      }

      // TODO: Check if genre has books before deleting
      // const bookCount = await BookGenre.count({
      //   where: { id_genre: genreId }
      // });

      // if (bookCount > 0) {
      //   return res.status(409).json({
      //     success: false,
      //     message: 'Cannot delete genre with associated books'
      //   });
      // }

      // TODO: Delete genre
      // const deletedRows = await Genre.destroy({
      //   where: { id_genre: genreId }
      // });

      // if (deletedRows === 0) {
      //   return res.status(404).json({
      //     success: false,
      //     message: 'Genre not found'
      //   });
      // }

      res.json({
        success: true,
        message: 'Genre deleted successfully'
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting genre',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  /**
   * Get popular genres (with book counts)
   * GET /api/genres/popular
   */
  async getPopularGenres(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      // TODO: Get genres with book counts
      // const genres = await Genre.findAll({
      //   attributes: [
      //     'id_genre',
      //     'name',
      //     [Sequelize.fn('COUNT', Sequelize.col('books.id_book')), 'book_count']
      //   ],
      //   include: [{
      //     model: Book,
      //     through: BookGenre,
      //     attributes: []
      //   }],
      //   group: ['Genre.id_genre', 'Genre.name'],
      //   order: [[Sequelize.literal('book_count'), 'DESC']],
      //   limit
      // });

      // Mock response
      const mockPopularGenres = [
        { id_genre: 6, name: 'Technique/Informatique', book_count: 15 },
        { id_genre: 1, name: 'Science-Fiction', book_count: 12 },
        { id_genre: 2, name: 'Fantasy', book_count: 10 },
        { id_genre: 3, name: 'Thriller', book_count: 8 },
        { id_genre: 4, name: 'Romance', book_count: 6 }
      ];

      res.json({
        success: true,
        data: mockPopularGenres,
        message: 'Popular genres retrieved successfully'
      } as ApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving popular genres',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }
}

export default new GenreController();