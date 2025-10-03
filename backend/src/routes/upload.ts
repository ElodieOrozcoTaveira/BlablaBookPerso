import express from 'express';
import uploadController, { upload } from '../controllers/upload.controller';
// import authMiddleware from '../middleware/auth.middleware';

const router = express.Router();

// All upload routes require authentication
// router.use(authMiddleware);

// File upload routes
router.post('/cover', upload.single('cover'), uploadController.uploadBookCover);
router.post('/avatar', upload.single('avatar'), uploadController.uploadUserAvatar);

// File management routes
router.delete('/:type/:filename', uploadController.deleteFile);
router.get('/info/:type/:filename', uploadController.getFileInfo);

export default router;