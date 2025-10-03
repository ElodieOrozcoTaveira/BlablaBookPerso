// Middleware de permissions RBAC - Gestion des permissions utilisateur
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express.js';
import User from '../models/User.js';
import Role from '../models/Role.js';
import Permission from '../models/Permission.js';

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
 * Logger d'audit Zero Trust
 */
function logAudit(log: AuditLog): void {
    const logMessage = `[AUTHZ] ${log.granted ? 'GRANTED' : 'DENIED'} - User: ${log.email}, Action: ${log.action}, Resource: ${log.resource || 'N/A'}${log.resourceId ? `:${log.resourceId}` : ''}`;
    console.log(logMessage);
}

/**
 * Recupere les permissions d'un utilisateur via les associations Role/Permission
 */
async function getUserPermissions(userId: number): Promise<string[]> {
    try {
        console.log(`[DEBUG] Getting permissions for user: ${userId}`);
        
        // Récupérer l'utilisateur avec ses rôles et permissions
        const user = await User.findByPk(userId, {
            include: [{
                model: Role,
                as: 'Roles',
                include: [{
                    model: Permission,
                    as: 'Permissions',
                    attributes: ['label']
                }]
            }]
        });

        if (!user) {
            console.log(`[DEBUG] User ${userId} not found`);
            return [];
        }

        // Extraire toutes les permissions uniques des rôles
        const permissions = new Set<string>();
        
        if (user.Roles) {
            for (const role of user.Roles) {
                if (role.Permissions) {
                    for (const permission of role.Permissions) {
                        permissions.add(permission.label);
                    }
                }
            }
        }

        const permissionArray = Array.from(permissions);
        console.log(`[DEBUG] User ${userId} permissions:`, permissionArray);
        
        return permissionArray;
        
    } catch (error) {
        console.error('Error fetching user permissions:', error);
        return [];
    }
}

/**
 * Middleware d'autorisation Zero Trust
 * Verifie si l'utilisateur authentifie a la permission pour l'action demandee
 */
export function requirePermission(requiredPermission: string, resource?: string) {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            // Phase 1 : Verifier que l'utilisateur est authentifie
            if (!req.user) {
                return res.status(401).json({
                    error: 'Authentication required',
                    message: 'No authenticated user found'
                });
            }

            // Phase 2 : Recuperer les permissions de l'utilisateur
            const userPermissions = await getUserPermissions(req.user.id_user);

            // Phase 3 : Verifier la permission specifique
            const hasPermission = userPermissions.includes(requiredPermission) || 
                                userPermissions.includes('ADMIN'); // Super admin bypass

            // Phase 4 : Log d'audit Zero Trust
            const auditLog: AuditLog = {
                userId: req.user.id_user,
                email: req.user.email,
                action: requiredPermission,
                resource,
                resourceId: req.params.id,
                granted: hasPermission,
                timestamp: new Date(),
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            };
            logAudit(auditLog);

            // Phase 5 : Decision d'autorisation
            if (hasPermission) {
                next();
            } else {
                res.status(403).json({
                    error: 'Insufficient permissions',
                    message: `Permission '${requiredPermission}' required for this action`,
                    required: requiredPermission,
                    resource
                });
            }

        } catch (error) {
            console.error('Authorization error:', error);
            res.status(500).json({
                error: 'Authorization check failed',
                message: 'Unable to verify permissions'
            });
        }
    };
}

export { AuditLog, logAudit };