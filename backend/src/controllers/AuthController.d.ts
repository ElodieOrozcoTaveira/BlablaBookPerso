import type { Response } from "express";
import type { SessionRequest } from "../middlewares/sessionMiddleware.js";
/**
 * 🎮 CONTRÔLEUR D'AUTHENTIFICATION - Cookie Sessions
 *
 * Orchestre les requêtes HTTP et délègue la logique métier au service
 */
export declare class AuthController {
    /**
     * POST /api/auth/register
     * Inscription d'un nouvel utilisateur
     */
    static register(req: SessionRequest, res: Response): Promise<void>;
    /**
     * POST /api/auth/login
     * Connexion d'un utilisateur existant
     */
    static login(req: SessionRequest, res: Response): Promise<void>;
    /**
     * POST /api/auth/logout
     * Déconnexion de l'utilisateur
     */
    static logout(req: SessionRequest, res: Response): Promise<void>;
    /**
     * GET /api/auth/me
     * Récupérer le profil de l'utilisateur connecté
     */
    static getProfile(req: SessionRequest, res: Response): Promise<void>;
    /**
     * GET /api/auth/check-session
     * Vérifier si la session est valide
     */
    static checkSession(req: SessionRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=AuthController.d.ts.map