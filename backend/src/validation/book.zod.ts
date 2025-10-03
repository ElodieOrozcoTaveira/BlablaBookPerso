import { z } from 'zod';
import { idParamSchema, paginationSchema, searchQuerySchema } from './common.zod.js';

//Schema de création (POST /books)
export const createBookSchema = z.object({
    isbn: z.string()
    .min(10, "ISBN doit faire au moins 10 caractères")
    .max(13, "ISBN doit faire au plus 13 caractères")
    .regex(/^\d+$/, "ISBN doit être un nombre")
    .optional(), // Nullable dans le model
    
    title: z.string()
    .min(1, "Le titre est requis")
    .max(255, "Le titre ne peut pas dépasser 255 caractères")
    .trim(),

    description: z.string()
    .max(2000, "La description ne peut pas dépasser 2000 caractères")
    .trim()
    .optional(),

    publication_year: z.number()
    .int("L'année de publication doit être un entier")
    .min(-3000, "L'année de publication doit être postérieure à -3000")
    .max(new Date().getFullYear(), "L'année de publication ne peut pas être dans le futur")
    .optional(),

    page_count: z.number()
    .min(1, "Le nombre de pages doit être supérieur à 0")
    .optional(),

    language: z.string()
    .max(20, "La langue ne peut pas dépasser 20 caractères")
    .default("fr"),

    cover_url: z.string()
    .max(500, "L'URL de la couverture ne peut pas dépasser 500 caractères")
    .optional(), // Peut être URL ou JSON des tailles

    cover_local: z.string()
    .max(500, "Le nom du fichier de couverture ne peut pas dépasser 500 caractères")
    .optional(),

    open_library_key: z.string()
    .max(100, "La clé Open Library ne peut pas dépasser 100 caractères")
    .optional(),

// Relations Many-to-Many (array d'IDs)
    author_ids: z.array(z.number().positive("L'ID de l'auteur doit être positif"))
    .min(1, "Au moins un auteur est requis")
    .optional(),

    genre_ids: z.array(z.number().positive("L'ID du genre doit être positif"))
    .optional(),
});

// Schema de mise à jour (PUT/PATCH /books/:id)
export const updateBookSchema = createBookSchema.partial();
 
// Schema des parametres de la route /books/:id - Réutilise common
export const bookParamsSchema = idParamSchema;

// Schema de recherche avec pagination réutilisée
export const bookSearchSchema = z.object({
    isbn: z.string().regex(/^\d+$/, "ISBN invalide").optional(),
    author: z.string().min(1, "Le nom d'auteur ne peut pas être vide").optional(),
    genre: z.string().min(1, "Le genre ne peut pas être vide").optional(),
    publication_year: z.string().regex(/^\d{4}$/, "L'année doit être au format YYYY").transform(Number).optional()
}).merge(searchQuerySchema).merge(paginationSchema);

// Types TypeScript

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type BookParams = z.infer<typeof bookParamsSchema>;
export type BookSearchQuery = z.infer<typeof bookSearchSchema>;