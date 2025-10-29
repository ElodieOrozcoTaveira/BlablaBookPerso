import type { Request, Response } from "express";
/**
 * CONTRÔLEUR DES LISTES DE LECTURE
 *
 * Gère les requêtes HTTP liées aux listes de lecture thématiques
 * Fait le lien entre les routes Express et le ReadingListService
 */
export declare class ReadingListController {
    /**
     * Créer une nouvelle liste de lecture
     * POST /api/reading-lists
     */
    static createReadingList(req: Request, res: Response): Promise<void>;
    /**
     * Récupérer toutes les listes de lecture avec filtres
     * GET /api/reading-lists
     */
    static getAllReadingLists(req: Request, res: Response): Promise<void>;
    /**
     * Récupérer une liste de lecture par ID
     * GET /api/reading-lists/:id
     */
    static getReadingListById(req: Request, res: Response): Promise<void>;
    /**
     * Récupérer les listes de lecture d'un utilisateur
     * GET /api/reading-lists/user/:userId
     */
    static getUserReadingLists(req: Request, res: Response): Promise<void>;
    /**
     * Mettre à jour une liste de lecture
     * PUT /api/reading-lists/:id
     */
    static updateReadingList(req: Request, res: Response): Promise<void>;
    /**
     * Supprimer une liste de lecture
     * DELETE /api/reading-lists/:id
     */
    static deleteReadingList(req: Request, res: Response): Promise<void>;
    /**
     * Rechercher des listes de lecture
     * GET /api/reading-lists/search
     */
    static searchReadingLists(req: Request, res: Response): Promise<void>;
    /**
     * Récupérer les statistiques des listes de lecture
     * GET /api/reading-lists/stats
     */
    static getReadingListStats(req: Request, res: Response): Promise<void>;
    /**
     * Activer/désactiver une liste de lecture
     * PATCH /api/reading-lists/:id/toggle
     */
    static toggleReadingListStatus(req: Request, res: Response): Promise<void>;
    /**
     * Vérifier si une liste de lecture existe
     * GET /api/reading-lists/:id/exists
     */
    static checkReadingListExists(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=ReadingListController.d.ts.map