/**
 * SERVICE DE GESTION DES BIBLIOTHÈQUES
 *
 * Contient toute la logique métier liée aux bibliothèques utilisateur
 * Indépendant du protocole HTTP (réutilisable partout)
 */
export interface LibraryCreate {
    name: string;
    id_user: number;
}
export interface LibraryUpdate {
    name?: string;
}
export interface LibraryData {
    id: number;
    name: string;
    id_user: number;
    created_at?: Date;
    updated_at?: Date;
}
export declare class LibraryError extends Error {
    code: string;
    statusCode: number;
    constructor(message: string, code: string, statusCode?: number);
}
export declare class LibraryService {
    /**
     * Création d'une nouvelle bibliothèque
     */
    static createLibrary(libraryData: LibraryCreate): Promise<LibraryData>;
    /**
     * Récupération des bibliothèques d'un utilisateur
     */
    static getUserLibraries(userId: number): Promise<LibraryData[]>;
    /**
     * Récupération d'une bibliothèque par ID
     */
    static getLibraryById(libraryId: number, userId: number): Promise<LibraryData | null>;
    /**
     * Mise à jour d'une bibliothèque
     */
    static updateLibrary(libraryId: number, userId: number, updateData: LibraryUpdate): Promise<LibraryData | null>;
    /**
     * Suppression d'une bibliothèque (soft delete)
     */
    static deleteLibrary(libraryId: number, userId: number): Promise<boolean>;
    /**
     * Recherche de bibliothèques par nom (pour un utilisateur)
     */
    static searchLibraries(userId: number, searchTerm: string): Promise<LibraryData[]>;
    /**
     * Statistiques des bibliothèques d'un utilisateur
     */
    static getUserLibraryStats(userId: number): Promise<{
        totalLibraries: number;
        recentLibraries: number;
    }>;
}
//# sourceMappingURL=LibraryService.d.ts.map