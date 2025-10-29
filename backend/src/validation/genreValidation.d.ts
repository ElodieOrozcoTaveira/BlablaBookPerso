import { z } from "zod";
/**
 * VALIDATIONS ZOD POUR LES GENRES
 */
export declare const createGenreSchema: z.ZodObject<{
    name: z.ZodString;
}, z.core.$strip>;
export declare const updateGenreSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const genreQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    offset: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const genreIdSchema: z.ZodObject<{
    id: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
//# sourceMappingURL=genreValidation.d.ts.map