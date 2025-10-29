import { z } from "zod";
/**
 * VALIDATIONS ZOD POUR LES GENRES
 */
// Création d'un genre
export const createGenreSchema = z.object({
    name: z
        .string()
        .min(2, "Minimum 2 caractères")
        .max(100, "Maximum 100 caractères"),
});
// Mise à jour d'un genre
export const updateGenreSchema = z.object({
    name: z
        .string()
        .min(2, "Minimum 2 caractères")
        .max(100, "Maximum 100 caractères")
        .optional(),
});
// Paramètres de recherche
export const genreQuerySchema = z.object({
    search: z.string().optional(),
    limit: z.coerce.number().min(1).max(50).default(20),
    offset: z.coerce.number().min(0).default(0),
});
// ID de genre
export const genreIdSchema = z.object({
    id: z.coerce.number().positive(),
});
//# sourceMappingURL=genreValidation.js.map