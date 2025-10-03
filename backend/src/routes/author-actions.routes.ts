import express from 'express';
import { AuthorActionController } from '../controllers/author-action.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permission.js';

const router = express.Router();

/**
 * Routes pour les actions temporaires sur les auteurs
 * Suit le meme modele que book-actions.ts
 */

/**
 * POST /api/author-actions/prepare-action
 * Je prepare un auteur pour une action utilisateur
 * L'auteur est importe temporairement s'il n'existe pas
 */
router.post(
    '/prepare-action',
    authenticateToken,
    AuthorActionController.prepareAction
);

/**
 * POST /api/author-actions/commit-action
 * Je confirme l'import temporaire d'un auteur
 */
router.post(
    '/commit-action',
    authenticateToken,
    requirePermission('UPDATE_AUTHOR'),
    AuthorActionController.commitAction
);

/**
 * POST /api/author-actions/rollback-action
 * J'annule l'import temporaire d'un auteur (rollback)
 */
router.post(
    '/rollback-action',
    authenticateToken,
    requirePermission('UPDATE_AUTHOR'),
    AuthorActionController.rollbackAction
);

export default router;
