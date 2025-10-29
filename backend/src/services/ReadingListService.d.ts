/**
 * SERVICE DES LISTES DE LECTURE
 *
 * Contient toute la logique métier liée aux listes de lecture thématiques
 * Indépendant du protocole HTTP (réutilisable partout)
 */
export interface ReadingListData {
    id: number;
    libraryId: number;
    userId: number;
    name: string;
    description?: string;
    genre?: string;
    statut: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
export interface CreateReadingListData {
    libraryId: number;
    userId: number;
    name: string;
    description?: string;
    genre?: string;
    statut?: boolean;
}
export interface UpdateReadingListData {
    name?: string;
    description?: string;
    genre?: string;
    statut?: boolean;
}
export interface ReadingListSearchFilters {
    userId?: number;
    libraryId?: number;
    genre?: string;
    statut?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
}
export declare class ReadingListError extends Error {
    code: string;
    statusCode: number;
    constructor(message: string, code: string, statusCode?: number);
}
export declare class ReadingListService {
    /**
     * Créer une nouvelle liste de lecture
     */
    static createReadingList(listData: CreateReadingListData): Promise<ReadingListData>;
    /**
     * Récupérer toutes les listes de lecture avec filtres optionnels
     */
    static getAllReadingLists(filters?: ReadingListSearchFilters): Promise<{
        readingLists: ReadingListData[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    /**
     * Récupérer une liste de lecture par ID
     */
    static getReadingListById(listId: number): Promise<ReadingListData | null>;
    /**
     * Récupérer les listes de lecture d'un utilisateur
     */
    static getUserReadingLists(userId: number, includeInactive?: boolean): Promise<ReadingListData[]>;
    /**
     * Mettre à jour une liste de lecture
     */
    static updateReadingList(listId: number, updateData: UpdateReadingListData): Promise<ReadingListData>;
    /**
     * Supprimer une liste de lecture (soft delete)
     */
    static deleteReadingList(listId: number): Promise<void>;
    /**
     * Rechercher des listes de lecture
     */
    static searchReadingLists(searchTerm: string, userId?: number, limit?: number): Promise<ReadingListData[]>;
    /**
     * Statistiques des listes de lecture
     */
    static getReadingListStats(): Promise<{
        totalLists: number;
        activeLists: number;
        inactiveLists: number;
        listsWithGenre: number;
        topGenres: {
            genre: string;
            count: number;
        }[];
    }>;
    /**
     * Vérifier si une liste de lecture existe
     */
    static readingListExists(listId: number): Promise<boolean>;
    /**
     * Activer/désactiver une liste de lecture
     */
    static toggleReadingListStatus(listId: number): Promise<ReadingListData>;
}
//# sourceMappingURL=ReadingListService.d.ts.map