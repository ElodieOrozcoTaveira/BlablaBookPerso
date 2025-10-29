import type { Response } from "express";
import type { SessionRequest } from "../middlewares/sessionMiddleware.js";
/**
 * CONTRÔLEUR POUR LA GESTION DES BIBLIOTHÈQUES
 *
 * Gère les requêtes HTTP liées aux bibliothèques utilisateur
 * Fait le lien entre les routes et les services
 */
export declare class LibraryController {
    /**
     * POST /api/libraries
     * Créer une nouvelle bibliothèque
     */
    static createLibrary(req: SessionRequest, res: Response): Promise<void>;
    /**
     * GET /api/libraries
     * Récupérer toutes les bibliothèques de l'utilisateur connecté
     */
    static getUserLibraries(req: SessionRequest, res: Response): Promise<void>;
    /**
     * GET /api/libraries/:id
     * Récupérer une bibliothèque spécifique par ID
     */
    static getLibraryById(req: SessionRequest, res: Response): Promise<void>;
    /**
     * PUT /api/libraries/:id
     * Mettre à jour une bibliothèque
     */
    static updateLibrary(req: SessionRequest, res: Response): Promise<void>;
    /**
     * DELETE /api/libraries/:id
     * Supprimer une bibliothèque (soft delete)
     */
    static deleteLibrary(req: SessionRequest, res: Response): Promise<void>;
    /**
     * GET /api/libraries/stats
     * Récupérer les statistiques des bibliothèques de l'utilisateur
     */
    static getLibraryStats(req: SessionRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=LibraryController.d.ts.map