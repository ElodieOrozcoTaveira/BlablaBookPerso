import { Rate } from "../models/Rate.js";
import { Op } from "sequelize";
// Erreurs métier personnalisées
export class RateError extends Error {
    code;
    statusCode;
    constructor(message, code, statusCode = 400) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = "RateError";
    }
}
export class RateService {
    /**
     * Créer une nouvelle note
     */
    static async createRate(rateData) {
        try {
            // Validation des données
            if (!rateData.userId) {
                throw new RateError("L'ID utilisateur est requis", "USER_ID_REQUIRED", 400);
            }
            if (!rateData.bookId) {
                throw new RateError("L'ID du livre est requis", "BOOK_ID_REQUIRED", 400);
            }
            if (!rateData.rate || rateData.rate < 1 || rateData.rate > 5) {
                throw new RateError("La note doit être comprise entre 1 et 5", "INVALID_RATE_VALUE", 400);
            }
            // Vérifier si l'utilisateur a déjà noté ce livre
            const existingRate = await Rate.findOne({
                where: {
                    id_user: rateData.userId,
                    id_book: rateData.bookId,
                    ...(rateData.readingListId && {
                        id_reading_list: rateData.readingListId,
                    }),
                },
            });
            if (existingRate) {
                throw new RateError("Vous avez déjà noté ce livre", "RATE_ALREADY_EXISTS", 409);
            }
            // Créer la note
            const newRate = await Rate.create({
                id_user: rateData.userId,
                id_book: rateData.bookId,
                id_reading_list: rateData.readingListId || null,
                rate: rateData.rate,
            });
            return {
                id: newRate.dataValues.id,
                userId: newRate.dataValues.id_user,
                bookId: newRate.dataValues.id_book,
                readingListId: newRate.dataValues.id_reading_list,
                rate: newRate.dataValues.rate,
                publishedAt: newRate.dataValues.published_at,
                updatedAt: newRate.dataValues.updated_at,
            };
        }
        catch (error) {
            if (error instanceof RateError) {
                throw error;
            }
            throw new RateError("Erreur lors de la création de la note", "CREATE_RATE_ERROR", 500);
        }
    }
    /**
     * Récupérer toutes les notes avec filtres optionnels
     */
    static async getAllRates(filters = {}) {
        try {
            const { userId, bookId, readingListId, minRate, maxRate, limit = 20, offset = 0, } = filters;
            // Construction de la condition de recherche
            const whereCondition = {};
            if (userId)
                whereCondition.id_user = userId;
            if (bookId)
                whereCondition.id_book = bookId;
            if (readingListId)
                whereCondition.id_reading_list = readingListId;
            if (minRate || maxRate) {
                whereCondition.rate = {};
                if (minRate)
                    whereCondition.rate[Op.gte] = minRate;
                if (maxRate)
                    whereCondition.rate[Op.lte] = maxRate;
            }
            // Requête avec pagination
            const { rows: rates, count: total } = await Rate.findAndCountAll({
                where: whereCondition,
                limit: Number(limit),
                offset: Number(offset),
                order: [["published_at", "DESC"]],
                attributes: [
                    "id",
                    "id_user",
                    "id_book",
                    "id_reading_list",
                    "rate",
                    "published_at",
                    "updated_at",
                ],
            });
            const ratesList = rates.map((rate) => ({
                id: rate.dataValues.id,
                userId: rate.dataValues.id_user,
                bookId: rate.dataValues.id_book,
                readingListId: rate.dataValues.id_reading_list,
                rate: rate.dataValues.rate,
                publishedAt: rate.dataValues.published_at,
                updatedAt: rate.dataValues.updated_at,
            }));
            // Calculer la moyenne si on a des résultats
            let averageRate;
            if (ratesList.length > 0) {
                const sum = ratesList.reduce((acc, rate) => acc + rate.rate, 0);
                averageRate = sum / ratesList.length;
            }
            const result = {
                rates: ratesList,
                total,
                page: Math.floor(offset / limit) + 1,
                totalPages: Math.ceil(total / limit),
            };
            // Ajouter la moyenne si elle existe
            if (averageRate !== undefined) {
                result.averageRate = averageRate;
            }
            return result;
        }
        catch (error) {
            throw new RateError("Erreur lors de la récupération des notes", "GET_RATES_ERROR", 500);
        }
    }
    /**
     * Récupérer une note par ID
     */
    static async getRateById(rateId) {
        try {
            const rate = await Rate.findByPk(rateId, {
                attributes: [
                    "id",
                    "id_user",
                    "id_book",
                    "id_reading_list",
                    "rate",
                    "published_at",
                    "updated_at",
                ],
            });
            if (!rate) {
                return null;
            }
            return {
                id: rate.dataValues.id,
                userId: rate.dataValues.id_user,
                bookId: rate.dataValues.id_book,
                readingListId: rate.dataValues.id_reading_list,
                rate: rate.dataValues.rate,
                publishedAt: rate.dataValues.published_at,
                updatedAt: rate.dataValues.updated_at,
            };
        }
        catch (error) {
            throw new RateError("Erreur lors de la récupération de la note", "GET_RATE_ERROR", 500);
        }
    }
    /**
     * Récupérer la note d'un utilisateur pour un livre
     */
    static async getUserRateForBook(userId, bookId) {
        try {
            const rate = await Rate.findOne({
                where: {
                    id_user: userId,
                    id_book: bookId,
                },
                attributes: [
                    "id",
                    "id_user",
                    "id_book",
                    "id_reading_list",
                    "rate",
                    "published_at",
                    "updated_at",
                ],
            });
            if (!rate) {
                return null;
            }
            return {
                id: rate.dataValues.id,
                userId: rate.dataValues.id_user,
                bookId: rate.dataValues.id_book,
                readingListId: rate.dataValues.id_reading_list,
                rate: rate.dataValues.rate,
                publishedAt: rate.dataValues.published_at,
                updatedAt: rate.dataValues.updated_at,
            };
        }
        catch (error) {
            throw new RateError("Erreur lors de la récupération de la note", "GET_USER_RATE_ERROR", 500);
        }
    }
    /**
     * Mettre à jour une note
     */
    static async updateRate(rateId, updateData) {
        try {
            // Vérifier que la note existe
            const rate = await Rate.findByPk(rateId);
            if (!rate) {
                throw new RateError("Note non trouvée", "RATE_NOT_FOUND", 404);
            }
            // Validation des données
            if (updateData.rate !== undefined &&
                (updateData.rate < 1 || updateData.rate > 5)) {
                throw new RateError("La note doit être comprise entre 1 et 5", "INVALID_RATE_VALUE", 400);
            }
            // Préparer les données de mise à jour
            const dataToUpdate = {};
            if (updateData.rate !== undefined) {
                dataToUpdate.rate = updateData.rate;
            }
            // Mettre à jour
            await Rate.update(dataToUpdate, {
                where: { id: rateId },
            });
            // Récupérer la note mise à jour
            const updatedRate = await Rate.findByPk(rateId, {
                attributes: [
                    "id",
                    "id_user",
                    "id_book",
                    "id_reading_list",
                    "rate",
                    "published_at",
                    "updated_at",
                ],
            });
            return {
                id: updatedRate.dataValues.id,
                userId: updatedRate.dataValues.id_user,
                bookId: updatedRate.dataValues.id_book,
                readingListId: updatedRate.dataValues.id_reading_list,
                rate: updatedRate.dataValues.rate,
                publishedAt: updatedRate.dataValues.published_at,
                updatedAt: updatedRate.dataValues.updated_at,
            };
        }
        catch (error) {
            if (error instanceof RateError) {
                throw error;
            }
            throw new RateError("Erreur lors de la mise à jour de la note", "UPDATE_RATE_ERROR", 500);
        }
    }
    /**
     * Supprimer une note
     */
    static async deleteRate(rateId) {
        try {
            const rate = await Rate.findByPk(rateId);
            if (!rate) {
                throw new RateError("Note non trouvée", "RATE_NOT_FOUND", 404);
            }
            await Rate.destroy({
                where: { id: rateId },
            });
        }
        catch (error) {
            if (error instanceof RateError) {
                throw error;
            }
            throw new RateError("Erreur lors de la suppression de la note", "DELETE_RATE_ERROR", 500);
        }
    }
    /**
     * Calculer la moyenne des notes pour un livre
     */
    static async getBookAverageRate(bookId) {
        try {
            const rates = await Rate.findAll({
                where: { id_book: bookId },
                attributes: ["rate"],
            });
            if (rates.length === 0) {
                return {
                    average: 0,
                    totalRates: 0,
                    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                };
            }
            const rateValues = rates.map((r) => r.dataValues.rate);
            const sum = rateValues.reduce((acc, rate) => acc + rate, 0);
            const average = sum / rateValues.length;
            // Distribution des notes
            const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            rateValues.forEach((rate) => {
                distribution[rate]++;
            });
            return {
                average: Math.round(average * 100) / 100, // Arrondi à 2 décimales
                totalRates: rateValues.length,
                distribution,
            };
        }
        catch (error) {
            throw new RateError("Erreur lors du calcul de la moyenne", "GET_AVERAGE_RATE_ERROR", 500);
        }
    }
    /**
     * Récupérer les statistiques générales des notes
     */
    static async getRateStats() {
        try {
            const allRates = await Rate.findAll({
                attributes: ["rate", "id_book"],
            });
            if (allRates.length === 0) {
                return {
                    totalRates: 0,
                    averageRate: 0,
                    distributionGlobal: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                    topRatedBooks: [],
                };
            }
            const rateValues = allRates.map((r) => r.dataValues.rate);
            const sum = rateValues.reduce((acc, rate) => acc + rate, 0);
            const averageRate = sum / rateValues.length;
            // Distribution globale
            const distributionGlobal = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            rateValues.forEach((rate) => {
                distributionGlobal[rate]++;
            });
            // TODO: Implémenter topRatedBooks avec jointure sur la table BOOK
            const topRatedBooks = [];
            return {
                totalRates: allRates.length,
                averageRate: Math.round(averageRate * 100) / 100,
                distributionGlobal,
                topRatedBooks,
            };
        }
        catch (error) {
            throw new RateError("Erreur lors de la récupération des statistiques", "GET_STATS_ERROR", 500);
        }
    }
    /**
     * Vérifier si une note existe
     */
    static async rateExists(rateId) {
        try {
            const rate = await Rate.findByPk(rateId);
            return !!rate;
        }
        catch (error) {
            throw new RateError("Erreur lors de la vérification de la note", "CHECK_RATE_ERROR", 500);
        }
    }
    /**
     * Récupérer les notes récentes
     */
    static async getRecentRates(limit = 10) {
        try {
            const rates = await Rate.findAll({
                limit: Number(limit),
                order: [["published_at", "DESC"]],
                attributes: ["id", "id_user", "id_book", "rate", "published_at"],
            });
            return rates.map((rate) => ({
                id: rate.dataValues.id,
                userId: rate.dataValues.id_user,
                bookId: rate.dataValues.id_book,
                rate: rate.dataValues.rate,
                publishedAt: rate.dataValues.published_at,
            }));
        }
        catch (error) {
            throw new RateError("Erreur lors de la récupération des notes récentes", "GET_RECENT_RATES_ERROR", 500);
        }
    }
}
//# sourceMappingURL=RateService.js.map