import express from 'express';
import readingListController from '../controllers/reading-list.controller';
// import authMiddleware from '../middleware/auth.middleware';

const router = express.Router();

// All reading list routes require authentication
// router.use(authMiddleware);

// Reading list CRUD routes
router.get('/', readingListController.getUserReadingLists);
router.post('/', readingListController.createReadingList);
router.get('/:id', readingListController.getReadingListById);
router.put('/:id', readingListController.updateReadingList);
router.delete('/:id', readingListController.deleteReadingList);

// Book management in reading list
router.post('/:id/books', readingListController.addBookToReadingList);
router.delete('/:id/books/:bookId', readingListController.removeBookFromReadingList);

export default router;