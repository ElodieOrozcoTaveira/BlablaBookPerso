import { z } from 'zod';

// Schema pour les parametres d'ID (/:id)
export const idParamSchema = z.object({
    id: z.string()
    .regex(/^\d+$/, 'L\'ID doit être un nombre')
    .transform(Number)
});

// Schema de pagination (page & limit)
export const paginationSchema = z.object({
    page: z.string()
    .regex(/^\d+$/, 'La page doit être un nombre')
    .default('1')
    .transform(Number),

    limit: z.string()
    .regex(/^\d+$/, 'La limite doit être un nombre')
    .default('20')
    .transform(val => {
        const num = Number(val);
        if (num > 100) {throw new Error('Maximum 100 elements par page');}
        return num;
    })
});

// Schema pour recherche generale
export const searchQuerySchema = z.object({
    query: z.string()
    .min(1, 'La recherche ne peut pas être vide')
    .max(100, 'La recherche ne peut pas depasser 100 caracteres')
    .trim()
    .optional()
});

// Schema pour les transformations boolean
export const booleanQuerySchema = z.string()
    .transform(val => val === 'true');

// Schema pour les annees (birth_year, publication_year, etc.)
export const yearSchema = z.number()
    .int('L\'annee doit être un entier')
    .min(-3000, 'L\'annee doit être posterieure a -3000')
    .max(new Date().getFullYear(), 'L\'annee ne peut pas être dans le futur');

// Schema pour les annees en query params
export const yearQuerySchema = z.string()
    .regex(/^\d{4}$/, 'L\'annee doit être au format YYYY')
    .transform(Number);

// Types TypeScript communs
export type IdParam = z.infer<typeof idParamSchema>;
export type PaginationQuery = z.infer<typeof paginationSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;