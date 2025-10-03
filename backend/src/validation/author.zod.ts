import { z } from 'zod';
import { idParamSchema, paginationSchema, searchQuerySchema } from './common.zod.js';

// Schema de base - 100% compatible avec le modele Sequelize Author
const baseAuthorSchema = z.object({
    name: z.string()
        .min(1, 'Le nom est requis')
        .max(100, 'Le nom ne peut pas depasser 100 caracteres')
        .trim(),

    bio: z.string()
        .max(2000, 'La biographie ne peut pas depasser 2000 caracteres')
        .trim()
        .optional(),

    birth_date: z.union([
        // Format ISO (YYYY-MM-DD) - pour compatibilite
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format ISO invalide').transform(str => new Date(str)),
        // Format français (DD/MM/YYYY) - format metier
        z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Format français invalide').transform(str => {
            const [day, month, year] = str.split('/');
            return new Date(`${year}-${month}-${day}`);
        })
    ]).refine(date => !isNaN(date.getTime()), 'Date invalide').optional(),

    death_date: z.union([
        // Format ISO (YYYY-MM-DD) - pour compatibilite  
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format ISO invalide').transform(str => new Date(str)),
        // Format français (DD/MM/YYYY) - format metier
        z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Format français invalide').transform(str => {
            const [day, month, year] = str.split('/');
            return new Date(`${year}-${month}-${day}`);
        })
    ]).refine(date => !isNaN(date.getTime()), 'Date invalide').optional()
});

// Schema de creation AVEC validation birth_date/death_date
export const createAuthorSchema = baseAuthorSchema.refine(
    data => {
        if (data.birth_date && data.death_date) {
            return data.death_date >= data.birth_date;
        }
        return true;
    },
    {
        message: 'La date de deces doit être posterieure a la date de naissance',
        path: ['death_date']
    }
);

// Schema de mise a jour (partial du schema de base)
export const updateAuthorSchema = baseAuthorSchema.partial();

// Schema des parametres de route (/authors/:id) - Reutilise common
export const authorParamsSchema = idParamSchema;

// Schema de recherche (?q=tolkien&birth_year=1892) - Compatible avec modele
export const authorSearchSchema = z.object({
    name: z.string().min(1).optional(),
    birth_year: z.string().regex(/^\d{4}$/).transform(Number).optional(),
    death_year: z.string().regex(/^\d{4}$/).transform(Number).optional()
}).merge(searchQuerySchema).merge(paginationSchema);

// Types TypeScript
export type CreateAuthorInput = z.infer<typeof createAuthorSchema>;
export type UpdateAuthorInput = z.infer<typeof updateAuthorSchema>;
export type AuthorParams = z.infer<typeof authorParamsSchema>;
export type AuthorSearchQuery = z.infer<typeof authorSearchSchema>;