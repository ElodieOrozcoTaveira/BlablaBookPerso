import express from 'express';
import rateController from '../controllers/rate.controller';
// import authMiddleware from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', rateController.getRates);
router.get('/:id', rateController.getRateById);

// Protected routes (require authentication)
// router.use(authMiddleware);
router.post('/', rateController.createRate);
router.put('/:id', rateController.updateRate);
router.delete('/:id', rateController.deleteRate);

export default router;