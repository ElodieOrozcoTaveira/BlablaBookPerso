import { z } from "zod";
/**
 * VALIDATIONS ZOD POUR LES AVIS (NOTICES)
 */
export declare const createNoticeSchema: z.ZodObject<{
    comment: z.ZodString;
}, z.core.$strip>;
export declare const updateNoticeSchema: z.ZodObject<{
    comment: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const noticeQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    offset: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const noticeIdSchema: z.ZodObject<{
    id: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
//# sourceMappingURL=noticeValidation.d.ts.map