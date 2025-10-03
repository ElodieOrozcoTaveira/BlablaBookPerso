import express from 'express';
import { BookActionController } from '../controllers/book-action.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permission.js';

const router = express.Router();
const bookActionController = new BookActionController();

// Routes pour les actions utilisateur sur les livres (avec import temporaire)

// Etape 1: je prepare un livre pour une action (authentification requise)
router.post('/prepare-action', 
    authenticateToken,
    bookActionController.prepareBookAction
);

// Etape 2: je confirme l'action (note/review)
router.post('/commit-action',
    authenticateToken, 
    bookActionController.commitBookAction
);

// Etape 3: j'annule l'action (rollback)
router.post('/rollback-action',
    authenticateToken,
    bookActionController.rollbackBookAction
);

// Route admin: je nettoie les imports temporaires anciens
router.post('/cleanup-temporary',
    authenticateToken,
    requirePermission('ADMIN'),
    bookActionController.cleanupTemporaryImports
);

export default router;