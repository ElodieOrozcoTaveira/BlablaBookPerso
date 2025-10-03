import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  searchBooks,
  searchBooksAdvanced,
  getBookDetails,
  getAuthorDetails,
  importBook,
  importAuthor,
  getTrendingBooks,
  getBooksBySubject
} from '../controllers/openlibrary.controller.js';

const router = Router();

// ===============================
// ROUTES DE RECHERCHE (publiques)
// ===============================

// GET /api/openlibrary/search/books - Recherche simple ou par genre
router.get('/search/books', searchBooks);

// GET /api/openlibrary/search/books/advanced - Recherche avancee multi-criteres
router.get('/search/books/advanced', searchBooksAdvanced);

// GET /api/openlibrary/trending - Livres trending OpenLibrary
router.get('/trending', getTrendingBooks);

// GET /api/openlibrary/subjects/:subject - Livres par sujet
router.get('/subjects/:subject', getBooksBySubject);

// ===============================
// ROUTES DE DETAILS (publiques)
// ===============================

// GET /api/openlibrary/books/:workKey - Details d'un livre
router.get('/books/:workKey', getBookDetails);

// GET /api/openlibrary/authors/:authorKey - Details d'un auteur
router.get('/authors/:authorKey', getAuthorDetails);

// ===============================
// ROUTES D'IMPORT (authentifiees)
// ===============================

// POST /api/openlibrary/import/book - Importer un livre
router.post('/import/book', authenticateToken, importBook);

// POST /api/openlibrary/import/author - Importer un auteur
router.post('/import/author', authenticateToken, importAuthor);

export default router;