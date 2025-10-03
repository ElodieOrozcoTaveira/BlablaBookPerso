import { z } from 'zod';
import { idParamSchema, paginationSchema } from './common.zod.js';

// Schema de creation (POST /rates)
export const createRateSchema = z.object({
    id_book: z.number().positive('L\'ID du livre doit être positif'),
    
    rating: z.number()
        .int('La note doit être un entier')
        .min(1, 'La note doit être au minimum 1')
        .max(5, 'La note doit être au maximum 5')
    
    // id_user sera ajoute automatiquement par le middleware auth
});

// Schema de mise a jour (PUT/PATCH /rates/:id)
export const updateRateSchema = z.object({
    rating: z.number()
    .int('La note doit être un entier')
    .min(1, 'La note doit être au minimum 1')
    .max(5, 'La note doit être au maximum 5')
});

// Schema des parametres de route (/rates/:id) - Reutilise common
export const rateParamsSchema = idParamSchema;

// Schema de recherche (?id_book=123&rating=5) avec pagination reutilisee
export const rateSearchSchema = z.object({
    id_book: z.string().regex(/^\d+$/, "L'ID du livre doit être un nombre").transform(Number).optional(),
    id_user: z.string().regex(/^\d+$/, "L'ID de l'utilisateur doit être un nombre").transform(Number).optional(),
    rating: z.string().regex(/^[1-5]$/, "La note doit être entre 1 et 5").transform(Number).optional()
}).merge(paginationSchema);

// Types TypeScript
export type CreateRateInput = z.infer<typeof createRateSchema>;
export type UpdateRateInput = z.infer<typeof updateRateSchema>;
export type RateParams = z.infer<typeof rateParamsSchema>;
export type RateSearchQuery = z.infer<typeof rateSearchSchema>;