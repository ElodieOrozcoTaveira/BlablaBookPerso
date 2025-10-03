import { Router } from 'express';
import { z } from 'zod';
import { validateBody, validateParams, validateQuery } from '../middleware/validation.js';

import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permission.js';
import { requireOwnership } from '../middleware/ownership.js';
import Library from '../models/Library.js';
import {
  createReadingListSchema,
  updateReadingListSchema,
  readingListParamsSchema,
  readingListSearchSchema,
} from '../validation/reading-list.zod.js';
import {
    addBookToReadingList,
    getReadingList,
    updateReadingStatus,
    removeBookFromReadingList,
    getMyReadingStats,
    getMyNamedLists,
    createNamedList,
    addBookToNamedList,
    removeNamedList,
    getAllReadingLists,
    getReadingListById

} from '../controllers/reading-list.controller.js';
import { idParamSchema } from '../validation/common.zod.js';

const router = Router();


// Lecture globale
router.get('/all', getAllReadingLists);
router.get('/:id', getReadingListById);

// Lecture par bibliothèque
router.get('/library/:library_id', 
    validateParams(z.object({ library_id: z.string().regex(/^\d+$/).transform(Number) })), 
    validateQuery(readingListSearchSchema), 
    getReadingList
);

// Ajout d'un livre à une liste de lecture
router.post('/', 
    authenticateToken,
    validateBody(createReadingListSchema),
    addBookToReadingList
);

// Modification du statut de lecture
router.put('/:id', 
    authenticateToken,
    validateParams(readingListParamsSchema), 
    validateBody(updateReadingListSchema),
    requirePermission('UPDATE_READING_LIST'),
    requireOwnership({
        model: (await import('../models/ReadingList.js')).default,
        idLocation: 'params',
        idKey: 'id',
        attachAs: 'readingListEntry',
        allowAdminBypass: true,
        isAdmin: (req:any)=> req.user?.roles?.includes('admin'),
        missingIdStatus:400,
        ownerResolver: async (entry: any): Promise<number | undefined> => {
            const lib = await Library.findByPk(entry.id_library);
            return lib ? (lib.dataValues?.id_user || lib.get('id_user')) as number | undefined : undefined;
        }
    }),
    updateReadingStatus
);

// Suppression d'un livre d'une liste de lecture
router.delete('/:id', 
    authenticateToken,
    validateParams(readingListParamsSchema),
    requirePermission('DELETE_READING_LIST'),
    requireOwnership({
        model: (await import('../models/ReadingList.js')).default,
        idLocation: 'params',
        idKey: 'id',
        attachAs: 'readingListEntry',
        ownerResolver: async (entry: any): Promise<number | undefined> => {
            const lib = await Library.findByPk(entry.id_library);
            return lib ? (lib.dataValues?.id_user || lib.get('id_user')) as number | undefined : undefined;
        }
    }),
    removeBookFromReadingList
);

// Statistiques personnelles
router.get('/me/stats', authenticateToken, getMyReadingStats);

// Listes nommées
router.get('/me/lists', authenticateToken, getMyNamedLists);
router.post('/create-list', authenticateToken, createNamedList);
router.post('/add-to-list', authenticateToken, addBookToNamedList);
router.delete('/remove-list/:id', authenticateToken, removeNamedList);


export default router;
