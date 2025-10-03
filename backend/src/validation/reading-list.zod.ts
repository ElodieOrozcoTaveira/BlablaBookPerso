import { z } from 'zod';
import { idParamSchema, paginationSchema } from './common.zod.js';

  // Enum des statuts de lecture
const ReadingStatus = z.enum(['to_read', 'reading', 'read', 'abandoned']);

  // Schema de base (sans validation custom)
const baseReadingListSchema = z.object({
    id_library: z.number().positive('L\'ID de la bibliothèque doit être positif'),
    id_book: z.number().positive('L\'ID du livre doit être positif'),

    reading_status: ReadingStatus.default('to_read'),

    started_at: z.union([
        // Format ISO (YYYY-MM-DD) - pour compatibilité
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format ISO invalide').transform(str => new Date(str)),
        // Format français (DD/MM/YYYY) - format métier
        z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Format français invalide').transform(str => {
            const [day, month, year] = str.split('/');
            return new Date(`${year}-${month}-${day}`);
        }),
        // Date object direct
        z.date()
    ]).refine(date => !isNaN(date.getTime()), 'Date invalide').optional(),

    finished_at: z.union([
        // Format ISO (YYYY-MM-DD) - pour compatibilité
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format ISO invalide').transform(str => new Date(str)),
        // Format français (DD/MM/YYYY) - format métier
        z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Format français invalide').transform(str => {
            const [day, month, year] = str.split('/');
            return new Date(`${year}-${month}-${day}`);
        }),
        // Date object direct
        z.date()
    ]).refine(date => !isNaN(date.getTime()), 'Date invalide').optional()
});

  // Schema de création AVEC validation custom
export const createReadingListSchema = baseReadingListSchema.refine(data => {
    // Si status = 'reading', started_at doit être défini
    if (data.reading_status === 'reading' && !data.started_at) {
    return false;
    }
    // Si status = 'read', finished_at doit être défini
    if (data.reading_status === 'read' && !data.finished_at) {
    return false;
    }
    // finished_at doit être après started_at
    if (data.started_at && data.finished_at && data.finished_at < data.started_at) {
    return false;
    }
    return true;
}, {
    message: 'Les dates doivent être cohérentes avec le statut de lecture'
});

  // Schema de mise à jour (du schema de BASE, pas de création)
export const updateReadingListSchema = baseReadingListSchema
    .omit({ id_library: true, id_book: true })
    .partial();

  // Schema des paramètres de route - Réutilise common
export const readingListParamsSchema = idParamSchema;

  // Schema de recherche - Réutilise common
export const readingListSearchSchema = z.object({
    id_library: z.string().regex(/^\d+$/).transform(Number).optional(),
    id_book: z.string().regex(/^\d+$/).transform(Number).optional(),
    reading_status: ReadingStatus.optional()
}).merge(paginationSchema);

  // Types TypeScript
export type CreateReadingListInput = z.infer<typeof createReadingListSchema>;
export type UpdateReadingListInput = z.infer<typeof updateReadingListSchema>;
export type ReadingListParams = z.infer<typeof readingListParamsSchema>;
export type ReadingListSearchQuery = z.infer<typeof readingListSearchSchema>;
export type ReadingStatusType = z.infer<typeof ReadingStatus>;