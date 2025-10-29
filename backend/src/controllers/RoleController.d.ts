import type { Response } from "express";
import type { SessionRequest } from "../middlewares/sessionMiddleware.js";
/**
 * CONTRÔLEUR DES RÔLES
 *
 * Gère les requêtes HTTP liées aux rôles
 * Utilise RoleService pour la logique métier
 */
export declare class RoleController {
    /**
     * POST /api/roles
     * Créer un nouveau rôle
     */
    static createRole(req: SessionRequest, res: Response): Promise<void>;
    /**
     * GET /api/roles
     * Récupérer tous les rôles avec filtres optionnels
     */
    static getAllRoles(req: SessionRequest, res: Response): Promise<void>;
    /**
     * GET /api/roles/:id
     * Récupérer un rôle par ID
     */
    static getRoleById(req: SessionRequest, res: Response): Promise<void>;
    /**
     * GET /api/roles/name/:name
     * Récupérer un rôle par nom
     */
    static getRoleByName(req: SessionRequest, res: Response): Promise<void>;
    /**
     * PUT /api/roles/:id
     * Mettre à jour un rôle
     */
    static updateRole(req: SessionRequest, res: Response): Promise<void>;
    /**
     * DELETE /api/roles/:id
     * Supprimer un rôle
     */
    static deleteRole(req: SessionRequest, res: Response): Promise<void>;
    /**
     * GET /api/roles/search
     * Rechercher des rôles par nom ou description
     */
    static searchRoles(req: SessionRequest, res: Response): Promise<void>;
    /**
     * GET /api/roles/stats
     * Statistiques des rôles
     */
    static getRoleStats(req: SessionRequest, res: Response): Promise<void>;
    /**
     * GET /api/roles/default
     * Récupérer les rôles par défaut du système
     */
    static getDefaultRoles(req: SessionRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=RoleController.d.ts.map