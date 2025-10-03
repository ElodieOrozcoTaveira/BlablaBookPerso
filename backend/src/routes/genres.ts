import express from 'express';
import genreController from '../controllers/genre.controller';
// import authMiddleware from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', genreController.getGenres);
router.get('/popular', genreController.getPopularGenres);
router.get('/:id', genreController.getGenreById);

// Protected routes (require authentication and admin permissions)
// router.use(authMiddleware);
router.post('/', genreController.createGenre);
router.put('/:id', genreController.updateGenre);
router.delete('/:id', genreController.deleteGenre);

export default router;