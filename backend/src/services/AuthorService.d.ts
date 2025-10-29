/**
 * SERVICE DES AUTEURS
 *
 * Contient toute la logique métier liée aux auteurs
 * Indépendant du protocole HTTP (réutilisable partout)
 */
export interface AuthorData {
    id: number;
    firstname?: string;
    lastname: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface CreateAuthorData {
    firstname?: string;
    lastname: string;
}
export interface UpdateAuthorData {
    firstname?: string;
    lastname?: string;
}
export interface AuthorSearchFilters {
    search?: string;
    limit?: number;
    offset?: number;
}
export declare class AuthorError extends Error {
    code: string;
    statusCode: number;
    constructor(message: string, code: string, statusCode?: number);
}
export declare class AuthorService {
    /**
     * Créer un nouvel auteur
     */
    static createAuthor(authorData: CreateAuthorData): Promise<AuthorData>;
    /**
     * Récupérer tous les auteurs avec filtres optionnels
     */
    static getAllAuthors(filters?: AuthorSearchFilters): Promise<{
        authors: AuthorData[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    /**
     * Récupérer un auteur par ID
     */
    static getAuthorById(authorId: number): Promise<AuthorData | null>;
    /**
     * Mettre à jour un auteur
     */
    static updateAuthor(authorId: number, updateData: UpdateAuthorData): Promise<AuthorData>;
    /**
     * Supprimer un auteur
     */
    static deleteAuthor(authorId: number): Promise<void>;
    /**
     * Rechercher des auteurs par nom
     */
    static searchAuthors(searchTerm: string, limit?: number): Promise<AuthorData[]>;
    /**
     * Statistiques des auteurs
     */
    static getAuthorStats(): Promise<{
        totalAuthors: number;
        authorsWithBooks: number;
        authorsWithoutBooks: number;
    }>;
}
//# sourceMappingURL=AuthorService.d.ts.map