import { z } from "zod";
/**
 * VALIDATIONS ZOD POUR LES RÔLES DES UTILISATEURS
 */
export declare const createUserRoleSchema: z.ZodObject<{
    userId: z.ZodNumber;
    roleId: z.ZodNumber;
}, z.core.$strip>;
export declare const deleteUserRoleSchema: z.ZodObject<{
    userId: z.ZodCoercedNumber<unknown>;
    roleId: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
export declare const userRoleQuerySchema: z.ZodObject<{
    userId: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    roleId: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    offset: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const userIdSchema: z.ZodObject<{
    userId: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
export declare const roleIdSchema: z.ZodObject<{
    roleId: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
//# sourceMappingURL=userRoleValidation.d.ts.map