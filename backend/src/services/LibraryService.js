import { Library } from "../models/Library.js";
import { Op } from "sequelize";
// Erreurs métier personnalisées
export class LibraryError extends Error {
    code;
    statusCode;
    constructor(message, code, statusCode = 400) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = "LibraryError";
    }
}
export class LibraryService {
    /**
     * Création d'une nouvelle bibliothèque
     */
    static async createLibrary(libraryData) {
        try {
            // 1. Validation des données
            if (!libraryData.name || libraryData.name.trim().length < 2) {
                throw new LibraryError("Le nom de la bibliothèque doit contenir au moins 2 caractères", "INVALID_NAME", 400);
            }
            if (!libraryData.id_user) {
                throw new LibraryError("L'ID utilisateur est requis", "USER_ID_REQUIRED", 400);
            }
            // 2. Vérification de l'unicité du nom pour cet utilisateur
            const existingLibrary = await Library.findOne({
                where: {
                    name: libraryData.name.trim(),
                    id_user: libraryData.id_user,
                },
            });
            if (existingLibrary) {
                throw new LibraryError("Une bibliothèque avec ce nom existe déjà", "LIBRARY_NAME_EXISTS", 409);
            }
            // 3. Création de la bibliothèque
            const newLibrary = await Library.create({
                name: libraryData.name.trim(),
                id_user: libraryData.id_user,
            });
            // 4. Retour des données
            return {
                id: newLibrary.dataValues.id,
                name: newLibrary.dataValues.name,
                id_user: newLibrary.dataValues.id_user,
                created_at: newLibrary.dataValues.created_at,
                updated_at: newLibrary.dataValues.updated_at,
            };
        }
        catch (error) {
            if (error instanceof LibraryError) {
                throw error;
            }
            throw new LibraryError("Erreur lors de la création de la bibliothèque", "CREATION_ERROR", 500);
        }
    }
    /**
     * Récupération des bibliothèques d'un utilisateur
     */
    static async getUserLibraries(userId) {
        try {
            const libraries = await Library.findAll({
                where: {
                    id_user: userId,
                },
                order: [["created_at", "DESC"]],
            });
            return libraries.map((library) => ({
                id: library.dataValues.id,
                name: library.dataValues.name,
                id_user: library.dataValues.id_user,
                created_at: library.dataValues.created_at,
                updated_at: library.dataValues.updated_at,
            }));
        }
        catch (error) {
            throw new LibraryError("Erreur lors de la récupération des bibliothèques", "FETCH_ERROR", 500);
        }
    }
    /**
     * Récupération d'une bibliothèque par ID
     */
    static async getLibraryById(libraryId, userId) {
        try {
            const library = await Library.findOne({
                where: {
                    id: libraryId,
                    id_user: userId, // Sécurité : seul le propriétaire peut accéder
                },
            });
            if (!library) {
                return null;
            }
            return {
                id: library.dataValues.id,
                name: library.dataValues.name,
                id_user: library.dataValues.id_user,
                created_at: library.dataValues.created_at,
                updated_at: library.dataValues.updated_at,
            };
        }
        catch (error) {
            throw new LibraryError("Erreur lors de la récupération de la bibliothèque", "FETCH_ERROR", 500);
        }
    }
    /**
     * Mise à jour d'une bibliothèque
     */
    static async updateLibrary(libraryId, userId, updateData) {
        try {
            // 1. Validation des données
            if (updateData.name && updateData.name.trim().length < 2) {
                throw new LibraryError("Le nom de la bibliothèque doit contenir au moins 2 caractères", "INVALID_NAME", 400);
            }
            // 2. Vérification que la bibliothèque existe et appartient à l'utilisateur
            const library = await Library.findOne({
                where: {
                    id: libraryId,
                    id_user: userId,
                },
            });
            if (!library) {
                throw new LibraryError("Bibliothèque non trouvée ou accès non autorisé", "LIBRARY_NOT_FOUND", 404);
            }
            // 3. Vérification de l'unicité du nouveau nom (si fourni)
            if (updateData.name) {
                const existingLibrary = await Library.findOne({
                    where: {
                        name: updateData.name.trim(),
                        id_user: userId,
                        id: { [Op.ne]: libraryId }, // Exclure la bibliothèque actuelle
                    },
                });
                if (existingLibrary) {
                    throw new LibraryError("Une bibliothèque avec ce nom existe déjà", "LIBRARY_NAME_EXISTS", 409);
                }
            }
            // 4. Mise à jour
            const updateFields = {};
            if (updateData.name) {
                updateFields.name = updateData.name.trim();
            }
            await library.update(updateFields);
            // 5. Retour des données mises à jour
            await library.reload();
            return {
                id: library.dataValues.id,
                name: library.dataValues.name,
                id_user: library.dataValues.id_user,
                created_at: library.dataValues.created_at,
                updated_at: library.dataValues.updated_at,
            };
        }
        catch (error) {
            if (error instanceof LibraryError) {
                throw error;
            }
            throw new LibraryError("Erreur lors de la mise à jour de la bibliothèque", "UPDATE_ERROR", 500);
        }
    }
    /**
     * Suppression d'une bibliothèque (soft delete)
     */
    static async deleteLibrary(libraryId, userId) {
        try {
            // 1. Vérification que la bibliothèque existe et appartient à l'utilisateur
            const library = await Library.findOne({
                where: {
                    id: libraryId,
                    id_user: userId,
                },
            });
            if (!library) {
                throw new LibraryError("Bibliothèque non trouvée ou accès non autorisé", "LIBRARY_NOT_FOUND", 404);
            }
            // 2. Suppression (soft delete grâce à paranoid: true)
            await library.destroy();
            return true;
        }
        catch (error) {
            if (error instanceof LibraryError) {
                throw error;
            }
            throw new LibraryError("Erreur lors de la suppression de la bibliothèque", "DELETE_ERROR", 500);
        }
    }
    /**
     * Recherche de bibliothèques par nom (pour un utilisateur)
     */
    static async searchLibraries(userId, searchTerm) {
        try {
            if (!searchTerm || searchTerm.trim().length < 2) {
                return [];
            }
            const libraries = await Library.findAll({
                where: {
                    id_user: userId,
                    name: {
                        [Op.iLike]: `%${searchTerm.trim()}%`, // Recherche insensible à la casse
                    },
                },
                order: [["created_at", "DESC"]],
                limit: 20, // Limite les résultats
            });
            return libraries.map((library) => ({
                id: library.dataValues.id,
                name: library.dataValues.name,
                id_user: library.dataValues.id_user,
                created_at: library.dataValues.created_at,
                updated_at: library.dataValues.updated_at,
            }));
        }
        catch (error) {
            throw new LibraryError("Erreur lors de la recherche de bibliothèques", "SEARCH_ERROR", 500);
        }
    }
    /**
     * Statistiques des bibliothèques d'un utilisateur
     */
    static async getUserLibraryStats(userId) {
        try {
            // Nombre total de bibliothèques
            const totalLibraries = await Library.count({
                where: {
                    id_user: userId,
                },
            });
            // Bibliothèques créées ce mois
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            const recentLibraries = await Library.count({
                where: {
                    id_user: userId,
                    created_at: {
                        [Op.gte]: startOfMonth,
                    },
                },
            });
            return {
                totalLibraries,
                recentLibraries,
            };
        }
        catch (error) {
            throw new LibraryError("Erreur lors de la récupération des statistiques", "STATS_ERROR", 500);
        }
    }
}
//# sourceMappingURL=LibraryService.js.map