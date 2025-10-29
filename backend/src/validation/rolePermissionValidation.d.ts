import { z } from "zod";
/**
 * VALIDATIONS ZOD POUR LES PERMISSIONS DES RÔLES
 */
export declare const createRolePermissionSchema: z.ZodObject<{
    roleId: z.ZodNumber;
    permissionId: z.ZodNumber;
}, z.core.$strip>;
export declare const deleteRolePermissionSchema: z.ZodObject<{
    roleId: z.ZodCoercedNumber<unknown>;
    permissionId: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
export declare const rolePermissionQuerySchema: z.ZodObject<{
    roleId: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    permissionId: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    offset: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const roleIdSchema: z.ZodObject<{
    roleId: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
export declare const permissionIdSchema: z.ZodObject<{
    permissionId: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
//# sourceMappingURL=rolePermissionValidation.d.ts.map