import { z } from 'zod';
import { idParamSchema, paginationSchema, searchQuerySchema, booleanQuerySchema } from './common.zod.js';

  // Schema de creation (POST /notices)
export const createNoticeSchema = z.object({
  id_book: z.number().positive('L\'ID du livre doit être positif').optional(),
  open_library_key: z.string().min(3, 'open_library_key trop court').optional(),

    title: z.string()
    .max(100, 'Le titre ne peut pas depasser 100 caracteres')
    .trim()
    .optional(),

    content: z.string()
    .min(10, 'Le contenu doit faire au moins 10 caracteres')
    .max(2000, 'Le contenu ne peut pas depasser 2000 caracteres')
    .trim(),

    is_spoiler: z.boolean().default(false),

    is_public: z.boolean().default(true)

    // id_user sera ajoute automatiquement par le middleware auth
}).refine(data => {
  const hasIdBook = typeof data.id_book === 'number';
  const hasOLKey = !!data.open_library_key;
  return (hasIdBook || hasOLKey) && !(hasIdBook && hasOLKey);
}, { message: 'Fournir soit id_book soit open_library_key (exclusif)' });

  // Schema de mise à jour (PUT/PATCH /notices/:id)
export const updateNoticeSchema = createNoticeSchema
  .omit({ id_book: true, open_library_key: true }) // On ne change pas le livre
  .partial();

  // Schema des parametres de route (/notices/:id) - Reutilise common
export const noticeParamsSchema = idParamSchema;

  // Schema de recherche (?id_book=123&is_spoiler=false&is_public=true) - Reutilise common
export const noticeSearchSchema = z.object({
    id_book: z.string().regex(/^\d+$/).transform(Number).optional(),
    id_user: z.string().regex(/^\d+$/).transform(Number).optional(),
    is_spoiler: booleanQuerySchema.optional(),
    is_public: booleanQuerySchema.optional()
}).merge(searchQuerySchema).merge(paginationSchema);

  // Types TypeScript
export type CreateNoticeInput = z.infer<typeof createNoticeSchema>;
export type UpdateNoticeInput = z.infer<typeof updateNoticeSchema>;
export type NoticeParams = z.infer<typeof noticeParamsSchema>;
export type NoticeSearchQuery = z.infer<typeof noticeSearchSchema>;