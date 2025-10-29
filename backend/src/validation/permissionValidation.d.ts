import { z } from "zod";
/**
 * VALIDATIONS ZOD POUR LES PERMISSIONS
 */
export declare const createPermissionSchema: z.ZodObject<{
    label: z.ZodString;
    action: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updatePermissionSchema: z.ZodObject<{
    label: z.ZodOptional<z.ZodString>;
    action: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const permissionQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    offset: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const permissionIdSchema: z.ZodObject<{
    id: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
//# sourceMappingURL=permissionValidation.d.ts.map