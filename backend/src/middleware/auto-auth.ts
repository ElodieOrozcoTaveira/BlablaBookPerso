// Middleware d'autorisation automatique par convention de nommage
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express.js';
import { requirePermission } from './permission.js';
import { RESOURCE_PERMISSIONS } from '../config/permissions.js';

/**
 * Interface pour les métadonnées d'action
 */
interface ActionMetadata {
    method: string;
    resource: string;
    action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
    isOwnershipRequired?: boolean;
}

/**
 * Extraire les métadonnées d'une requête par convention
 */
function extractActionMetadata(req: any): ActionMetadata {
    // Extraire la ressource de l'URL (/api/authors -> authors)
    const pathSegments = req.route?.path.split('/').filter((segment: string) => segment !== '');
    const resource = pathSegments?.[0] || req.baseUrl.split('/').pop();
    
    // Mapper les méthodes HTTP vers les actions RBAC
    const actionMap = {
        'GET': 'READ' as const,
        'POST': 'CREATE' as const,
        'PUT': 'UPDATE' as const,
        'PATCH': 'UPDATE' as const,
        'DELETE': 'DELETE' as const
    };
    
    const action = actionMap[req.method as keyof typeof actionMap];
    
    return {
        method: req.method,
        resource,
        action,
        isOwnershipRequired: checkOwnershipRequirement(resource, action)
    };
}

/**
 * Vérifier si une action nécessite une vérification de propriété
 */
function checkOwnershipRequirement(resource: string, action: string): boolean {
    const config = RESOURCE_PERMISSIONS[resource as keyof typeof RESOURCE_PERMISSIONS] as any;
    return config?.ownershipRequired === true && ['UPDATE', 'DELETE'].includes(action);
}

/**
 * Construire le nom de permission par convention
 */
function buildPermissionName(resource: string, action: string): string {
    // Convertir en singulier et majuscule
    const singularResource = resource.replace(/s$/, '').toUpperCase();
    return `${action}_${singularResource}`;
}

/**
 * Middleware d'autorisation automatique par convention
 */
export function autoAuthorize() {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const metadata = extractActionMetadata(req);
            const config = RESOURCE_PERMISSIONS[metadata.resource as keyof typeof RESOURCE_PERMISSIONS];
            
            if (!config) {
                // Pas de configuration = pas de restriction
                return next();
            }
            
            // Vérifier si l'action est publique
            if (metadata.action === 'READ' && config.read === true) {
                return next();
            }
            
            // Vérifier l'authentification
            if (!req.user) {
                return res.status(401).json({
                    error: 'Authentication required',
                    resource: metadata.resource,
                    action: metadata.action
                });
            }
            
            // Construire et vérifier la permission
            const permissionName = buildPermissionName(metadata.resource, metadata.action);
            const configPermission = config[metadata.action.toLowerCase() as 'create' | 'update' | 'delete'];
            
            if (typeof configPermission === 'string') {
                // Utiliser la permission spécifique configurée (resource param supprimé)
                return requirePermission(configPermission)(req, res, next);
            } else if (configPermission === false) {
                // Action authentifiée mais sans permission spéciale requise
                return next();
            }
            
            // Par défaut, bloquer l'accès
            res.status(403).json({
                error: 'Access denied',
                resource: metadata.resource,
                action: metadata.action,
                message: `Action not configured for resource ${metadata.resource}`
            });
            
        } catch (error) {
            console.error('Auto authorization error:', error);
            res.status(500).json({
                error: 'Authorization check failed'
            });
        }
    };
}

/**
 * Middleware pour vérifier automatiquement la propriété
 */
export function autoOwnership() {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const metadata = extractActionMetadata(req);
        
        if (!metadata.isOwnershipRequired) {
            return next();
        }
        
        // Utiliser le middleware de propriété existant
        const { createOwnershipMiddleware } = await import('./route-metadata.js');
        return createOwnershipMiddleware(metadata.resource)(req, res, next);
    };
}

/**
 * Middleware combiné pour autorisation complète automatique
 */
export function fullAutoAuthorize() {
    return [
        autoAuthorize(),
        autoOwnership()
    ];
}

export { ActionMetadata, extractActionMetadata, buildPermissionName };
