import { Router } from 'express';
import { validateParams, validateQuery } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import {
    uploadBookCover,
    deleteBookCover,
    uploadUserAvatar,
    deleteUserAvatar,
    getUploadedImages
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

// GET /api/uploads/covers/:book_id - Cover d'un livre specifique
router.get('/covers/:book_id', 
    validateParams(idParamSchema),
    (req, res) => {
        res.status(501).json({
            success: false,
            message: 'Cover du livre - Fonctionnalite a implementer'
        });
    }
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