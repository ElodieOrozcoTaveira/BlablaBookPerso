import { z } from "zod";

/**
 * VALIDATIONS ZOD POUR LES NOTES
 */

// Création d'une note
export const createRateSchema = z.object({
  userId: z.number().positive(),
  bookId: z.number().positive(),
  readingListId: z.number().positive().optional(),
  rate: z
    .number()
    .min(1, "Note minimum : 1")
    .max(5, "Note maximum : 5")
    .int("La note doit être un entier"),
});

// Mise à jour d'une note
export const updateRateSchema = z.object({
  rate: z
    .number()
    .min(1, "Note minimum : 1")
    .max(5, "Note maximum : 5")
    .int("La note doit être un entier")
    .optional(),
});

// Paramètres de recherche
export const rateQuerySchema = z.object({
  userId: z.coerce.number().positive().optional(),
  bookId: z.coerce.number().positive().optional(),
  readingListId: z.coerce.number().positive().optional(),
  minRate: z.coerce.number().min(1).max(5).optional(),
  maxRate: z.coerce.number().min(1).max(5).optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
});

// ID de note
export const rateIdSchema = z.object({
  id: z.coerce.number().positive(),
});

// Paramètres utilisateur/livre
export const userBookSchema = z.object({
  userId: z.coerce.number().positive(),
  bookId: z.coerce.number().positive(),
});
