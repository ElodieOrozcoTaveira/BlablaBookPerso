import { z } from "zod";
/**
 * VALIDATIONS ZOD POUR LES NOTES
 */
export declare const createRateSchema: z.ZodObject<{
    userId: z.ZodNumber;
    bookId: z.ZodNumber;
    readingListId: z.ZodOptional<z.ZodNumber>;
    rate: z.ZodNumber;
}, z.core.$strip>;
export declare const updateRateSchema: z.ZodObject<{
    rate: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const rateQuerySchema: z.ZodObject<{
    userId: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    bookId: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    readingListId: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    minRate: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    maxRate: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    offset: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const rateIdSchema: z.ZodObject<{
    id: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
export declare const userBookSchema: z.ZodObject<{
    userId: z.ZodCoercedNumber<unknown>;
    bookId: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
//# sourceMappingURL=rateValidation.d.ts.map