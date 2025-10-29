interface OpenLibraryBook {
    title: string;
    authors?: string[];
    isbn13?: string;
    isbn10?: string;
    publishYear?: number;
    pageCount?: number;
    subjects?: string[];
    coverUrl?: string;
    openLibraryId: string;
    description?: string;
}
declare class OpenLibraryService {
    private static baseUrl;
    /**
     * Recherche des livres sur OpenLibrary
     * @param query - Terme de recherche (titre, auteur, ISBN...)
     * @param limit - Nombre de résultats (défaut: 20)
     */
    static searchBooks(query: string, limit?: number): Promise<OpenLibraryBook[]>;
    /**
     * Récupère les détails d'un livre par son ID OpenLibrary
     * @param openLibraryId - ID du livre sur OpenLibrary (ex: "/works/OL82563W")
     */
    static getBookDetails(openLibraryId: string): Promise<OpenLibraryBook>;
    /**
     * Formate les données de recherche OpenLibrary
     */
    private static formatBookData;
    /**
     * Génère l'URL de couverture
     */
    private static getCoverUrl;
    /**
     * Recherche par ISBN spécifique
     */
    static searchByISBN(isbn: string): Promise<OpenLibraryBook | null>;
}
export { OpenLibraryService };
export type { OpenLibraryBook };
//# sourceMappingURL=OpenLibraryService.d.ts.map