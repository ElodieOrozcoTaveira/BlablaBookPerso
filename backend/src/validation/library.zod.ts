import { z } from 'zod';
import { idParamSchema, paginationSchema, searchQuerySchema, booleanQuerySchema } from './common.zod.js';

//Schema de creation (Post /libraries)
export const createLibrarySchema = z.object({
    name: z.string()
        .min(1, 'Le nom est requis')
        .max(100, 'Le nom ne peut pas depasser 100 caracteres')
        .trim(),

    description: z.string()
        .max(2000, 'La description ne peut pas depasser 2000 caracteres')
        .trim()
        .optional(),

    is_public: z.boolean()
        .default(false), //Privee par defaut

//id_user sera ajoute automatiquement par le middleware d'authentification
});

//Schema de mise a jour (PUT/PATCH /libraries/:id)
export const updateLibrarySchema = createLibrarySchema.partial();

//Schema des parametres de la route /libraries/:id - Reutilise common
export const libraryParamsSchema = idParamSchema;

//Schema de recherche (?q=ma+bibliotheque&page=1&user_id=123) - Reutilise common
export const librarySearchSchema = z.object({
    name: z.string().min(1).optional(),
    is_public: booleanQuerySchema.optional(),//? is public=true devient boolean
    user_id: z.coerce.number().int().positive().optional() // Filtrer par utilisateur
}).merge(searchQuerySchema).merge(paginationSchema);

//Types TypeScript
export type CreateLibraryInput = z.infer<typeof createLibrarySchema>;
export type UpdateLibraryInput = z.infer<typeof updateLibrarySchema>;
export type LibraryParams = z.infer<typeof libraryParamsSchema>;
export type LibrarySearchQuery = z.infer<typeof librarySearchSchema>;