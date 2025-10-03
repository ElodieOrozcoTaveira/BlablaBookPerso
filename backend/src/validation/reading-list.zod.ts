import { z } from 'zod';
import { idParamSchema, paginationSchema } from './common.zod.js';

  // Enum des statuts de lecture
const ReadingStatus = z.enum(['to_read', 'reading', 'read', 'abandoned']);

  // Schema de base (sans validation custom)
const baseReadingListSchema = z.object({
  id_library: z.number().positive('L\'ID de la bibliotheque doit être positif'),
  id_book: z.number().positive('L\'ID du livre doit être positif').optional(),
  open_library_key: z.string().min(3, 'open_library_key trop court').optional(),

    reading_status: ReadingStatus.default('to_read'),

    started_at: z.union([
        // Format ISO (YYYY-MM-DD) - pour compatibilite
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format ISO invalide').transform(str => new Date(str)),
        // Format français (DD/MM/YYYY) - format metier
        z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Format français invalide').transform(str => {
            const [day, month, year] = str.split('/');
            return new Date(`${year}-${month}-${day}`);
        }),
        // Date object direct
        z.date()
    ]).refine(date => !isNaN(date.getTime()), 'Date invalide').optional(),

    finished_at: z.union([
        // Format ISO (YYYY-MM-DD) - pour compatibilite
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format ISO invalide').transform(str => new Date(str)),
        // Format français (DD/MM/YYYY) - format metier
        z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Format français invalide').transform(str => {
            const [day, month, year] = str.split('/');
            return new Date(`${year}-${month}-${day}`);
        }),
        // Date object direct
        z.date()
    ]).refine(date => !isNaN(date.getTime()), 'Date invalide').optional()
});

  // Schema de creation AVEC validation custom
export const createReadingListSchema = baseReadingListSchema.refine(data => {
  // XOR: soit id_book soit open_library_key
  const hasIdBook = typeof data.id_book === 'number';
  const hasOLKey = !!data.open_library_key;
  if (!(hasIdBook || hasOLKey) || (hasIdBook && hasOLKey)) {
    return false;
  }
    // Si status = 'reading', started_at doit être defini
    if (data.reading_status === 'reading' && !data.started_at) {
    return false;
    }
    // Si status = 'read', finished_at doit être defini
    if (data.reading_status === 'read' && !data.finished_at) {
    return false;
    }
    // finished_at doit être apres started_at
    if (data.started_at && data.finished_at && data.finished_at < data.started_at) {
    return false;
    }
    return true;
}, {
  message: 'Les dates doivent être coherentes avec le statut de lecture ET fournir soit id_book soit open_library_key (exclusif)'
});

  // Schema de mise a jour (du schema de BASE, pas de creation)
export const updateReadingListSchema = baseReadingListSchema
  .omit({ id_library: true, id_book: true, open_library_key: true })
  .partial();

  // Schema des parametres de route - Reutilise common
export const readingListParamsSchema = idParamSchema;

  // Schema de recherche - Reutilise common
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