import { Router } from 'express';
import { validateBody, validateParams, validateQuery } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import {
    createReadingListSchema,
    updateReadingListSchema,
    readingListParamsSchema,
    readingListSearchSchema
} from '../validation/reading-list.zod.js';
import {
    addBookToReadingList,
    getReadingList,
    updateReadingStatus,
    removeBookFromReadingList,
    getMyReadingStats
} from '../controllers/reading-list.controller.js';
import { idParamSchema } from '../validation/common.zod.js';

const router = Router();

// Routes protegees (authentification requise)
// POST /api/reading-lists - Ajouter un livre a une liste de lecture
router.post('/', 
    authenticateToken,
    validateBody(createReadingListSchema), 
    addBookToReadingList
);

// GET /api/reading-lists/library/:library_id - Voir la liste de lecture d'une bibliotheque
router.get('/library/:library_id', 
    validateParams(idParamSchema), 
    validateQuery(readingListSearchSchema), 
    getReadingList
);

// PUT /api/reading-lists/:id - Modifier le statut de lecture
router.put('/:id', 
    authenticateToken,
    validateParams(readingListParamsSchema), 
    validateBody(updateReadingListSchema), 
    updateReadingStatus
);

// DELETE /api/reading-lists/:id - Retirer un livre de la liste de lecture
router.delete('/:id', 
    authenticateToken,
    validateParams(readingListParamsSchema), 
    removeBookFromReadingList
);

// PATCH /api/reading-lists/:id - Modification partielle du statut de lecture
router.patch('/:id', 
    authenticateToken,
    validateParams(readingListParamsSchema), 
    (req, res) => {
        res.status(501).json({
            success: false,
            message: 'Modification partielle statut de lecture - Fonctionnalite a implementer'
        });
    }
);

// Routes du profil personnel
// GET /api/reading-lists/me/stats - Mes statistiques de lecture
router.get('/me/stats', 
    authenticateToken,
    getMyReadingStats
);

export default router;