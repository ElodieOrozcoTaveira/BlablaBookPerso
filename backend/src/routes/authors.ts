import express from 'express';
import authorController from '../controllers/author.controller';
// import authMiddleware from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', authorController.getAuthors);
router.get('/:id', authorController.getAuthorById);

// Protected routes (require authentication and admin permissions)
// router.use(authMiddleware);
router.post('/', authorController.createAuthor);
router.put('/:id', authorController.updateAuthor);
router.delete('/:id', authorController.deleteAuthor);

export default router;