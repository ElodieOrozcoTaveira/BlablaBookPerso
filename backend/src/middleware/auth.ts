// Middleware d'authentification avec sessions Redis
import { Request, Response, NextFunction } from 'express';
import { isAuthenticatedSession, SessionUser } from '../types/session';

export interface AuthenticatedRequest extends Request {
    user?: {
        id_user: number;
        email: string;
        username: string;
    };
}

// Middleware d'authentification avec sessions
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        // Vérifier si la session existe et est authentifiée
        if (!req.session || !isAuthenticatedSession(req.session)) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'No valid session found'
            });
        }

        // Mettre à jour l'activité de la session
        req.session.lastActivity = new Date();

        // Mapper les données session vers le format attendu par les controllers
        req.user = {
            id_user: req.session.userId,
            email: req.session.email,
            username: req.session.username
        };

        next();
    } catch (error) {
        console.error('Session authentication error:', error);
        res.status(500).json({
            error: 'Authentication check failed',
            message: 'Unable to verify session'
        });
    }
};

// Middleware pour les routes optionnellement authentifiées
export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.session && isAuthenticatedSession(req.session)) {
        req.session.lastActivity = new Date();
        req.user = {
            id_user: req.session.userId,
            email: req.session.email,
            username: req.session.username
        };
    }
    next();
};

