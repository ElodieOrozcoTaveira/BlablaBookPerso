// Middleware d'autorisation Zero Trust - Phase 2 : Que peux-tu faire ?
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';

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
    
    // TODO: Intégrer avec Winston ou un système de logs centralisé
    // winston.info(logMessage, { audit: true, ...log });
}

/**
 * Récupère les permissions d'un utilisateur (sera adapté avec sessions Redis)
 */
async function getUserPermissions(userId: number): Promise<string[]> {
    try {
        // TODO: Implémenter avec notre système USER/ROLE/PERMISSION
        console.log(`[DEBUG] Getting permissions for user: ${userId}`);
        
        // Simulation temporaire - retourner des permissions de base
        return ['READ', 'CREATE', 'UPDATE']; // Permissions de test
        
    } catch (error) {
        console.error('Error fetching user permissions:', error);
        return [];
    }
}

/**
 * Middleware d'autorisation Zero Trust
 * Vérifie si l'utilisateur authentifié a la permission pour l'action demandée
 */
export function requirePermission(requiredPermission: string, resource?: string) {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            // Phase 1 : Vérifier que l'utilisateur est authentifié
            if (!req.user) {
                return res.status(401).json({
                    error: 'Authentication required',
                    message: 'No authenticated user found'
                });
            }

            // Phase 2 : Récupérer les permissions de l'utilisateur
            const userPermissions = await getUserPermissions(req.user.id_user);

            // Phase 3 : Vérifier la permission spécifique
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

            // Phase 5 : Décision d'autorisation
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