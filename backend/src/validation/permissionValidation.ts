import { z } from "zod";

/**
 * VALIDATIONS ZOD POUR LES PERMISSIONS
 */

// Création d'une permission
export const createPermissionSchema = z.object({
  label: z
    .string()
    .min(2, "Minimum 2 caractères")
    .max(50, "Maximum 50 caractères"),
  action: z.string().max(255, "Maximum 255 caractères").optional(),
});

// Mise à jour d'une permission
export const updatePermissionSchema = z.object({
  label: z
    .string()
    .min(2, "Minimum 2 caractères")
    .max(50, "Maximum 50 caractères")
    .optional(),
  action: z.string().max(255, "Maximum 255 caractères").optional(),
});

// Paramètres de recherche
export const permissionQuerySchema = z.object({
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
});

// ID de permission
export const permissionIdSchema = z.object({
  id: z.coerce.number().positive(),
});
