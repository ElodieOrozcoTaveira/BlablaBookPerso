import { z } from "zod";

/**
 * VALIDATIONS ZOD POUR LES RÔLES DES UTILISATEURS
 */

// Assignation d'un rôle à un utilisateur
export const createUserRoleSchema = z.object({
  userId: z.number().positive(),
  roleId: z.number().positive(),
});

// Suppression d'un rôle
export const deleteUserRoleSchema = z.object({
  userId: z.coerce.number().positive(),
  roleId: z.coerce.number().positive(),
});

// Paramètres de recherche
export const userRoleQuerySchema = z.object({
  userId: z.coerce.number().positive().optional(),
  roleId: z.coerce.number().positive().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

// ID d'utilisateur
export const userIdSchema = z.object({
  userId: z.coerce.number().positive(),
});

// ID de rôle
export const roleIdSchema = z.object({
  roleId: z.coerce.number().positive(),
});
