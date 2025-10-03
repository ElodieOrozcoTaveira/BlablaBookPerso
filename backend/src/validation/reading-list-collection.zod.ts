import { z } from 'zod';

// Schema de validation pour créer une collection de listes de lecture
export const createReadingListCollectionSchema = z.object({
    name: z.string()
        .min(1, 'Le nom est requis')
        .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
    description: z.string()
        .max(1000, 'La description ne peut pas dépasser 1000 caractères')
        .optional(),
    is_public: z.boolean()
        .optional()
        .default(false)
});

// Schema de validation pour mettre à jour une collection de listes de lecture
export const updateReadingListCollectionSchema = z.object({
    name: z.string()
        .min(1, 'Le nom ne peut pas être vide')
        .max(100, 'Le nom ne peut pas dépasser 100 caractères')
        .optional(),
    description: z.string()
        .max(1000, 'La description ne peut pas dépasser 1000 caractères')
        .optional(),
    is_public: z.boolean()
        .optional()
});

// Schema de validation pour les paramètres ID
export const readingListCollectionParamsSchema = z.object({
    id: z.coerce.number().int().positive('ID invalide')
});

// Schema de validation pour ajouter un livre à une collection
export const addBookToCollectionSchema = z.object({
    id_book: z.coerce.number().int().positive().optional(),
    open_library_key: z.string().min(1).optional(),
    reading_status: z.enum(['to_read', 'reading', 'read', 'abandoned']).default('to_read')
}).refine(data => data.id_book || data.open_library_key, {
    message: "Il faut fournir soit id_book soit open_library_key"
});

// Types dérivés pour TypeScript
export type CreateReadingListCollectionInput = z.infer<typeof createReadingListCollectionSchema>;
export type UpdateReadingListCollectionInput = z.infer<typeof updateReadingListCollectionSchema>;
export type ReadingListCollectionParams = z.infer<typeof readingListCollectionParamsSchema>;
export type AddBookToCollectionInput = z.infer<typeof addBookToCollectionSchema>;