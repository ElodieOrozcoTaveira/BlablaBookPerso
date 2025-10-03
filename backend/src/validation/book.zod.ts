import { z } from 'zod';
import { idParamSchema, paginationSchema, searchQuerySchema } from './common.zod.js';

//Schema de creation (POST /books)
export const createBookSchema = z.object({
    isbn: z.string()
    .min(10, "ISBN doit faire au moins 10 caracteres")
    .max(13, "ISBN doit faire au plus 13 caracteres")
    .regex(/^\d+$/, "ISBN doit être un nombre")
    .optional(), // Nullable dans le model
    
    title: z.string()
    .min(1, "Le titre est requis")
    .max(255, "Le titre ne peut pas depasser 255 caracteres")
    .trim(),

    description: z.string()
    .max(2000, "La description ne peut pas depasser 2000 caracteres")
    .trim()
    .optional(),

    publication_year: z.number()
    .int("L'annee de publication doit être un entier")
    .min(-3000, "L'annee de publication doit être posterieure a -3000")
    .max(new Date().getFullYear(), "L'annee de publication ne peut pas être dans le futur")
    .optional(),

    page_count: z.number()
    .min(1, "Le nombre de pages doit être superieur a 0")
    .optional(),

    language: z.string()
    .max(20, "La langue ne peut pas depasser 20 caracteres")
    .default("fr"),

    cover_url: z.string()
    .max(500, "L'URL de la couverture ne peut pas depasser 500 caracteres")
    .optional(), // Peut etre URL ou JSON des tailles

    cover_local: z.string()
    .max(500, "Le nom du fichier de couverture ne peut pas depasser 500 caracteres")
    .optional(),

    open_library_key: z.string()
    .max(100, "La cle Open Library ne peut pas depasser 100 caracteres")
    .optional(),

// Relations Many-to-Many (array d'IDs)
    author_ids: z.array(z.number().positive("L'ID de l'auteur doit être positif"))
    .min(1, "Au moins un auteur est requis")
    .optional(),

    genre_ids: z.array(z.number().positive("L'ID du genre doit être positif"))
    .optional(),
});

// Schema de mise a jour (PUT/PATCH /books/:id)
export const updateBookSchema = createBookSchema.partial();
 
// Schema des parametres de la route /books/:id - Reutilise common
export const bookParamsSchema = idParamSchema;

// Schema de recherche avec pagination reutilisee
export const bookSearchSchema = z.object({
    isbn: z.string().regex(/^\d+$/, "ISBN invalide").optional(),
    author: z.string().min(1, "Le nom d'auteur ne peut pas être vide").optional(),
    genre: z.string().min(1, "Le genre ne peut pas être vide").optional(),
    publication_year: z.string().regex(/^\d{4}$/, "L'annee doit être au format YYYY").transform(Number).optional(),
    searchType: z.enum(['title', 'author', 'genre']).default('title')
}).merge(searchQuerySchema).merge(paginationSchema);

// Types TypeScript

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type BookParams = z.infer<typeof bookParamsSchema>;
export type BookSearchQuery = z.infer<typeof bookSearchSchema>;