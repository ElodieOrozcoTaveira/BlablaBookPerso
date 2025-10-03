// Exemple de route ultra-simplifiée avec autorisation automatique
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { autoAuthorize, fullAutoAuthorize } from '../middleware/auto-auth.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validation.js';
import * as genreController from '../controllers/genre.controller.js';
import {
    createGenreSchema,
    updateGenreSchema,
    genreParamsSchema,
    genreSearchSchema
} from '../validation/genre.zod.js';

const router = Router();

// ========================================
// APPROCHE 1: Autorisation automatique complète
// ========================================

// Appliquer l'autorisation automatique à toutes les routes
router.use(fullAutoAuthorize());

// Routes ultra-simplifiées - les permissions sont automatiques !
router.get('/', validateQuery(genreSearchSchema), genreController.getAllGenres);
router.get('/:id', validateParams(genreParamsSchema), genreController.getGenreById);
router.post('/', validateBody(createGenreSchema), genreController.createGenre);
router.put('/:id', validateParams(genreParamsSchema), validateBody(updateGenreSchema), genreController.updateGenre);
router.delete('/:id', validateParams(genreParamsSchema), genreController.deleteGenre);

// ========================================
// APPROCHE 2: Autorisation manuelle sélective
// ========================================

/*
// Routes publiques
router.get('/', validateQuery(genreSearchSchema), genreController.getAllGenres);
router.get('/:id', validateParams(genreParamsSchema), genreController.getGenreById);

// Routes avec autorisation automatique
router.post('/', authenticateToken, autoAuthorize(), validateBody(createGenreSchema), genreController.createGenre);
router.put('/:id', authenticateToken, autoAuthorize(), validateParams(genreParamsSchema), validateBody(updateGenreSchema), genreController.updateGenre);
router.delete('/:id', authenticateToken, autoAuthorize(), validateParams(genreParamsSchema), genreController.deleteGenre);
*/

export default router;
