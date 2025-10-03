import { Router } from 'express';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
    createLibrarySchema,
    updateLibrarySchema,
    libraryParamsSchema,
    librarySearchSchema
} from '../validation/library.zod';
import {
    createLibrary,
    getAllLibraries,
    getLibraryById,
    updateLibrary,
    deleteLibrary,
    getMyLibraries
} from '../controllers/library.controller';

const router = Router();

// Routes publiques
// GET /api/libraries - Lister toutes les bibliotheques (filtrables par is_public)
router.get('/', validateQuery(librarySearchSchema), getAllLibraries);

// GET /api/libraries/:id - Voir une bibliotheque specifique
router.get('/:id', validateParams(libraryParamsSchema), getLibraryById);

// Routes protegees (necessitent authentification - TODO: ajouter auth middleware)
// POST /api/libraries - Creer une nouvelle bibliotheque
router.post('/', validateBody(createLibrarySchema), createLibrary);

// PUT /api/libraries/:id - Modifier une bibliotheque (seulement proprietaire)
router.put('/:id', 
    validateParams(libraryParamsSchema), 
    validateBody(updateLibrarySchema), 
    updateLibrary
);

// DELETE /api/libraries/:id - Supprimer une bibliotheque (seulement proprietaire)
router.delete('/:id', validateParams(libraryParamsSchema), deleteLibrary);

// Routes du profil personnel
// GET /api/libraries/me/all - Mes bibliotheques
router.get('/me/all', getMyLibraries);

export default router;