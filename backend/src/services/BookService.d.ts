import type { OpenLibraryBook } from "./OpenLibraryService.js";
/**
 * ERREUR PERSONNALISÉE POUR LES LIVRES
 */
export declare class BookError extends Error {
    statusCode: number;
    code: string;
    constructor(message: string, statusCode?: number, code?: string);
}
/**
 * SERVICE LIVRES - VERSION SIMPLIFIÉE
 *
 * Gère la sauvegarde des livres OpenLibrary dans la BDD locale
 */
export declare class BookService {
    /**
     * Sauvegarde un livre d'OpenLibrary dans la BDD locale
     */
    static saveFromOpenLibrary(userId: number, openLibraryBook: OpenLibraryBook, status?: "to_read" | "reading" | "read"): Promise<{
        id: unknown;
        title: unknown;
        isbn: unknown;
        summary: unknown;
        pages: unknown;
        publishedAt: unknown;
        image: unknown;
        cover_url: unknown;
        openLibraryData: OpenLibraryBook;
        libraryStatus: "to_read" | "reading" | "read";
        addedAt: string;
    }>;
    /**
     * Récupère les livres de la bibliothèque d'un utilisateur
     */
    static getUserLibrary(userId: number): Promise<{
        id: any;
        title: any;
        authors: string;
        cover_url: any;
        publication_year: number;
        isbn: any;
        description: any;
        open_library_key: string;
        read: boolean;
    }[]>;
}
//# sourceMappingURL=BookService.d.ts.map