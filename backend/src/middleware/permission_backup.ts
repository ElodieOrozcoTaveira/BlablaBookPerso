// Middleware de permissions RBAC - Gestion des permissions utilisateur
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express.js';
import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';
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
 * Récupère les permissions d'un utilisateur via les méthodes magiques Sequelize
 */
async function getUserPermissions(userId: number): Promise<string[]> {
    try {
        console.log(`[DEBUG] Getting permissions for user: ${userId}`);
        
        // Récupérer l'utilisateur
        const user = await User.findByPk(userId);
        if (!user) {
            console.log(`[DEBUG] User not found: ${userId}`);
            return [];
        }
        
        // Utiliser les méthodes magiques de Sequelize générées par belongsToMany
        const roles = await (user as any).getRoles();
        console.log(`[DEBUG] User roles:`, roles?.map((r: any) => r.name));
        
        // Récupérer toutes les permissions de tous les rôles
        const allPermissions: string[] = [];
        
        for (const role of roles || []) {
            const permissions = await (role as any).getPermissions();
            const permissionLabels = permissions?.map((p: any) => p.label) || [];
            allPermissions.push(...permissionLabels);
        }
        
        // Dédupliquer les permissions (un utilisateur peut avoir plusieurs rôles avec permissions communes)
        const uniquePermissions = [...new Set(allPermissions)];
        
        console.log(`[DEBUG] User permissions:`, uniquePermissions);
        return uniquePermissions;
        const results = await sequelize.query(`
            SELECT DISTINCT "Permission"."label"
            FROM "USER" AS "User"
            INNER JOIN "USER_ROLE" AS "UserRole" ON "User"."id_user" = "UserRole"."id_user"
            INNER JOIN "ROLE" AS "Role" ON "UserRole"."id_role" = "Role"."id_role"
            INNER JOIN "ROLE_PERMISSION" AS "RolePermission" ON "Role"."id_role" = "RolePermission"."id_role"
            INNER JOIN "PERMISSION" AS "Permission" ON "RolePermission"."id_permission" = "Permission"."id_permission"
            WHERE "User"."deleted_at" IS NULL AND "User"."id_user" = :userId
            ORDER BY "Permission"."label"
        `, {
            replacements: { userId },
            type: QueryTypes.SELECT
        });

        const permissions = (results as any[]).map(row => row.label);
        console.log(`[DEBUG] User ${userId} permissions:`, permissions);
        
        return permissions;
        
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