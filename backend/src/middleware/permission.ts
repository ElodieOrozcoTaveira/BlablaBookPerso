// Middleware de permissions RBAC - Gestion des permissions utilisateur
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express.js';
import User from '../models/User.js';

/**
 * Interface pour les logs d'audit Zero Trust
 */
interface AuditLog {
    userId: number;
    email: string;
    action: string;
    resource?: string;
    resourceId?: string;
    granted: boolean;
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Logger d'audit Zero Trust avec format JSON structuré
 */
function logAudit(log: AuditLog): void {
    const auditData = {
        userId: log.userId,
        email: log.email,
        action: log.action,
        resource: log.resource || 'unknown',
        resourceId: log.resourceId,
        granted: log.granted,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        timestamp: log.timestamp.toISOString()
    };
    
    // Log d'audit toujours visible avec format JSON structuré
    console.log(JSON.stringify({
        timestamp: auditData.timestamp,
        level: 'AUDIT',
        action: `AUTHZ_${log.granted ? 'GRANTED' : 'DENIED'}`,
        pid: process.pid,
        userId: auditData.userId,
        email: auditData.email,
        resource: auditData.resource,
        resourceId: auditData.resourceId,
        granted: auditData.granted,
        ipAddress: auditData.ipAddress,
        userAgent: auditData.userAgent
    }));
    
    // Log console traditionnel pour développement
    if (process.env.NODE_ENV !== 'production') {
        const logMessage = `[AUTHZ] ${log.granted ? 'GRANTED' : 'DENIED'} - User: ${log.email}, Action: ${log.action}, Resource: ${log.resource || 'N/A'}${log.resourceId ? `:${log.resourceId}` : ''}`;
        console.log(logMessage);
    }
}

/**
 * Recupere les permissions d'un utilisateur via les methodes magiques Sequelize
 */
async function getUserPermissions(userId: number): Promise<string[]> {
    try {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[DEBUG] Getting permissions for user: ${userId}`);
        }
        
    // Permettre un override du modèle User en test (même pattern que Notices etc.)
    const UserModel: any = (globalThis as any).__TEST_MODEL_OVERRIDES?.User?.Model || User;
    const user = await UserModel.findByPk(userId);
        
        if (!user) {
            if (process.env.NODE_ENV !== 'production') {
                console.log(`[DEBUG] User ${userId} not found`);
            }
            return [];
        }

        // Utiliser les methodes magiques Sequelize (generees par belongsToMany)
        const userRoles = await (user as any).getRoles();
        
        if (!userRoles || userRoles.length === 0) {
            if (process.env.NODE_ENV !== 'production') {
                console.log(`[DEBUG] User ${userId} has no roles`);
            }
            return [];
        }

        // RRecuperer toutes les permissions de tous les roles
        const allPermissions = new Set<string>();
        
        for (const role of userRoles) {
            const rolePermissions = await (role as any).getPermissions();
            
            if (rolePermissions) {
                for (const permission of rolePermissions) {
                    allPermissions.add(permission.label);
                }
            }
        }

        const permissions = Array.from(allPermissions).sort();
        console.log(`[DEBUG] User ${userId} permissions:`, permissions);
        
        return permissions;
        
    } catch (error) {
        console.error('Error fetching user permissions:', error);
        return [];
    }
}

/**
 * Middleware de verification des permissions RBAC avec audit Zero Trust
 */
export function requirePermission(requiredPermissions: string | string[]) {
    // Normalise en tableau
    const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            // Bypass total pour tests unitaires cibles (eviter setup session / rôles)
            if (process.env.TEST_PERM_BYPASS === '1') {
                return next();
            }
            // 1. VVerification d'authentification
            if (!req.session?.isAuthenticated || !req.session?.userId) {
                logAudit({
                    userId: 0,
                    email: 'anonymous',
                    action: permissions.join(','),
                    granted: false,
                    timestamp: new Date()
                });
                
                return res.status(401).json({ 
                    error: 'Authentication required',
                    required_permissions: permissions 
                });
            }

            const userId = req.session.userId;
            const userEmail = req.session.email || 'unknown';

            // 2. Recuperation des permissions utilisateur
            const userPermissions = await getUserPermissions(userId);
            
            // 3. Verification des permissions (mode AND - toutes requises)
            const hasAllPermissions = permissions.every(permission => 
                userPermissions.includes(permission)
            );

            // 4. Log d'audit Zero Trust
            logAudit({
                userId,
                email: userEmail,
                action: permissions.join(','),
                resource: req.route?.path,
                resourceId: req.params?.id,
                granted: hasAllPermissions,
                timestamp: new Date(),
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });

            // 5. Autorisation ou refus
            if (hasAllPermissions) {
                // Ajouter les permissions à la requete pour usage ulterieur
                req.userPermissions = userPermissions;
                next();
            } else {
                return res.status(403).json({
                    error: 'Insufficient permissions',
                    required: permissions,
                    granted: userPermissions,
                    message: `Cette action nécessite les permissions: ${permissions.join(', ')}`
                });
            }

        } catch (error) {
            console.error('[AUTHZ] Permission check failed:', error);
            
            logAudit({
                userId: req.session?.userId || 0,
                email: req.session?.email || 'unknown',
                action: permissions.join(','),
                granted: false,
                timestamp: new Date()
            });
            
            return res.status(500).json({
                error: 'Permission check failed',
                message: 'Erreur interne lors de la vérification des permissions'
            });
        }
    };
}

// Middleware d'exemple pour differents niveaux d'acces
export const requireAdmin = requirePermission('ADMIN');
export const requireModerator = requirePermission(['MODERATE']);
export const requireUserManagement = requirePermission('ADMIN_USERS');
export const requireContentManagement = requirePermission(['CREATE', 'UPDATE', 'DELETE']);
