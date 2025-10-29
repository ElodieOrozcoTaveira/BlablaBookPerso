import type { Request, Response } from "express";
/**
 * CONTRÔLEUR DES AVIS
 *
 * Gère les requêtes HTTP liées aux avis des utilisateurs
 * Fait le lien entre les routes Express et le NoticeService
 */
export declare class NoticeController {
    /**
     * Créer un nouvel avis
     * POST /api/notices
     */
    static createNotice(req: Request, res: Response): Promise<void>;
    /**
     * Récupérer tous les avis avec filtres
     * GET /api/notices
     */
    static getAllNotices(req: Request, res: Response): Promise<void>;
    /**
     * Récupérer un avis par ID
     * GET /api/notices/:id
     */
    static getNoticeById(req: Request, res: Response): Promise<void>;
    /**
     * Mettre à jour un avis
     * PUT /api/notices/:id
     */
    static updateNotice(req: Request, res: Response): Promise<void>;
    /**
     * Supprimer un avis
     * DELETE /api/notices/:id
     */
    static deleteNotice(req: Request, res: Response): Promise<void>;
    /**
     * Rechercher des avis
     * GET /api/notices/search
     */
    static searchNotices(req: Request, res: Response): Promise<void>;
    /**
     * Récupérer les statistiques des avis
     * GET /api/notices/stats
     */
    static getNoticeStats(req: Request, res: Response): Promise<void>;
    /**
     * Récupérer les avis récents
     * GET /api/notices/recent
     */
    static getRecentNotices(req: Request, res: Response): Promise<void>;
    /**
     * Vérifier si un avis existe
     * GET /api/notices/:id/exists
     */
    static checkNoticeExists(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=NoticeController.d.ts.map