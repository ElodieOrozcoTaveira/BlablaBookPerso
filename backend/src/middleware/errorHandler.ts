import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

// Interface pour les erreurs personnalisees (avec status HTTP)
interface CustomError extends Error {
    status?: number;     // Status HTTP (ex: 404)
    statusCode?: number; // Alias pour status
}

// Middleware d'erreur global - DOIT etre en dernier dans app.js
export const errorHandler = (
    error: CustomError | ZodError | Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    // Log de l'erreur pour debug (tu peux utiliser winston plus tard)
    console.error('🚨 Erreur capturee:', error);

    // CAS 1: Erreur de validation Zod (donnees invalides)
    if (error instanceof ZodError) {
        return res.status(400).json({
            success: false,
            error: 'Donnees invalides',
            details: error.errors.map(err => ({
                field: err.path.join('.'), // Nom du champ (ex: "email")
                message: err.message       // Message d'erreur (ex: "Email invalide")
            }))
        });
    }

    // CAS 2: Erreur Sequelize (contraintes DB, validation model)
    if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Erreur de validation base de donnees',
            details: error.message // Detaille l'erreur Sequelize
        });
    }

    // CAS 3: Erreur avec status personnalise (404, 403, etc.)
    const status =
        (error as CustomError).status ||
        (error as CustomError).statusCode ||
        500; // Par defaut 500

    // SeCURITe: En production, on cache les details d'erreur
    const message =
        process.env.NODE_ENV === 'production'
            ? 'Erreur interne du serveur' // Message generique en prod
            : error.message; // Vrai message en dev

    // Reponse finale standardisee
    res.status(status).json({
        success: false,
        error: message
    });
};