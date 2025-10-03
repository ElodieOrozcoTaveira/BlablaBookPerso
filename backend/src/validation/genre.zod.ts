import { z } from 'zod';
import { idParamSchema, paginationSchema, searchQuerySchema } from './common.zod.js';

  // Schema de création (POST /genres)
export const createGenreSchema = z.object({
    name: z.string()
    .min(1, 'Le nom est requis')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .trim(),

    description: z.string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .trim()
    .optional()
    });

// Schema de mise à jour (PUT/PATCH /genres/:id)
export const updateGenreSchema = createGenreSchema.partial();

// Schema des paramètres de route (/genres/:id) - Réutilise common
export const genreParamsSchema = idParamSchema;

// Schema de recherche (?q=fantasy&page=1) - Réutilise common
export const genreSearchSchema = z.object({
    name: z.string().min(1).optional()
}).merge(searchQuerySchema).merge(paginationSchema);

// Types TypeScript
export type CreateGenreInput = z.infer<typeof createGenreSchema>;
export type UpdateGenreInput = z.infer<typeof updateGenreSchema>;
export type GenreParams = z.infer<typeof genreParamsSchema>;
export type GenreSearchQuery = z.infer<typeof genreSearchSchema>;