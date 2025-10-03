// Exemple de route automatisée pour les genres
import { createCRUDRoutes } from '../middleware/route-metadata.js';
import * as genreController from '../controllers/genre.controller.js';
import {
    createGenreSchema,
    updateGenreSchema,
    genreParamsSchema,
    genreSearchSchema
} from '../validation/genre.zod.js';

// Configuration automatique des routes CRUD pour les genres
const router = createCRUDRoutes({
    resource: 'genres',
    controller: genreController,
    validation: {
        create: createGenreSchema,
        update: updateGenreSchema,
        params: genreParamsSchema,
        search: genreSearchSchema
    },
    permissions: {
        read: true,        // Routes GET publiques
        create: 'CREATE_GENRE',
        update: 'UPDATE_GENRE', 
        delete: 'DELETE_GENRE'
    }
});

export default router;
