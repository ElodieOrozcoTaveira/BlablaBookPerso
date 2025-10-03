import express from 'express';
import libraryController from '../controllers/library.controller';
// import authMiddleware from '../middleware/auth.middleware';

const router = express.Router();

// All library routes require authentication
// router.use(authMiddleware);

// Library CRUD routes
router.get('/', libraryController.getUserLibraries);
router.post('/', libraryController.createLibrary);
router.get('/:id', libraryController.getLibraryById);
router.put('/:id', libraryController.updateLibrary);
router.delete('/:id', libraryController.deleteLibrary);

// Book management in library
router.post('/:id/books/:bookId', libraryController.addBookToLibrary);
router.delete('/:id/books/:bookId', libraryController.removeBookFromLibrary);

export default router;