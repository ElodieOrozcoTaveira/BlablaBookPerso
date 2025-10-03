// Middleware de gestion des sessions Redis
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { Request, Response, NextFunction } from 'express';
import redisClient from '../config/redis.js';
import { isAuthenticatedSession } from '../types/session.js';

// Configuration session s�curis�e avec Redis
export const sessionConfig: session.SessionOptions = {
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || 'the_book_of_eli',
    resave: false,
    saveUninitialized: false,
    rolling: true, // Renouvellement automatique du cookie a chaque requete
    name: 'blablabook.sid', // Nom custom pour masquer qu'on utilise express-session
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict' as const,
        maxAge: 4 * 60 * 60 * 1000, // 4h avec rolling
    }
};

/**
 * Middleware de session Express configure avec Redis
 */
export const sessionMiddleware = session(sessionConfig);

/**
 * Middleware d'initialisation de session
 * S'assure que Redis est connecte avant d'utiliser les sessions
 */
export const initializeSessionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!redisClient.isOpen) {
            console.log('= Connecting to Redis for session...');
            await redisClient.connect();
        }
        next();
    } catch (error) {
        console.error('L Session initialization failed:', error);
        res.status(500).json({
            error: 'Session service unavailable',
            message: 'Unable to initialize session store'
        });
    }
};

/**
 * Middleware de validation de session
 * Verifie que la session est valide et met a jour l'activite
 */
export const validateSession = (req: Request, res: Response, next: NextFunction) => {
    if (req.session && isAuthenticatedSession(req.session)) {
        // Mettre a jour l'activite
        req.session.lastActivity = new Date();

        // Log d'activite (optionnel)
        console.log(`[SESSION] User activity: ${req.session.email} - ${req.method} ${req.path}`);
    }
    
    next();
};

/**
 * Middleware de nettoyage de session
 * Nettoie les sessions expirees (appelees periodiquement)
 */
export const cleanupSessions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Cette fonctionnalite peut etre implementee plus tard si necessaire
        // Redis TTL s'occupe deja du nettoyage automatique
        next();
    } catch (error) {
        console.error('Session cleanup error:', error);
        next(); // Ne pas bloquer la requete pour un echec de nettoyage
    }
};

/**
 * Utilitaire pour detruire une session de maniere securisee
 */
export const destroySession = (req: Request): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    console.error('Session destruction error:', err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        } else {
            resolve();
        }
    });
};

/**
 * Utilitaire pour creer une session authentifiee
 */
export const createAuthenticatedSession = (req: Request, userData: {
    id_user: number;
    email: string;
    username: string;
}): void => {
    if (!req.session) {
        throw new Error('Session not initialized');
    }

    req.session.userId = userData.id_user;
    req.session.email = userData.email;
    req.session.username = userData.username;
    req.session.isAuthenticated = true;
    req.session.loginTime = new Date();
    req.session.lastActivity = new Date();

    console.log(`[SESSION] Created for user: ${userData.email} (ID: ${userData.id_user})`);
};

export default {
    sessionConfig,
    sessionMiddleware,
    initializeSessionMiddleware,
    validateSession,
    cleanupSessions,
    destroySession,
    createAuthenticatedSession
};