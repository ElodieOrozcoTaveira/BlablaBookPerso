import type { Request, Response } from "express";
/**
 * CONTRÔLEUR DES GENRES
 *
 * Gère les requêtes HTTP liées aux genres
 * Fait le lien entre les routes Express et le GenreService
 */
export declare class GenreController {
    /**
     * Créer un nouveau genre
     * POST /api/genres
     */
    static createGenre(req: Request, res: Response): Promise<void>;
    /**
     * Récupérer tous les genres avec filtres
     * GET /api/genres
     */
    static getAllGenres(req: Request, res: Response): Promise<void>;
    /**
     * Récupérer un genre par ID
     * GET /api/genres/:id
     */
    static getGenreById(req: Request, res: Response): Promise<void>;
    /**
     * Récupérer un genre par nom
     * GET /api/genres/by-name/:name
     */
    static getGenreByName(req: Request, res: Response): Promise<void>;
    /**
     * Mettre à jour un genre
     * PUT /api/genres/:id
     */
    static updateGenre(req: Request, res: Response): Promise<void>;
    /**
     * Supprimer un genre
     * DELETE /api/genres/:id
     */
    static deleteGenre(req: Request, res: Response): Promise<void>;
    /**
     * Rechercher des genres
     * GET /api/genres/search
     */
    static searchGenres(req: Request, res: Response): Promise<void>;
    /**
     * Récupérer les statistiques des genres
     * GET /api/genres/stats
     */
    static getGenreStats(req: Request, res: Response): Promise<void>;
    /**
     * Récupérer les genres populaires
     * GET /api/genres/popular
     */
    static getPopularGenres(req: Request, res: Response): Promise<void>;
    /**
     * Récupérer les genres par ordre alphabétique
     * GET /api/genres/alphabetical
     */
    static getGenresAlphabetically(req: Request, res: Response): Promise<void>;
    /**
     * Vérifier si un genre existe
     * GET /api/genres/:id/exists
     */
    static checkGenreExists(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=GenreController.d.ts.map