import express from 'express';
import noticeController from '../controllers/notice.controller';
// import authMiddleware from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', noticeController.getNotices);
router.get('/:id', noticeController.getNoticeById);

// Protected routes (require authentication)
// router.use(authMiddleware);
router.post('/', noticeController.createNotice);
router.put('/:id', noticeController.updateNotice);
router.delete('/:id', noticeController.deleteNotice);

export default router;