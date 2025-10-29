import { z } from "zod";
/**
 * VALIDATIONS ZOD POUR LES LISTES DE LECTURE
 */
export declare const createReadingListSchema: z.ZodObject<{
    libraryId: z.ZodNumber;
    userId: z.ZodNumber;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    genre: z.ZodOptional<z.ZodString>;
    statut: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const updateReadingListSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    genre: z.ZodOptional<z.ZodString>;
    statut: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const readingListQuerySchema: z.ZodObject<{
    userId: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    libraryId: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    genre: z.ZodOptional<z.ZodString>;
    statut: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    search: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    offset: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const readingListIdSchema: z.ZodObject<{
    id: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
export declare const userIdSchema: z.ZodObject<{
    userId: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
//# sourceMappingURL=readingListValidation.d.ts.map