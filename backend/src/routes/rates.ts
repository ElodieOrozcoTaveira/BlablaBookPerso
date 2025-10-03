import { Router } from 'express';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
    createRateSchema,
    updateRateSchema,
    rateParamsSchema,
    rateSearchSchema
} from '../validation/rate.zod';
import {
    createRate,
    getAllRates,
    getRateById,
    updateRate,
    deleteRate,
    getMyRates,
    getRatesByBook,
    getMyRateForBook
} from '../controllers/rate.controller';
import { idParamSchema } from '../validation/common.zod';

const router = Router();

// Routes publiques
// GET /api/rates - Lister toutes les notes (filtrables)
router.get('/', validateQuery(rateSearchSchema), getAllRates);

// GET /api/rates/:id - Voir une note specifique
router.get('/:id', validateParams(rateParamsSchema), getRateById);

// Routes protegees (necessitent authentification - TODO: ajouter auth middleware)
// POST /api/rates - Creer une nouvelle note
router.post('/', validateBody(createRateSchema), createRate);

// PUT /api/rates/:id - Modifier une note (seulement proprietaire)
router.put('/:id', 
    validateParams(rateParamsSchema), 
    validateBody(updateRateSchema), 
    updateRate
);

// DELETE /api/rates/:id - Supprimer une note (seulement proprietaire)
router.delete('/:id', validateParams(rateParamsSchema), deleteRate);

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