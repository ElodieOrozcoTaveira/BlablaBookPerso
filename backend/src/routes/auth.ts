import { Router } from 'express';
import { Request, Response } from 'express';
import argon2 from 'argon2';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { isAuthenticatedSession } from '../types/session.js';
import { TypedRequest } from '../types/express.js';
import { createAuthenticatedSession, destroySession } from '../middleware/session.js';

const router = Router();

console.log('🔐 Auth routes module loaded successfully!');

// Rate limiting spécifique pour les tentatives de login
const loginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives max
    message: {
        error: 'Too many login attempts',
        message: 'Please try again in 15 minutes',
        retryAfter: 15 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Types pour les requêtes
interface LoginRequest {
    email: string;
    password: string;
}

// POST /api/auth/login
router.post('/login', loginRateLimit, async (req: TypedRequest<LoginRequest>, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validation basique
        if (!email || !password) {
            return res.status(400).json({
                error: 'Missing credentials',
                message: 'Email and password are required'
            });
        }

        // Chercher l'utilisateur
        const user = await User.findOne({ 
            where: { email: email.toLowerCase() }
        });

        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Email or password incorrect'
            });
        }

        // Vérifier le mot de passe
        const validPassword = await argon2.verify(user.password, password);
        
        if (!validPassword) {
            return res.status(401).json({
                error: 'Invalid credentials', 
                message: 'Email or password incorrect'
            });
        }

        // S'assurer que la session existe
        if (!req.session) {
            return res.status(500).json({
                error: 'Session error',
                message: 'Unable to create session'
            });
        }

        // Créer nouvelle session via utilitaire
        createAuthenticatedSession(req, {
            id_user: user.id_user,
            email: user.email,
            username: user.username
        });

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id_user,
                email: user.email,
                username: user.username
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Login failed',
            message: 'Unable to process login request'
        });
    }
});

// POST /api/auth/logout
router.post('/logout', async (req: Request, res: Response) => {
    try {
        const userEmail = req.session?.email;
        
        await destroySession(req);
        res.clearCookie('blablabook.sid');
        
        if (userEmail) {
            console.log(`[AUTH] User logged out: ${userEmail}`);
        }
        
        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            error: 'Logout failed',
            message: 'Unable to process logout request'
        });
    }
});

// GET /api/auth/me
router.get('/me', (req: Request, res: Response) => {
    try {
        if (req.session && isAuthenticatedSession(req.session)) {
            // Mettre à jour l'activité
            req.session.lastActivity = new Date();
            
            res.json({
                success: true,
                authenticated: true,
                user: {
                    id: req.session.userId,
                    email: req.session.email,
                    username: req.session.username
                },
                session: {
                    loginTime: req.session.loginTime,
                    lastActivity: req.session.lastActivity
                }
            });
        } else {
            res.json({
                success: true,
                authenticated: false,
                user: null
            });
        }
    } catch (error) {
        console.error('Session check error:', error);
        res.status(500).json({
            error: 'Session check failed',
            message: 'Unable to verify session status'
        });
    }
});


export default router;