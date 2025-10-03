import { Router } from 'express';
import { validateBody, validateParams } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import {
    createReadingListCollectionSchema,
    updateReadingListCollectionSchema,
    readingListCollectionParamsSchema,
    addBookToCollectionSchema
} from '../validation/reading-list-collection.zod.js';
import {
    createReadingListCollection,
    getMyReadingListCollections,
    getReadingListCollection,
    updateReadingListCollection,
    deleteReadingListCollection,
    addBookToCollection
} from '../controllers/reading-list-collection.controller.js';

const router = Router();

// POST /api/reading-list-collections - Créer une nouvelle liste de lecture
router.post('/', 
    authenticateToken,
    validateBody(createReadingListCollectionSchema),
    createReadingListCollection
);

// GET /api/reading-list-collections/me - Mes listes de lecture
router.get('/me', 
    authenticateToken,
    getMyReadingListCollections
);

// GET /api/reading-list-collections/:id - Détails d'une liste de lecture
router.get('/:id',
    validateParams(readingListCollectionParamsSchema),
    getReadingListCollection
);

// PUT /api/reading-list-collections/:id - Mettre à jour une liste de lecture
router.put('/:id', 
    authenticateToken,
    validateParams(readingListCollectionParamsSchema),
    validateBody(updateReadingListCollectionSchema),
    updateReadingListCollection
);

// DELETE /api/reading-list-collections/:id - Supprimer une liste de lecture
router.delete('/:id', 
    authenticateToken,
    validateParams(readingListCollectionParamsSchema),
    deleteReadingListCollection
);

// POST /api/reading-list-collections/:id/add-book - Ajouter un livre à la collection
router.post('/:id/add-book',
    authenticateToken,
    validateParams(readingListCollectionParamsSchema),
    validateBody(addBookToCollectionSchema),
    addBookToCollection
);

export default router;