import { z } from 'zod';
import { idParamSchema, paginationSchema, searchQuerySchema } from './common.zod.js';

// Schema de creation d'utilisateur (register)
export const createUserSchema = z.object({
    firstname: z.string()
        .min(1, 'Le prenom est requis')
        .max(50, 'Le prenom ne peut pas depasser 50 caracteres')
        .trim(),
        
    lastname: z.string()
        .min(1, 'Le nom est requis') 
        .max(50, 'Le nom ne peut pas depasser 50 caracteres')
        .trim(),
        
    username: z.string()
        .min(3, 'Le nom d\'utilisateur doit faire au moins 3 caracteres')
        .max(30, 'Le nom d\'utilisateur ne peut pas depasser 30 caracteres')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, _ et -')
        .trim(),
        
    email: z
        .email('Email invalide')
        .max(100, 'L\'email ne peut pas depasser 100 caracteres')
        .toLowerCase()
        .trim(),
        
    password: z.string()
        .min(8, 'Le mot de passe doit faire au moins 8 caracteres')
        .max(72, 'Le mot de passe ne peut pas depasser 72 caracteres') // Limite bcrypt
        .regex(/(?=.*[a-z])/, 'Le mot de passe doit contenir au moins une minuscule')
        .regex(/(?=.*[A-Z])/, 'Le mot de passe doit contenir au moins une majuscule') 
        .regex(/(?=.*\d)/, 'Le mot de passe doit contenir au moins un chiffre')
        .regex(/(?=.*[@$!%*?&])/, 'Le mot de passe doit contenir au moins un caractere special (@$!%*?&)')
});

// Schema de mise a jour du profil (sans mot de passe)
export const updateProfileSchema = z.object({
    firstname: z.string()
        .min(1, 'Le prenom est requis')
        .max(50, 'Le prenom ne peut pas depasser 50 caracteres')
        .trim()
        .optional(),
        
    lastname: z.string()
        .min(1, 'Le nom est requis')
        .max(50, 'Le nom ne peut pas depasser 50 caracteres')  
        .trim()
        .optional(),
        
    username: z.string()
        .min(3, 'Le nom d\'utilisateur doit faire au moins 3 caracteres')
        .max(30, 'Le nom d\'utilisateur ne peut pas depasser 30 caracteres')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, _ et -')
        .trim()
        .optional()
});

// Schema de modification partielle du profil (tous les champs optionnels)
export const patchProfileSchema = z.object({
    firstname: z.string()
        .min(1, 'Le prenom ne peut pas etre vide')
        .max(50, 'Le prenom ne peut pas depasser 50 caracteres')
        .trim()
        .optional(),
        
    lastname: z.string()
        .min(1, 'Le nom ne peut pas etre vide')
        .max(50, 'Le nom ne peut pas depasser 50 caracteres')  
        .trim()
        .optional(),
        
    username: z.string()
        .min(3, 'Le nom d\'utilisateur doit faire au moins 3 caracteres')
        .max(30, 'Le nom d\'utilisateur ne peut pas depasser 30 caracteres')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, _ et -')
        .trim()
        .optional()
}).refine(data => Object.keys(data).length > 0, {
    message: 'Au moins un champ doit etre modifie'
});

// Schema de changement de mot de passe
export const changePasswordSchema = z.object({
    current_password: z.string()
        .min(1, 'Le mot de passe actuel est requis'),
        
    new_password: z.string()
        .min(8, 'Le nouveau mot de passe doit faire au moins 8 caracteres')
        .max(72, 'Le nouveau mot de passe ne peut pas depasser 72 caracteres')
        .regex(/(?=.*[a-z])/, 'Le nouveau mot de passe doit contenir au moins une minuscule')
        .regex(/(?=.*[A-Z])/, 'Le nouveau mot de passe doit contenir au moins une majuscule')
        .regex(/(?=.*\d)/, 'Le nouveau mot de passe doit contenir au moins un chiffre') 
        .regex(/(?=.*[@$!%*?&])/, 'Le nouveau mot de passe doit contenir au moins un caractere special (@$!%*?&)'),
        
    confirm_password: z.string()
}).refine(data => data.new_password === data.confirm_password, {
    message: 'La confirmation du mot de passe ne correspond pas',
    path: ['confirm_password']
});

// Schema de connexion (login)
export const loginSchema = z.object({
    email: z.string()
        .email('Email invalide')
        .toLowerCase()
        .trim(),
        
    password: z.string()
        .min(1, 'Le mot de passe est requis')
});

// Schema des parametres de route (/users/:id) - Reutilise common
export const userParamsSchema = idParamSchema;

// Schema de recherche d'utilisateurs - Reutilise common avec champs specifiques
export const userSearchSchema = z.object({
    email: z.string().email('Email invalide').optional(),
    username: z.string().min(1).optional(),
    role: z.string().min(1).optional() // Recherche par role
}).merge(searchQuerySchema).merge(paginationSchema);

// Types TypeScript
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type PatchProfileInput = z.infer<typeof patchProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UserParams = z.infer<typeof userParamsSchema>;
export type UserSearchQuery = z.infer<typeof userSearchSchema>;