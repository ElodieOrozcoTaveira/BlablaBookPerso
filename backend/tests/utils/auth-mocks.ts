import { vi } from 'vitest';

import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../src/types/express.js';

/**
 * Mock du middleware authenticateToken pour les tests
 */
export const mockAuthenticateToken = (userId: number = 1, email: string = 'test@example.com', username: string = 'testuser') => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Simuler une session authentifiee
        if (!req.session) {
            req.session = {} as any;
        }
        
        req.session.userId = userId;
        req.session.email = email;
        req.session.username = username;

        // Ajouter les infos utilisateur a la requête
        (req as AuthenticatedRequest).user = {
            id_user: userId,
            email: email,
            username: username
        };

        next();
    };
};

/**
 * Mock du middleware authenticateToken qui simule un echec d'authentification
 */
export const mockAuthenticateTokenFailure = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        res.status(401).json({
            error: 'Authentication required',
            message: 'Vous devez être connecte pour acceder a cette ressource'
        });
    };
};

/**
 * Mock du middleware requirePermission pour les tests
 */
export const mockRequirePermission = (shouldPass: boolean = true) => {
    return (permission: string, resource?: string) => {
        return (req: Request, res: Response, next: NextFunction) => {
            if (shouldPass) {
                next();
            } else {
                res.status(403).json({
                    error: 'Insufficient permissions',
                    message: `Permission requise: ${permission}${resource ? ` pour ${resource}` : ''}`
                });
            }
        };
    };
};

/**
 * Mock du middleware requirePermission qui simule un echec d'autorisation
 */
export const mockRequirePermissionFailure = () => {
    return (permission: string, resource?: string) => {
        return (req: Request, res: Response, next: NextFunction) => {
            res.status(403).json({
                error: 'Insufficient permissions',
                message: `Permission requise: ${permission}${resource ? ` pour ${resource}` : ''}`
            });
        };
    };
};

/**
 * Utilitaire pour mocker une session utilisateur
 */
export const mockUserSession = (userId: number = 1, email: string = 'test@example.com', username: string = 'testuser') => {
    return {
        userId: userId,
        email: email,
        username: username,
    save: vi.fn().mockResolvedValue(undefined),
    destroy: vi.fn().mockResolvedValue(undefined),
    reload: vi.fn().mockResolvedValue(undefined),
    touch: vi.fn().mockResolvedValue(undefined),
    regenerate: vi.fn().mockImplementation((callback: any) => callback()),
        id: 'test-session-id',
        cookie: {
            maxAge: null,
            secure: false,
            httpOnly: true,
            path: '/',
            domain: null,
            expires: null,
            sameSite: false,
            originalMaxAge: null
        }
    };
};

export default {
    mockAuthenticateToken,
    mockAuthenticateTokenFailure,
    mockRequirePermission,
    mockRequirePermissionFailure,
    mockUserSession
};
