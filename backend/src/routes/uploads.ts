import { Router } from 'express';
import { validateParams } from '../middleware/validation';
import {
    uploadBookCover,
    deleteBookCover,
    uploadUserAvatar,
    deleteUserAvatar,
    getUploadedImages
} from '../controllers/upload.controller';
import { idParamSchema } from '../validation/common.zod';

const router = Router();

// Routes protegees (necessitent authentification - TODO: ajouter auth middleware)
// POST /api/uploads/book/:book_id/cover - Upload de couverture de livre
router.post('/book/:book_id/cover', 
    validateParams(idParamSchema), 
    uploadBookCover
);

// DELETE /api/uploads/book/:book_id/cover - Supprimer couverture de livre
router.delete('/book/:book_id/cover', 
    validateParams(idParamSchema), 
    deleteBookCover
);

// POST /api/uploads/user/avatar - Upload d'avatar utilisateur
router.post('/user/avatar', uploadUserAvatar);

// DELETE /api/uploads/user/avatar - Supprimer avatar utilisateur
router.delete('/user/avatar', deleteUserAvatar);

// GET /api/uploads/me - Mes images uploadees
router.get('/me', getUploadedImages);

export default router;