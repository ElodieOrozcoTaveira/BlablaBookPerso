import { Response, NextFunction } from 'express';
import { TypedRequest, AuthenticatedRequest } from '../types/express.js';

// Import des types de session pour TypeScript
import '../types/session.js';

// Middleware pour les routes protégées
export const authenticateToken = (
    req: TypedRequest,
    res: Response,
    next: NextFunction
): void => {
    console.log('🚨 MIDDLEWARE AUTH APPELÉ - URL:', req.url, 'METHOD:', req.method);
    console.log('🔐 Vérification de la session...');
    console.log('Session ID:', req.sessionID);
    console.log('Session data:', req.session);
    
    if (!req.session.userId) {
        console.log('❌ Pas de session utilisateur active');
        res.status(401).json({ 
            success: false,
            error: 'Authentication required',
            message: 'Utilisateur non authentifie'
        });
        return;
    }

    // Enrichir la requête avec les informations utilisateur
    (req as AuthenticatedRequest).user = {
        id_user: req.session.userId,
        email: req.session.email || '',
        username: req.session.username || ''
    };

    console.log('✅ Utilisateur authentifié:', {
        id: req.session.userId,
        email: req.session.email,
        username: req.session.username
    });

    next();
};
