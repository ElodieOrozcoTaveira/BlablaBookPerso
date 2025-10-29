import type { Request, Response } from "express";
/**
 * CONTRÔLEUR DES PERMISSIONS
 *
 * Gère les requêtes HTTP liées aux permissions du système
 * Fait le lien entre les routes Express et le PermissionService
 */
export declare class PermissionController {
    /**
     * Créer une nouvelle permission
     * POST /api/permissions
     */
    static createPermission(req: Request, res: Response): Promise<void>;
    /**
     * Récupérer toutes les permissions avec filtres
     * GET /api/permissions
     */
    static getAllPermissions(req: Request, res: Response): Promise<void>;
    /**
     * Récupérer une permission par ID
     * GET /api/permissions/:id
     */
    static getPermissionById(req: Request, res: Response): Promise<void>;
    /**
     * Récupérer une permission par libellé
     * GET /api/permissions/by-label/:label
     */
    static getPermissionByLabel(req: Request, res: Response): Promise<void>;
    /**
     * Mettre à jour une permission
     * PUT /api/permissions/:id
     */
    static updatePermission(req: Request, res: Response): Promise<void>;
    /**
     * Supprimer une permission
     * DELETE /api/permissions/:id
     */
    static deletePermission(req: Request, res: Response): Promise<void>;
    /**
     * Rechercher des permissions
     * GET /api/permissions/search
     */
    static searchPermissions(req: Request, res: Response): Promise<void>;
    /**
     * Récupérer les statistiques des permissions
     * GET /api/permissions/stats
     */
    static getPermissionStats(req: Request, res: Response): Promise<void>;
    /**
     * Récupérer les permissions par ordre alphabétique
     * GET /api/permissions/alphabetical
     */
    static getPermissionsAlphabetically(req: Request, res: Response): Promise<void>;
    /**
     * Récupérer les permissions par catégorie d'action
     * GET /api/permissions/by-category/:category
     */
    static getPermissionsByActionCategory(req: Request, res: Response): Promise<void>;
    /**
     * Vérifier si une permission existe
     * GET /api/permissions/:id/exists
     */
    static checkPermissionExists(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=PermissionController.d.ts.map