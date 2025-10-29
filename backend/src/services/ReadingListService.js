import { ReadingList } from "../models/ReadingList.js";
import { Op } from "sequelize";
// Erreurs métier personnalisées
export class ReadingListError extends Error {
    code;
    statusCode;
    constructor(message, code, statusCode = 400) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = "ReadingListError";
    }
}
export class ReadingListService {
    /**
     * Créer une nouvelle liste de lecture
     */
    static async createReadingList(listData) {
        try {
            // Validation des données
            if (!listData.libraryId) {
                throw new ReadingListError("L'ID de la bibliothèque est requis", "LIBRARY_ID_REQUIRED", 400);
            }
            if (!listData.userId) {
                throw new ReadingListError("L'ID utilisateur est requis", "USER_ID_REQUIRED", 400);
            }
            if (!listData.name || listData.name.trim().length === 0) {
                throw new ReadingListError("Le nom de la liste est requis", "LIST_NAME_REQUIRED", 400);
            }
            if (listData.name.trim().length > 200) {
                throw new ReadingListError("Le nom de la liste ne peut pas dépasser 200 caractères", "LIST_NAME_TOO_LONG", 400);
            }
            // Vérifier si une liste avec ce nom existe déjà pour cet utilisateur
            const existingList = await ReadingList.findOne({
                where: {
                    id_user: listData.userId,
                    name: listData.name.trim(),
                },
            });
            if (existingList) {
                throw new ReadingListError("Une liste avec ce nom existe déjà", "LIST_NAME_ALREADY_EXISTS", 409);
            }
            // Créer la liste de lecture
            const newList = await ReadingList.create({
                id_library: listData.libraryId,
                id_user: listData.userId,
                name: listData.name.trim(),
                description: listData.description?.trim() || null,
                genre: listData.genre?.trim() || null,
                statut: listData.statut !== undefined ? listData.statut : true,
            });
            return {
                id: newList.dataValues.id,
                libraryId: newList.dataValues.id_library,
                userId: newList.dataValues.id_user,
                name: newList.dataValues.name,
                description: newList.dataValues.description,
                genre: newList.dataValues.genre,
                statut: newList.dataValues.statut,
                createdAt: newList.dataValues.created_At,
                updatedAt: newList.dataValues.updated_At,
            };
        }
        catch (error) {
            if (error instanceof ReadingListError) {
                throw error;
            }
            throw new ReadingListError("Erreur lors de la création de la liste de lecture", "CREATE_READING_LIST_ERROR", 500);
        }
    }
    /**
     * Récupérer toutes les listes de lecture avec filtres optionnels
     */
    static async getAllReadingLists(filters = {}) {
        try {
            const { userId, libraryId, genre, statut, search, limit = 20, offset = 0, } = filters;
            // Construction de la condition de recherche
            const whereCondition = {};
            if (userId)
                whereCondition.id_user = userId;
            if (libraryId)
                whereCondition.id_library = libraryId;
            if (genre)
                whereCondition.genre = { [Op.iLike]: `%${genre}%` };
            if (statut !== undefined)
                whereCondition.statut = statut;
            if (search) {
                whereCondition[Op.or] = [
                    { name: { [Op.iLike]: `%${search}%` } },
                    { description: { [Op.iLike]: `%${search}%` } },
                    { genre: { [Op.iLike]: `%${search}%` } },
                ];
            }
            // Requête avec pagination
            const { rows: readingLists, count: total } = await ReadingList.findAndCountAll({
                where: whereCondition,
                limit: Number(limit),
                offset: Number(offset),
                order: [["created_At", "DESC"]],
                attributes: [
                    "id",
                    "id_library",
                    "id_user",
                    "name",
                    "description",
                    "genre",
                    "statut",
                    "created_At",
                    "updated_At",
                ],
            });
            const listsList = readingLists.map((list) => ({
                id: list.dataValues.id,
                libraryId: list.dataValues.id_library,
                userId: list.dataValues.id_user,
                name: list.dataValues.name,
                description: list.dataValues.description,
                genre: list.dataValues.genre,
                statut: list.dataValues.statut,
                createdAt: list.dataValues.created_At,
                updatedAt: list.dataValues.updated_At,
            }));
            return {
                readingLists: listsList,
                total,
                page: Math.floor(offset / limit) + 1,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            throw new ReadingListError("Erreur lors de la récupération des listes de lecture", "GET_READING_LISTS_ERROR", 500);
        }
    }
    /**
     * Récupérer une liste de lecture par ID
     */
    static async getReadingListById(listId) {
        try {
            const readingList = await ReadingList.findByPk(listId, {
                attributes: [
                    "id",
                    "id_library",
                    "id_user",
                    "name",
                    "description",
                    "genre",
                    "statut",
                    "created_At",
                    "updated_At",
                ],
            });
            if (!readingList) {
                return null;
            }
            return {
                id: readingList.dataValues.id,
                libraryId: readingList.dataValues.id_library,
                userId: readingList.dataValues.id_user,
                name: readingList.dataValues.name,
                description: readingList.dataValues.description,
                genre: readingList.dataValues.genre,
                statut: readingList.dataValues.statut,
                createdAt: readingList.dataValues.created_At,
                updatedAt: readingList.dataValues.updated_At,
            };
        }
        catch (error) {
            throw new ReadingListError("Erreur lors de la récupération de la liste de lecture", "GET_READING_LIST_ERROR", 500);
        }
    }
    /**
     * Récupérer les listes de lecture d'un utilisateur
     */
    static async getUserReadingLists(userId, includeInactive = false) {
        try {
            const whereCondition = { id_user: userId };
            if (!includeInactive) {
                whereCondition.statut = true;
            }
            const readingLists = await ReadingList.findAll({
                where: whereCondition,
                order: [["created_At", "DESC"]],
                attributes: [
                    "id",
                    "id_library",
                    "name",
                    "description",
                    "genre",
                    "statut",
                    "created_At",
                ],
            });
            return readingLists.map((list) => ({
                id: list.dataValues.id,
                libraryId: list.dataValues.id_library,
                userId: userId,
                name: list.dataValues.name,
                description: list.dataValues.description,
                genre: list.dataValues.genre,
                statut: list.dataValues.statut,
                createdAt: list.dataValues.created_At,
            }));
        }
        catch (error) {
            throw new ReadingListError("Erreur lors de la récupération des listes utilisateur", "GET_USER_READING_LISTS_ERROR", 500);
        }
    }
    /**
     * Mettre à jour une liste de lecture
     */
    static async updateReadingList(listId, updateData) {
        try {
            // Vérifier que la liste existe
            const readingList = await ReadingList.findByPk(listId);
            if (!readingList) {
                throw new ReadingListError("Liste de lecture non trouvée", "READING_LIST_NOT_FOUND", 404);
            }
            // Validation des données
            if (updateData.name !== undefined &&
                updateData.name.trim().length === 0) {
                throw new ReadingListError("Le nom de la liste ne peut pas être vide", "LIST_NAME_REQUIRED", 400);
            }
            if (updateData.name !== undefined &&
                updateData.name.trim().length > 200) {
                throw new ReadingListError("Le nom de la liste ne peut pas dépasser 200 caractères", "LIST_NAME_TOO_LONG", 400);
            }
            // Vérifier les doublons si on modifie le nom
            if (updateData.name !== undefined) {
                const newName = updateData.name.trim();
                const existingList = await ReadingList.findOne({
                    where: {
                        id_user: readingList.dataValues.id_user,
                        name: newName,
                        id: { [Op.not]: listId },
                    },
                });
                if (existingList) {
                    throw new ReadingListError("Une liste avec ce nom existe déjà", "LIST_NAME_ALREADY_EXISTS", 409);
                }
            }
            // Préparer les données de mise à jour
            const dataToUpdate = {};
            if (updateData.name !== undefined) {
                dataToUpdate.name = updateData.name.trim();
            }
            if (updateData.description !== undefined) {
                dataToUpdate.description = updateData.description?.trim() || null;
            }
            if (updateData.genre !== undefined) {
                dataToUpdate.genre = updateData.genre?.trim() || null;
            }
            if (updateData.statut !== undefined) {
                dataToUpdate.statut = updateData.statut;
            }
            // Mettre à jour
            await ReadingList.update(dataToUpdate, {
                where: { id: listId },
            });
            // Récupérer la liste mise à jour
            const updatedList = await ReadingList.findByPk(listId, {
                attributes: [
                    "id",
                    "id_library",
                    "id_user",
                    "name",
                    "description",
                    "genre",
                    "statut",
                    "created_At",
                    "updated_At",
                ],
            });
            return {
                id: updatedList.dataValues.id,
                libraryId: updatedList.dataValues.id_library,
                userId: updatedList.dataValues.id_user,
                name: updatedList.dataValues.name,
                description: updatedList.dataValues.description,
                genre: updatedList.dataValues.genre,
                statut: updatedList.dataValues.statut,
                createdAt: updatedList.dataValues.created_At,
                updatedAt: updatedList.dataValues.updated_At,
            };
        }
        catch (error) {
            if (error instanceof ReadingListError) {
                throw error;
            }
            throw new ReadingListError("Erreur lors de la mise à jour de la liste de lecture", "UPDATE_READING_LIST_ERROR", 500);
        }
    }
    /**
     * Supprimer une liste de lecture (soft delete)
     */
    static async deleteReadingList(listId) {
        try {
            const readingList = await ReadingList.findByPk(listId);
            if (!readingList) {
                throw new ReadingListError("Liste de lecture non trouvée", "READING_LIST_NOT_FOUND", 404);
            }
            // Soft delete (paranoid mode)
            await ReadingList.destroy({
                where: { id: listId },
            });
        }
        catch (error) {
            if (error instanceof ReadingListError) {
                throw error;
            }
            throw new ReadingListError("Erreur lors de la suppression de la liste de lecture", "DELETE_READING_LIST_ERROR", 500);
        }
    }
    /**
     * Rechercher des listes de lecture
     */
    static async searchReadingLists(searchTerm, userId, limit = 10) {
        try {
            if (!searchTerm || searchTerm.trim().length === 0) {
                return [];
            }
            const whereCondition = {
                statut: true, // Seulement les listes actives
                [Op.or]: [
                    { name: { [Op.iLike]: `%${searchTerm.trim()}%` } },
                    { description: { [Op.iLike]: `%${searchTerm.trim()}%` } },
                    { genre: { [Op.iLike]: `%${searchTerm.trim()}%` } },
                ],
            };
            if (userId) {
                whereCondition.id_user = userId;
            }
            const readingLists = await ReadingList.findAll({
                where: whereCondition,
                limit: Number(limit),
                order: [["created_At", "DESC"]],
                attributes: ["id", "id_user", "name", "description", "genre"],
            });
            return readingLists.map((list) => ({
                id: list.dataValues.id,
                libraryId: 0, // Pas besoin dans la recherche
                userId: list.dataValues.id_user,
                name: list.dataValues.name,
                description: list.dataValues.description,
                genre: list.dataValues.genre,
                statut: true,
            }));
        }
        catch (error) {
            throw new ReadingListError("Erreur lors de la recherche de listes de lecture", "SEARCH_READING_LISTS_ERROR", 500);
        }
    }
    /**
     * Statistiques des listes de lecture
     */
    static async getReadingListStats() {
        try {
            const totalLists = await ReadingList.count();
            const activeLists = await ReadingList.count({
                where: { statut: true },
            });
            const inactiveLists = totalLists - activeLists;
            const listsWithGenre = await ReadingList.count({
                where: {
                    genre: { [Op.not]: null },
                    statut: true,
                },
            });
            // TODO: Implémenter topGenres avec GROUP BY
            const topGenres = [];
            return {
                totalLists,
                activeLists,
                inactiveLists,
                listsWithGenre,
                topGenres,
            };
        }
        catch (error) {
            throw new ReadingListError("Erreur lors de la récupération des statistiques", "GET_STATS_ERROR", 500);
        }
    }
    /**
     * Vérifier si une liste de lecture existe
     */
    static async readingListExists(listId) {
        try {
            const readingList = await ReadingList.findByPk(listId);
            return !!readingList;
        }
        catch (error) {
            throw new ReadingListError("Erreur lors de la vérification de la liste de lecture", "CHECK_READING_LIST_ERROR", 500);
        }
    }
    /**
     * Activer/désactiver une liste de lecture
     */
    static async toggleReadingListStatus(listId) {
        try {
            const readingList = await ReadingList.findByPk(listId);
            if (!readingList) {
                throw new ReadingListError("Liste de lecture non trouvée", "READING_LIST_NOT_FOUND", 404);
            }
            const newStatus = !readingList.dataValues.statut;
            await ReadingList.update({ statut: newStatus }, { where: { id: listId } });
            return this.getReadingListById(listId);
        }
        catch (error) {
            if (error instanceof ReadingListError) {
                throw error;
            }
            throw new ReadingListError("Erreur lors du changement de statut", "TOGGLE_STATUS_ERROR", 500);
        }
    }
}
//# sourceMappingURL=ReadingListService.js.map