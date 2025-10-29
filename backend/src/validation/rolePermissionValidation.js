import { z } from "zod";
/**
 * VALIDATIONS ZOD POUR LES PERMISSIONS DES RÔLES
 */
// Assignation d'une permission à un rôle
export const createRolePermissionSchema = z.object({
    roleId: z.number().positive(),
    permissionId: z.number().positive(),
});
// Suppression d'une permission
export const deleteRolePermissionSchema = z.object({
    roleId: z.coerce.number().positive(),
    permissionId: z.coerce.number().positive(),
});
// Paramètres de recherche
export const rolePermissionQuerySchema = z.object({
    roleId: z.coerce.number().positive().optional(),
    permissionId: z.coerce.number().positive().optional(),
    limit: z.coerce.number().min(1).max(100).default(50),
    offset: z.coerce.number().min(0).default(0),
});
// ID de rôle
export const roleIdSchema = z.object({
    roleId: z.coerce.number().positive(),
});
// ID de permission
export const permissionIdSchema = z.object({
    permissionId: z.coerce.number().positive(),
});
//# sourceMappingURL=rolePermissionValidation.js.map