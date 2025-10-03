import { Router } from 'express';
import { validateBody, validateParams, validateQuery } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permission.js';
import { requireOwnership } from '../middleware/ownership.js';
import { auditOwnership } from '../middleware/ownership-audit.js';
import {
    createLibrarySchema,
    updateLibrarySchema,
    libraryParamsSchema,
    librarySearchSchema
} from '../validation/library.zod.js';
import {
    createLibrary,
    getAllLibraries,
    getLibraryById,
    updateLibrary,
    deleteLibrary,
    getMyLibraries
} from '../controllers/library.controller.js';

const router = Router();

// Routes publiques
// GET /api/libraries - Lister toutes les bibliotheques (filtrables par is_public)
router.get('/', validateQuery(librarySearchSchema), getAllLibraries);

// GET /api/libraries/:id - Voir une bibliotheque specifique
router.get('/:id', validateParams(libraryParamsSchema), getLibraryById);

// Routes protegees (authentification requise)
// POST /api/libraries - Creer une nouvelle bibliotheque
router.post('/', 
    authenticateToken, 
    validateBody(createLibrarySchema), 
    createLibrary
);

// PUT /api/libraries/:id - Modifier une bibliotheque (seulement proprietaire)
router.put('/:id', 
    authenticateToken,
    validateParams(libraryParamsSchema), 
    validateBody(updateLibrarySchema),
    requirePermission('UPDATE_LIBRARY'),
    requireOwnership({ model: (await import('../models/Library.js')).default, idLocation: 'params', idKey: 'id', ownerField: 'id_user', attachAs: 'library', audit: auditOwnership }),
    updateLibrary
);

// DELETE /api/libraries/:id - Supprimer une bibliotheque (seulement proprietaire)
router.delete('/:id', 
    authenticateToken,
    validateParams(libraryParamsSchema),
    requirePermission('DELETE_LIBRARY'),
    requireOwnership({ model: (await import('../models/Library.js')).default, idLocation: 'params', idKey: 'id', ownerField: 'id_user', attachAs: 'library', audit: auditOwnership }),
    deleteLibrary
);

// Routes du profil personnel
// PATCH /api/libraries/:id - Modification partielle d'une bibliotheque
router.patch('/:id', 
    authenticateToken,
    validateParams(libraryParamsSchema), 
    (req, res) => {
        res.status(501).json({
            success: false,
            message: 'Modification partielle bibliotheque - Fonctionnalite a implementer'
        });
    }
);

// GET /api/libraries/me/all - Mes bibliotheques
router.get('/me/all', authenticateToken, getMyLibraries);

export default router;