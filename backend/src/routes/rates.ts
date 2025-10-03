import { Router } from 'express';
import { validateBody, validateParams, validateQuery } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permission.js';
import { requireOwnership } from '../middleware/ownership.js';
import {
    createRateSchema,
    updateRateSchema,
    rateParamsSchema,
    rateSearchSchema
} from '../validation/rate.zod.js';
import {
    createRate,
    getAllRates,
    getRateById,
    updateRate,
    deleteRate,
    getMyRates,
    getRatesByBook,
    getMyRateForBook
} from '../controllers/rate.controller.js';
import { idParamSchema } from '../validation/common.zod.js';

const router = Router();

// Routes publiques
// GET /api/rates - Lister toutes les notes (filtrables)
router.get('/', validateQuery(rateSearchSchema), getAllRates);

// GET /api/rates/:id - Voir une note specifique
router.get('/:id', validateParams(rateParamsSchema), getRateById);

// Routes protegees (authentification requise)
// POST /api/rates - Creer une nouvelle note
router.post('/', 
    authenticateToken,
    validateBody(createRateSchema), 
    createRate
);

// PUT /api/rates/:id - Modifier une note (seulement proprietaire)
router.put('/:id', 
    authenticateToken,
    validateParams(rateParamsSchema), 
    validateBody(updateRateSchema),
    requirePermission('UPDATE_RATE'),
    requireOwnership({ model: (await import('../models/Rate.js')).default, idLocation: 'params', idKey: 'id', ownerField: 'id_user', attachAs: 'rate' }),
    updateRate
);

// DELETE /api/rates/:id - Supprimer une note (seulement proprietaire)
router.delete('/:id', 
    authenticateToken,
    validateParams(rateParamsSchema),
    requirePermission('DELETE_RATE'),
    requireOwnership({ model: (await import('../models/Rate.js')).default, idLocation: 'params', idKey: 'id', ownerField: 'id_user', attachAs: 'rate' }),
    deleteRate
);

// PATCH /api/rates/:id - Modification partielle d'une note
router.patch('/:id', 
    authenticateToken,
    validateParams(rateParamsSchema), 
    (req, res) => {
        res.status(501).json({
            success: false,
            message: 'Modification partielle note - Fonctionnalite à implementer'
        });
    }
);

// Routes du profil personnel
// GET /api/rates/me/all - Mes notes
router.get('/me/all', getMyRates);

// GET /api/rates/me/book/:book_id - Ma note pour un livre specifique
router.get('/me/book/:book_id', 
    validateParams(idParamSchema), 
    getMyRateForBook
);

// Routes specifiques aux livres
// GET /api/rates/book/:book_id - Notes d'un livre specifique (avec moyenne)
router.get('/book/:book_id', 
    validateParams(idParamSchema), 
    validateQuery(rateSearchSchema), 
    getRatesByBook
);

export default router;