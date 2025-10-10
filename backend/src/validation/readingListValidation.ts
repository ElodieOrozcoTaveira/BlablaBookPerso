import { z } from "zod";

/**
 * VALIDATIONS ZOD POUR LES LISTES DE LECTURE
 */

// Création d'une liste de lecture
export const createReadingListSchema = z.object({
  libraryId: z.number().positive(),
  userId: z.number().positive(),
  name: z
    .string()
    .min(2, "Minimum 2 caractères")
    .max(200, "Maximum 200 caractères"),
  description: z.string().max(500, "Maximum 500 caractères").optional(),
  genre: z.string().max(100, "Maximum 100 caractères").optional(),
  statut: z.boolean().default(true).optional(),
});

// Mise à jour d'une liste
export const updateReadingListSchema = z.object({
  name: z
    .string()
    .min(2, "Minimum 2 caractères")
    .max(200, "Maximum 200 caractères")
    .optional(),
  description: z.string().max(500, "Maximum 500 caractères").optional(),
  genre: z.string().max(100, "Maximum 100 caractères").optional(),
  statut: z.boolean().optional(),
});

// Paramètres de recherche
export const readingListQuerySchema = z.object({
  userId: z.coerce.number().positive().optional(),
  libraryId: z.coerce.number().positive().optional(),
  genre: z.string().optional(),
  statut: z.coerce.boolean().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
});

// ID de liste
export const readingListIdSchema = z.object({
  id: z.coerce.number().positive(),
});

// Paramètres utilisateur
export const userIdSchema = z.object({
  userId: z.coerce.number().positive(),
});
