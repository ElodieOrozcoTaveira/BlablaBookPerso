import { Router } from 'express';
import authRoutes from './auth.js';
import authorRoutes from './authors.js';
import bookRoutes from './books.js';
import genreRoutes from './genres.js';
import libraryRoutes from './libraries.js';
import noticeRoutes from './notices.js';
import openLibraryRoutes from './openlibrary.js';
import rateRoutes from './rates.js';
import readingListRoutes from './reading-lists.js';
import uploadRoutes from './uploads.js';
import userRoutes from './users.js';

const router = Router();

// Routes API principales
// Toutes les routes sont prefixees par /api dans server.ts
router.use('/authors', authorRoutes);
router.use('/genres', genreRoutes);
router.use('/books', bookRoutes);
router.use('/users', userRoutes);
router.use('/libraries', libraryRoutes);
router.use('/notices', noticeRoutes);
router.use('/rates', rateRoutes);
router.use('/reading-lists', readingListRoutes);
router.use('/uploads', uploadRoutes);
router.use('/auth', authRoutes);

// Routes Open Library API
router.use('/external-books', openLibraryRoutes);

// Route de test pour verifier que l'API fonctionne
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API BlaBlaBook operationnelle',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;