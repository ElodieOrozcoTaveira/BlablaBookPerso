import type { Response } from "express";
import type { SessionRequest } from "../middlewares/sessionMiddleware.js";
/**
 * CONTRÔLEUR UTILISATEUR
 *
 * Orchestre les requêtes HTTP et délègue la logique métier au service
 */
export declare class UserController {
    /**
     * GET /api/users
     * Récupère tous les utilisateurs (avec pagination)
     */
    static getAllUsers(req: SessionRequest, res: Response): Promise<void>;
    /**
     * GET /api/users/:id
     * Récupère un utilisateur par son ID
     */
    static getUserById(req: SessionRequest, res: Response): Promise<void>;
    /**
     * PUT /api/users/profile
     * Met à jour le profil de l'utilisateur connecté
     */
    static updateProfile(req: SessionRequest, res: Response): Promise<void>;
    /**
     * DELETE /api/users/:id
     * Supprime un utilisateur (admin seulement)
     */
    static deleteUser(req: SessionRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=UserController.d.ts.map