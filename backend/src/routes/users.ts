import express from 'express';
import userController from '../controllers/user.controller';
// import authMiddleware from '../middleware/auth.middleware';

const router = express.Router();

// All user routes require authentication
// router.use(authMiddleware);

// User profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.delete('/account', userController.deleteAccount);

export default router;