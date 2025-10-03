import { Router } from 'express';
import {
  validateBody,
  validateParams,
  validateQuery,
  validateAll
} from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  createBookSchema,
  updateBookSchema,
  bookParamsSchema,
  bookSearchSchema
} from '../validation/book.zod.js';
import {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook
} from '../controllers/book.controller.js';

const router = Router();

// Routes publiques (lecture)
// GET /api/books - Recherche et pagination de livres
router.get('/',
  validateQuery(bookSearchSchema),  // Valide ?query=tolkien&author=fantasy&page=1
  getAllBooks
);

// GET /api/books/:id - Details d'un livre avec auteurs et genres
router.get('/:id',
  validateParams(bookParamsSchema), // Valide l'ID en parametre
  getBookById
);

// Routes protegees (authentification requise)
// POST /api/books - Creer un nouveau livre avec relations
router.post('/',
  authenticateToken,
  validateBody(createBookSchema),   // Valide donnees + author_ids + genre_ids
  createBook
);

// PUT /api/books/:id - Mettre a jour un livre complet
router.put('/:id',
  authenticateToken,
  validateAll({                     // Valide params ET body
    params: bookParamsSchema,
    body: updateBookSchema
  }),
  updateBook
);

// PATCH /api/books/:id - Mise a jour partielle (meme traitement que PUT)
router.patch('/:id',
  authenticateToken,
  validateAll({
    params: bookParamsSchema,
    body: updateBookSchema
  }),
  updateBook
);

// DELETE /api/books/:id - Supprimer un livre et ses relations
router.delete('/:id',
  authenticateToken,
  validateParams(bookParamsSchema),
  deleteBook
);

export default router;