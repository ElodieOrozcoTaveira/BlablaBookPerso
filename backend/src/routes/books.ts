import express from 'express';
import bookController from '../controllers/book.controller';
// import authMiddleware from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', bookController.searchBooks);
router.get('/:id', bookController.getBookById);

// Protected routes (require authentication)
// router.use(authMiddleware);
router.post('/', bookController.createBook);
router.put('/:id', bookController.updateBook);
router.delete('/:id', bookController.deleteBook);

export default router;