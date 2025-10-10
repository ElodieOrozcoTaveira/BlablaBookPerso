import { z } from "zod";
import type { Request, Response, NextFunction } from "express";

/**
 * SCHÉMAS DE VALIDATION ZOD
 * 
 * Validation type-safe des données d'authentification avec Zod car plus moderne et plus adapté à TS.
 */

// Schéma pour l'inscription
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
    .max(30, "Le nom d'utilisateur ne peut pas dépasser 30 caractères")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscore"
    )
    .trim(),

  email: z
    .string()
    .email("Email invalide")
    .max(100, "L'email ne peut pas dépasser 100 caractères")
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(128, "Le mot de passe ne peut pas dépasser 128 caractères")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Le mot de passe doit contenir au moins: 1 minuscule, 1 majuscule, 1 chiffre, 1 caractère spécial"
    ),

  firstname: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères")
    .regex(
      /^[a-zA-ZÀ-ÿ\s\-']+$/,
      "Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes"
    )
    .trim(),

  lastname: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .regex(
      /^[a-zA-ZÀ-ÿ\s\-']+$/,
      "Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes"
    )
    .trim()
});

// Schéma pour la connexion
export const loginSchema = z.object({
  email: z
    .string()
    .email("Email invalide")
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(1, "Mot de passe requis")
});

// Schéma pour mot de passe oublié
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Email invalide")
    .trim()
    .toLowerCase()
});

// Schéma pour réinitialisation du mot de passe
export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(10, "Token de réinitialisation invalide"),

  newPassword: z
    .string()
    .min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères")
    .max(128, "Le mot de passe ne peut pas dépasser 128 caractères")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Le mot de passe doit contenir au moins: 1 minuscule, 1 majuscule, 1 chiffre, 1 caractère spécial"
    )
});

/**
 * TYPES TYPESCRIPT AUTOMATIQUES
 */
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * MIDDLEWARES DE VALIDATION ZOD
 */

// Fonction générique pour créer un middleware de validation
const createValidationMiddleware = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Valider et transformer les données
      const validatedData = schema.parse(req.body);
      
      // Remplacer req.body par les données validées et nettoyées
      req.body = validatedData;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Données invalides",
          errors: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code
          }))
        });
      }
      
      // Erreur inattendue
      console.error("❌ Erreur de validation inattendue:", error);
      return res.status(500).json({
        success: false,
        message: "Erreur interne lors de la validation"
      });
    }
  };
};

// Middlewares spécifiques
export const validateRegister = createValidationMiddleware(registerSchema);
export const validateLogin = createValidationMiddleware(loginSchema);
export const validateForgotPassword = createValidationMiddleware(forgotPasswordSchema);
export const validateResetPassword = createValidationMiddleware(resetPasswordSchema);

/**
 * VALIDATION OPTIONNELLE (pour les mises à jour partielles)
 */
export const validateRegisterPartial = createValidationMiddleware(
  registerSchema.partial()
);

/**
 * EXEMPLE D'UTILISATION DANS LES ROUTES :
 * 
 * router.post('/register', validateRegister, AuthController.register);
 * router.post('/login', validateLogin, AuthController.login);
 * 
 * Les données dans req.body seront automatiquement validées et typées !
 */