import { Router } from 'express';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
    createReadingListSchema,
    updateReadingListSchema,
    readingListParamsSchema,
    readingListSearchSchema
} from '../validation/reading-list.zod';
import {
    addBookToReadingList,
    getReadingList,
    updateReadingStatus,
    removeBookFromReadingList,
    getMyReadingStats
} from '../controllers/reading-list.controller';
import { idParamSchema } from '../validation/common.zod';

const router = Router();

// Routes protegees (necessitent authentification - TODO: ajouter auth middleware)
// POST /api/reading-lists - Ajouter un livre a une liste de lecture
router.post('/', validateBody(createReadingListSchema), addBookToReadingList);

// GET /api/reading-lists/library/:library_id - Voir la liste de lecture d'une bibliotheque
router.get('/library/:library_id', 
    validateParams(idParamSchema), 
    validateQuery(readingListSearchSchema), 
    getReadingList
);

// PUT /api/reading-lists/:id - Modifier le statut de lecture
router.put('/:id', 
    validateParams(readingListParamsSchema), 
    validateBody(updateReadingListSchema), 
    updateReadingStatus
);

// DELETE /api/reading-lists/:id - Retirer un livre de la liste de lecture
router.delete('/:id', validateParams(readingListParamsSchema), removeBookFromReadingList);

// Routes du profil personnel
// GET /api/reading-lists/me/stats - Mes statistiques de lecture
router.get('/me/stats', getMyReadingStats);

export default router;