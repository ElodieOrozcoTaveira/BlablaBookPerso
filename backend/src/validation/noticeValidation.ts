import { z } from "zod";

/**
 * VALIDATIONS ZOD POUR LES AVIS (NOTICES)
 */

// Création d'un avis
export const createNoticeSchema = z.object({
  comment: z
    .string()
    .min(10, "Minimum 10 caractères")
    .max(500, "Maximum 500 caractères"),
});

// Mise à jour d'un avis
export const updateNoticeSchema = z.object({
  comment: z
    .string()
    .min(10, "Minimum 10 caractères")
    .max(500, "Maximum 500 caractères")
    .optional(),
});

// Paramètres de recherche
export const noticeQuerySchema = z.object({
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
});

// ID d'avis
export const noticeIdSchema = z.object({
  id: z.coerce.number().positive(),
});
