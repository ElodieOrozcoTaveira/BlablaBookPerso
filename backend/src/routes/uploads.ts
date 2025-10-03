import { Router } from 'express';
import { z } from 'zod';
import { validateParams, validateQuery } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import {
    uploadBookCover,
    deleteBookCover,
    uploadUserAvatar,
    deleteUserAvatar,
    getUploadedImages,
    getBookCover
} from '../controllers/upload.controller.js';
import { idParamSchema } from '../validation/common.zod.js';

const router = Router();

// Routes publiques (covers accessibles a tous)
// GET /api/uploads/covers - Liste des covers disponibles
router.get('/covers', (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Liste des covers - Fonctionnalite a implementer'
    });
});

// Schema de validation pour book_id + size
const bookCoverParamsSchema = z.object({
    book_id: z.coerce.number().int().positive(),
    size: z.enum(['thumb', 'small', 'medium'])
});

// GET /api/uploads/covers/:book_id/:size - Cover d'un livre en taille specifique
router.get('/covers/:book_id/:size', 
    validateParams(bookCoverParamsSchema),
    getBookCover
);

// Routes protegees (authentification requise)
// POST /api/uploads/book/:book_id/cover - Upload de couverture de livre
router.post('/book/:book_id/cover', 
    authenticateToken,
    validateParams(idParamSchema), 
    uploadBookCover
);

// DELETE /api/uploads/book/:book_id/cover - Supprimer couverture de livre
router.delete('/book/:book_id/cover', 
    authenticateToken,
    validateParams(idParamSchema), 
    deleteBookCover
);

// POST /api/uploads/user/avatar - Upload d'avatar utilisateur
router.post('/user/avatar', 
    authenticateToken,
    uploadUserAvatar
);

// DELETE /api/uploads/user/avatar - Supprimer avatar utilisateur
router.delete('/user/avatar', 
    authenticateToken,
    deleteUserAvatar
);

// GET /api/uploads/me - Mes images uploadees
router.get('/me', 
    authenticateToken,
    getUploadedImages
);

// PATCH /api/uploads/user/avatar - Mise a jour partielle avatar
router.patch('/user/avatar', 
    authenticateToken,
    (req, res) => {
        res.status(501).json({
            success: false,
            message: 'Mise a jour partielle avatar - Fonctionnalite a implementer'
        });
    }
);

// PATCH /api/uploads/book/:book_id/cover - Mise a jour partielle cover
router.patch('/book/:book_id/cover', 
    authenticateToken,
    validateParams(idParamSchema),
    (req, res) => {
        res.status(501).json({
            success: false,
            message: 'Mise a jour partielle cover - Fonctionnalite a implementer'
        });
    }
);

export default router;