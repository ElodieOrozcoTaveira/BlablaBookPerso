import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
/**
 * SCHÉMAS DE VALIDATION ZOD
 *
 * Validation type-safe des données d'authentification avec Zod car plus moderne et plus adapté à TS.
 */
export declare const registerSchema: z.ZodObject<{
    username: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    firstname: z.ZodString;
    lastname: z.ZodString;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, z.core.$strip>;
export declare const resetPasswordSchema: z.ZodObject<{
    token: z.ZodString;
    newPassword: z.ZodString;
}, z.core.$strip>;
/**
 * TYPES TYPESCRIPT AUTOMATIQUES
 */
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export declare const validateRegister: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validateLogin: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validateForgotPassword: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validateResetPassword: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * VALIDATION OPTIONNELLE (pour les mises à jour partielles)
 */
export declare const validateRegisterPartial: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * EXEMPLE D'UTILISATION DANS LES ROUTES :
 *
 * router.post('/register', validateRegister, AuthController.register);
 * router.post('/login', validateLogin, AuthController.login);
 *
 * Les données dans req.body seront automatiquement validées et typées !
 */ 
//# sourceMappingURL=validationMiddlewares.d.ts.map