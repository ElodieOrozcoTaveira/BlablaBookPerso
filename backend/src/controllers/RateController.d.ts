import type { Request, Response } from "express";
/**
 * CONTRÔLEUR DES NOTES
 *
 * Gère les requêtes HTTP liées aux notes/évaluations
 * Fait le lien entre les routes Express et le RateService
 */
export declare class RateController {
    /**
     * Créer une nouvelle note
     * POST /api/rates
     */
    static createRate(req: Request, res: Response): Promise<void>;
    /**
     * Récupérer toutes les notes avec filtres
     * GET /api/rates
     */
    static getAllRates(req: Request, res: Response): Promise<void>;
    /**
     * Récupérer une note par ID
     * GET /api/rates/:id
     */
    static getRateById(req: Request, res: Response): Promise<void>;
    /**
     * Récupérer la note d'un utilisateur pour un livre
     * GET /api/rates/user/:userId/book/:bookId
     */
    static getUserRateForBook(req: Request, res: Response): Promise<void>;
    /**
     * Mettre à jour une note
     * PUT /api/rates/:id
     */
    static updateRate(req: Request, res: Response): Promise<void>;
    /**
     * Supprimer une note
     * DELETE /api/rates/:id
     */
    static deleteRate(req: Request, res: Response): Promise<void>;
    /**
     * Calculer la moyenne des notes pour un livre
     * GET /api/rates/book/:bookId/average
     */
    static getBookAverageRate(req: Request, res: Response): Promise<void>;
    /**
     * Récupérer les statistiques des notes
     * GET /api/rates/stats
     */
    static getRateStats(req: Request, res: Response): Promise<void>;
    /**
     * Récupérer les notes récentes
     * GET /api/rates/recent
     */
    static getRecentRates(req: Request, res: Response): Promise<void>;
    /**
     * Vérifier si une note existe
     * GET /api/rates/:id/exists
     */
    static checkRateExists(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=RateController.d.ts.map