/**
 * SERVICE DES GENRES
 *
 * Contient toute la logique métier liée aux genres
 * Indépendant du protocole HTTP (réutilisable partout)
 */
export interface GenreData {
    id: number;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface CreateGenreData {
    name: string;
}
export interface UpdateGenreData {
    name?: string;
}
export interface GenreSearchFilters {
    search?: string;
    limit?: number;
    offset?: number;
}
export declare class GenreError extends Error {
    code: string;
    statusCode: number;
    constructor(message: string, code: string, statusCode?: number);
}
export declare class GenreService {
    /**
     * Créer un nouveau genre
     */
    static createGenre(genreData: CreateGenreData): Promise<GenreData>;
    /**
     * Récupérer tous les genres avec filtres optionnels
     */
    static getAllGenres(filters?: GenreSearchFilters): Promise<{
        genres: GenreData[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    /**
     * Récupérer un genre par ID
     */
    static getGenreById(genreId: number): Promise<GenreData | null>;
    /**
     * Récupérer un genre par nom
     */
    static getGenreByName(genreName: string): Promise<GenreData | null>;
    /**
     * Mettre à jour un genre
     */
    static updateGenre(genreId: number, updateData: UpdateGenreData): Promise<GenreData>;
    /**
     * Supprimer un genre
     */
    static deleteGenre(genreId: number): Promise<void>;
    /**
     * Rechercher des genres par nom
     */
    static searchGenres(searchTerm: string, limit?: number): Promise<GenreData[]>;
    /**
     * Statistiques des genres
     */
    static getGenreStats(): Promise<{
        totalGenres: number;
        genresWithBooks: number;
        genresWithoutBooks: number;
        popularGenres: GenreData[];
    }>;
    /**
     * Vérifier si un genre existe
     */
    static genreExists(genreId: number): Promise<boolean>;
    /**
     * Récupérer les genres les plus populaires
     */
    static getPopularGenres(limit?: number): Promise<GenreData[]>;
    /**
     * Récupérer les genres par ordre alphabétique
     */
    static getGenresAlphabetically(): Promise<GenreData[]>;
}
//# sourceMappingURL=GenreService.d.ts.map