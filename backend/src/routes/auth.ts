import { Router } from 'express';
import { Request, Response } from 'express';
import argon2 from 'argon2';
import rateLimit from 'express-rate-limit';
import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';
import User from '../models/User.js';
import Role from '../models/Role.js';
import Permission from '../models/Permission.js';
import { isAuthenticatedSession } from '../types/session.js';
import { TypedRequest, AuthenticatedRequest } from '../types/express.js';
import { createAuthenticatedSession, destroySession } from '../middleware/session.js';
import { requirePermission, requireAdmin, requireUserManagement } from '../middleware/permission.js';

const router = Router();

console.log('🔐 Auth routes module loaded successfully!');

// Rate limiting spécifique pour les tentatives de login
const loginRateLimit = rateLimit({
    windowMs: process.env.NODE_ENV === 'test' ? 1 * 60 * 1000 : 15 * 60 * 1000, // 1 min en test, 15 min en prod
    max: process.env.NODE_ENV === 'test' ? 1000 : 5, // 1000 tentatives en test, 5 en prod
    message: {
        error: 'Too many login attempts',
        message: process.env.NODE_ENV === 'test' ? 'Please try again in 1 minute' : 'Please try again in 15 minutes',
        retryAfter: process.env.NODE_ENV === 'test' ? 1 * 60 : 15 * 60
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

// DEBUG endpoint temporaire pour tester les associations Sequelize
router.get('/debug/permissions', async (req: Request, res: Response) => {
    try {
        if (!req.session?.isAuthenticated || !req.session?.userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const userId = req.session.userId;
        console.log(`[DEBUG] Testing Sequelize associations for user: ${userId}`);
        
        const user = await User.findByPk(userId);
        
        if (user) {
            // Étape 1: Récupérer les rôles
            const userRoles = await (user as any).getRoles();
            console.log(`[DEBUG] User roles:`, userRoles?.length);
            
            // Étape 2: Pour chaque rôle, récupérer ses permissions
            const rolesWithPermissions = [];
            
            for (const role of userRoles || []) {
                console.log(`[DEBUG] Getting permissions for role: ${role.name}`);
                const rolePermissions = await (role as any).getPermissions();
                console.log(`[DEBUG] Role ${role.name} has ${rolePermissions?.length} permissions`);
                
                rolesWithPermissions.push({
                    id: role.id_role,
                    name: role.name,
                    permissionsCount: rolePermissions?.length || 0,
                    permissions: rolePermissions?.map((p: any) => p.label) || []
                });
            }

            const result = {
                userId,
                username: user.username,
                rolesCount: userRoles?.length || 0,
                roles: rolesWithPermissions
            };

            res.json({
                success: true,
                debug: result
            });
        } else {
            res.json({ success: false, error: 'User not found' });
        }
        
    } catch (error) {
        console.error('Debug permissions error:', error);
        res.status(500).json({ 
            error: 'Debug failed', 
            details: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
});

// Routes de test des permissions - à supprimer en production
router.get('/test/admin', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    res.json({
        success: true,
        message: 'Accès admin autorisé !',
        user: req.session?.email,
        permissions: req.userPermissions
    });
});

router.get('/test/user-management', requireUserManagement, (req: AuthenticatedRequest, res: Response) => {
    res.json({
        success: true,
        message: 'Accès gestion utilisateurs autorisé !',
        user: req.session?.email,
        permissions: req.userPermissions
    });
});

router.get('/test/multiple-permissions', requirePermission(['CREATE', 'UPDATE']), (req: AuthenticatedRequest, res: Response) => {
    res.json({
        success: true,
        message: 'Accès CREATE et UPDATE autorisé !',
        user: req.session?.email,
        permissions: req.userPermissions
    });
});

export default router;