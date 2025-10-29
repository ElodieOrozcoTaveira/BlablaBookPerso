import { Notice } from "../models/Notice.js";
import { Op } from "sequelize";
// Erreurs métier personnalisées
export class NoticeError extends Error {
    code;
    statusCode;
    constructor(message, code, statusCode = 400) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = "NoticeError";
    }
}
export class NoticeService {
    /**
     * Créer un nouvel avis
     */
    static async createNotice(noticeData) {
        try {
            // Validation des données
            if (!noticeData.comment || noticeData.comment.trim().length === 0) {
                throw new NoticeError("Le commentaire de l'avis est requis", "NOTICE_COMMENT_REQUIRED", 400);
            }
            if (noticeData.comment.trim().length < 10) {
                throw new NoticeError("Le commentaire doit contenir au moins 10 caractères", "NOTICE_COMMENT_TOO_SHORT", 400);
            }
            // Créer l'avis
            const newNotice = await Notice.create({
                comment: noticeData.comment.trim(),
            });
            return {
                id: newNotice.dataValues.id,
                comment: newNotice.dataValues.comment,
                publishedAt: newNotice.dataValues.published_at,
                updatedAt: newNotice.dataValues.updated_at,
            };
        }
        catch (error) {
            if (error instanceof NoticeError) {
                throw error;
            }
            throw new NoticeError("Erreur lors de la création de l'avis", "CREATE_NOTICE_ERROR", 500);
        }
    }
    /**
     * Récupérer tous les avis avec filtres optionnels
     */
    static async getAllNotices(filters = {}) {
        try {
            const { search, limit = 20, offset = 0 } = filters;
            // Construction de la condition de recherche
            const whereCondition = {};
            if (search) {
                whereCondition.comment = {
                    [Op.iLike]: `%${search}%`,
                };
            }
            // Requête avec pagination
            const { rows: notices, count: total } = await Notice.findAndCountAll({
                where: whereCondition,
                limit: Number(limit),
                offset: Number(offset),
                order: [["published_at", "DESC"]],
                attributes: ["id", "comment", "published_at", "updated_at"],
            });
            const noticesList = notices.map((notice) => ({
                id: notice.dataValues.id,
                comment: notice.dataValues.comment,
                publishedAt: notice.dataValues.published_at,
                updatedAt: notice.dataValues.updated_at,
            }));
            return {
                notices: noticesList,
                total,
                page: Math.floor(offset / limit) + 1,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            throw new NoticeError("Erreur lors de la récupération des avis", "GET_NOTICES_ERROR", 500);
        }
    }
    /**
     * Récupérer un avis par ID
     */
    static async getNoticeById(noticeId) {
        try {
            const notice = await Notice.findByPk(noticeId, {
                attributes: ["id", "comment", "published_at", "updated_at"],
            });
            if (!notice) {
                return null;
            }
            return {
                id: notice.dataValues.id,
                comment: notice.dataValues.comment,
                publishedAt: notice.dataValues.published_at,
                updatedAt: notice.dataValues.updated_at,
            };
        }
        catch (error) {
            throw new NoticeError("Erreur lors de la récupération de l'avis", "GET_NOTICE_ERROR", 500);
        }
    }
    /**
     * Mettre à jour un avis
     */
    static async updateNotice(noticeId, updateData) {
        try {
            // Vérifier que l'avis existe
            const notice = await Notice.findByPk(noticeId);
            if (!notice) {
                throw new NoticeError("Avis non trouvé", "NOTICE_NOT_FOUND", 404);
            }
            // Validation des données
            if (updateData.comment !== undefined &&
                updateData.comment.trim().length === 0) {
                throw new NoticeError("Le commentaire ne peut pas être vide", "NOTICE_COMMENT_REQUIRED", 400);
            }
            if (updateData.comment !== undefined &&
                updateData.comment.trim().length < 10) {
                throw new NoticeError("Le commentaire doit contenir au moins 10 caractères", "NOTICE_COMMENT_TOO_SHORT", 400);
            }
            // Préparer les données de mise à jour
            const dataToUpdate = {};
            if (updateData.comment !== undefined) {
                dataToUpdate.comment = updateData.comment.trim();
            }
            // Mettre à jour
            await Notice.update(dataToUpdate, {
                where: { id: noticeId },
            });
            // Récupérer l'avis mis à jour
            const updatedNotice = await Notice.findByPk(noticeId, {
                attributes: ["id", "comment", "published_at", "updated_at"],
            });
            return {
                id: updatedNotice.dataValues.id,
                comment: updatedNotice.dataValues.comment,
                publishedAt: updatedNotice.dataValues.published_at,
                updatedAt: updatedNotice.dataValues.updated_at,
            };
        }
        catch (error) {
            if (error instanceof NoticeError) {
                throw error;
            }
            throw new NoticeError("Erreur lors de la mise à jour de l'avis", "UPDATE_NOTICE_ERROR", 500);
        }
    }
    /**
     * Supprimer un avis
     */
    static async deleteNotice(noticeId) {
        try {
            const notice = await Notice.findByPk(noticeId);
            if (!notice) {
                throw new NoticeError("Avis non trouvé", "NOTICE_NOT_FOUND", 404);
            }
            await Notice.destroy({
                where: { id: noticeId },
            });
        }
        catch (error) {
            if (error instanceof NoticeError) {
                throw error;
            }
            throw new NoticeError("Erreur lors de la suppression de l'avis", "DELETE_NOTICE_ERROR", 500);
        }
    }
    /**
     * Rechercher des avis par commentaire
     */
    static async searchNotices(searchTerm, limit = 10) {
        try {
            if (!searchTerm || searchTerm.trim().length === 0) {
                return [];
            }
            const notices = await Notice.findAll({
                where: {
                    comment: {
                        [Op.iLike]: `%${searchTerm.trim()}%`,
                    },
                },
                limit: Number(limit),
                order: [["published_at", "DESC"]],
                attributes: ["id", "comment", "published_at"],
            });
            return notices.map((notice) => ({
                id: notice.dataValues.id,
                comment: notice.dataValues.comment,
                publishedAt: notice.dataValues.published_at,
            }));
        }
        catch (error) {
            throw new NoticeError("Erreur lors de la recherche d'avis", "SEARCH_NOTICES_ERROR", 500);
        }
    }
    /**
     * Statistiques des avis
     */
    static async getNoticeStats() {
        try {
            const totalNotices = await Notice.count();
            // Avis des 30 derniers jours
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const recentNotices = await Notice.count({
                where: {
                    published_at: {
                        [Op.gte]: thirtyDaysAgo,
                    },
                },
            });
            // TODO: Calculer la longueur moyenne des commentaires
            const averageLength = 0;
            return {
                totalNotices,
                recentNotices,
                averageLength,
            };
        }
        catch (error) {
            throw new NoticeError("Erreur lors de la récupération des statistiques", "GET_STATS_ERROR", 500);
        }
    }
    /**
     * Vérifier si un avis existe
     */
    static async noticeExists(noticeId) {
        try {
            const notice = await Notice.findByPk(noticeId);
            return !!notice;
        }
        catch (error) {
            throw new NoticeError("Erreur lors de la vérification de l'avis", "CHECK_NOTICE_ERROR", 500);
        }
    }
    /**
     * Récupérer les avis récents
     */
    static async getRecentNotices(limit = 10) {
        try {
            const notices = await Notice.findAll({
                limit: Number(limit),
                order: [["published_at", "DESC"]],
                attributes: ["id", "comment", "published_at"],
            });
            return notices.map((notice) => ({
                id: notice.dataValues.id,
                comment: notice.dataValues.comment,
                publishedAt: notice.dataValues.published_at,
            }));
        }
        catch (error) {
            throw new NoticeError("Erreur lors de la récupération des avis récents", "GET_RECENT_NOTICES_ERROR", 500);
        }
    }
}
//# sourceMappingURL=NoticeService.js.map