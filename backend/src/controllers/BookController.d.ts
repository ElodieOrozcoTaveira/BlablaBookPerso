import type { Response } from "express";
import type { SessionRequest } from "../middlewares/sessionMiddleware.js";
/**
 * CONTRÔLEUR LIVRES
 *
 * Orchestre les requêtes HTTP pour les livres et l'intégration OpenLibrary
 */
export declare class BookController {
    /**
     * GET /api/books/search
     * Recherche de livres sur OpenLibrary
     */
    static searchOpenLibrary(req: SessionRequest, res: Response): Promise<void>;
    /**
     * GET /api/books/openlibrary/:path(.*)
     * Récupère les détails d'un livre OpenLibrary
     */
    static getOpenLibraryDetails(req: SessionRequest, res: Response): Promise<void>;
    /**
     * GET /api/books/isbn/:isbn
     * Recherche par ISBN
     */
    static searchByISBN(req: SessionRequest, res: Response): Promise<void>;
    /**
     * POST /api/books/save
     * Sauvegarde un livre d'OpenLibrary dans la bibliothèque utilisateur
     */
    static saveBookFromOpenLibrary(req: SessionRequest, res: Response): Promise<void>;
    /**
     * GET /api/books/library
     * Récupère tous les livres de la bibliothèque de l'utilisateur connecté
     */
    static getUserLibrary(req: SessionRequest, res: Response): Promise<void>;
    /**
     * PUT /api/books/status/:id
     * Met à jour le statut d'un livre dans la bibliothèque de l'utilisateur
     */
    static updateBookStatus(req: SessionRequest, res: Response): Promise<void>;
    /**
     * POST /api/books/library/add
     * Ajoute un livre OpenLibrary à la bibliothèque de l'utilisateur
     */
    static addBookToLibrary(req: SessionRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=BookController.d.ts.map