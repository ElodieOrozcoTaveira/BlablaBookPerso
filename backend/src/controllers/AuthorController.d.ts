import type { Response } from "express";
import type { SessionRequest } from "../middlewares/sessionMiddleware.js";
/**
 * CONTRÔLEUR DES AUTEURS
 *
 * Gère les requêtes HTTP liées aux auteurs
 * Utilise AuthorService pour la logique métier
 */
export declare class AuthorController {
    /**
     * POST /api/authors
     * Créer un nouvel auteur
     */
    static createAuthor(req: SessionRequest, res: Response): Promise<void>;
    /**
     * GET /api/authors
     * Récupérer tous les auteurs avec filtres optionnels
     */
    static getAllAuthors(req: SessionRequest, res: Response): Promise<void>;
    /**
     * GET /api/authors/:id
     * Récupérer un auteur par ID
     */
    static getAuthorById(req: SessionRequest, res: Response): Promise<void>;
    /**
     * PUT /api/authors/:id
     * Mettre à jour un auteur
     */
    static updateAuthor(req: SessionRequest, res: Response): Promise<void>;
    /**
     * DELETE /api/authors/:id
     * Supprimer un auteur
     */
    static deleteAuthor(req: SessionRequest, res: Response): Promise<void>;
    /**
     * GET /api/authors/search
     * Rechercher des auteurs par nom
     */
    static searchAuthors(req: SessionRequest, res: Response): Promise<void>;
    /**
     * GET /api/authors/stats
     * Statistiques des auteurs
     */
    static getAuthorStats(req: SessionRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=AuthorController.d.ts.map