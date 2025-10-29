/**
 * SERVICE DES AVIS
 *
 * Contient toute la logique métier liée aux avis des utilisateurs
 * Indépendant du protocole HTTP (réutilisable partout)
 */
export interface NoticeData {
    id: number;
    comment: string;
    publishedAt?: Date;
    updatedAt?: Date;
}
export interface CreateNoticeData {
    comment: string;
}
export interface UpdateNoticeData {
    comment?: string;
}
export interface NoticeSearchFilters {
    search?: string;
    limit?: number;
    offset?: number;
}
export declare class NoticeError extends Error {
    code: string;
    statusCode: number;
    constructor(message: string, code: string, statusCode?: number);
}
export declare class NoticeService {
    /**
     * Créer un nouvel avis
     */
    static createNotice(noticeData: CreateNoticeData): Promise<NoticeData>;
    /**
     * Récupérer tous les avis avec filtres optionnels
     */
    static getAllNotices(filters?: NoticeSearchFilters): Promise<{
        notices: NoticeData[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    /**
     * Récupérer un avis par ID
     */
    static getNoticeById(noticeId: number): Promise<NoticeData | null>;
    /**
     * Mettre à jour un avis
     */
    static updateNotice(noticeId: number, updateData: UpdateNoticeData): Promise<NoticeData>;
    /**
     * Supprimer un avis
     */
    static deleteNotice(noticeId: number): Promise<void>;
    /**
     * Rechercher des avis par commentaire
     */
    static searchNotices(searchTerm: string, limit?: number): Promise<NoticeData[]>;
    /**
     * Statistiques des avis
     */
    static getNoticeStats(): Promise<{
        totalNotices: number;
        recentNotices: number;
        averageLength: number;
    }>;
    /**
     * Vérifier si un avis existe
     */
    static noticeExists(noticeId: number): Promise<boolean>;
    /**
     * Récupérer les avis récents
     */
    static getRecentNotices(limit?: number): Promise<NoticeData[]>;
}
//# sourceMappingURL=NoticeService.d.ts.map