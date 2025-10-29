/**
 * SERVICE DES NOTES
 *
 * Contient toute la logique métier liée aux notes/évaluations
 * Système de notation de 1 à 5 étoiles
 * Indépendant du protocole HTTP (réutilisable partout)
 */
export interface RateData {
    id: number;
    userId?: number;
    bookId?: number;
    readingListId?: number;
    rate: number;
    publishedAt?: Date;
    updatedAt?: Date;
}
export interface CreateRateData {
    userId: number;
    bookId: number;
    readingListId?: number;
    rate: number;
}
export interface UpdateRateData {
    rate?: number;
}
export interface RateSearchFilters {
    userId?: number;
    bookId?: number;
    readingListId?: number;
    minRate?: number;
    maxRate?: number;
    limit?: number;
    offset?: number;
}
export declare class RateError extends Error {
    code: string;
    statusCode: number;
    constructor(message: string, code: string, statusCode?: number);
}
export declare class RateService {
    /**
     * Créer une nouvelle note
     */
    static createRate(rateData: CreateRateData): Promise<RateData>;
    /**
     * Récupérer toutes les notes avec filtres optionnels
     */
    static getAllRates(filters?: RateSearchFilters): Promise<{
        rates: RateData[];
        total: number;
        page: number;
        totalPages: number;
        averageRate?: number;
    }>;
    /**
     * Récupérer une note par ID
     */
    static getRateById(rateId: number): Promise<RateData | null>;
    /**
     * Récupérer la note d'un utilisateur pour un livre
     */
    static getUserRateForBook(userId: number, bookId: number): Promise<RateData | null>;
    /**
     * Mettre à jour une note
     */
    static updateRate(rateId: number, updateData: UpdateRateData): Promise<RateData>;
    /**
     * Supprimer une note
     */
    static deleteRate(rateId: number): Promise<void>;
    /**
     * Calculer la moyenne des notes pour un livre
     */
    static getBookAverageRate(bookId: number): Promise<{
        average: number;
        totalRates: number;
        distribution: {
            [key: number]: number;
        };
    }>;
    /**
     * Récupérer les statistiques générales des notes
     */
    static getRateStats(): Promise<{
        totalRates: number;
        averageRate: number;
        distributionGlobal: {
            [key: number]: number;
        };
        topRatedBooks: any[];
    }>;
    /**
     * Vérifier si une note existe
     */
    static rateExists(rateId: number): Promise<boolean>;
    /**
     * Récupérer les notes récentes
     */
    static getRecentRates(limit?: number): Promise<RateData[]>;
}
//# sourceMappingURL=RateService.d.ts.map