import { ReadingListService, ReadingListError, } from "../services/ReadingListService.js";
/**
 * CONTRÔLEUR DES LISTES DE LECTURE
 *
 * Gère les requêtes HTTP liées aux listes de lecture thématiques
 * Fait le lien entre les routes Express et le ReadingListService
 */
export class ReadingListController {
    /**
     * Créer une nouvelle liste de lecture
     * POST /api/reading-lists
     */
    static async createReadingList(req, res) {
        try {
            const listData = req.body;
            const newList = await ReadingListService.createReadingList(listData);
            res.status(201).json({
                success: true,
                message: "Liste de lecture créée avec succès",
                data: newList,
            });
        }
        catch (error) {
            if (error instanceof ReadingListError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    error: error.code,
                });
            }
            else {
                console.error("Erreur lors de la création de la liste:", error);
                res.status(500).json({
                    success: false,
                    message: "Erreur interne du serveur",
                    error: "INTERNAL_SERVER_ERROR",
                });
            }
        }
    }
    /**
     * Récupérer toutes les listes de lecture avec filtres
     * GET /api/reading-lists
     */
    static async getAllReadingLists(req, res) {
        try {
            const filters = {};
            if (req.query.userId) {
                filters.userId = parseInt(req.query.userId);
            }
            if (req.query.libraryId) {
                filters.libraryId = parseInt(req.query.libraryId);
            }
            if (req.query.genre) {
                filters.genre = req.query.genre;
            }
            if (req.query.statut) {
                filters.statut = req.query.statut === "true";
            }
            if (req.query.search) {
                filters.search = req.query.search;
            }
            if (req.query.limit) {
                filters.limit = parseInt(req.query.limit);
            }
            if (req.query.offset) {
                filters.offset = parseInt(req.query.offset);
            }
            const result = await ReadingListService.getAllReadingLists(filters);
            res.status(200).json({
                success: true,
                message: "Listes de lecture récupérées avec succès",
                data: result,
            });
        }
        catch (error) {
            if (error instanceof ReadingListError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    error: error.code,
                });
            }
            else {
                console.error("Erreur lors de la récupération des listes:", error);
                res.status(500).json({
                    success: false,
                    message: "Erreur interne du serveur",
                    error: "INTERNAL_SERVER_ERROR",
                });
            }
        }
    }
    /**
     * Récupérer une liste de lecture par ID
     * GET /api/reading-lists/:id
     */
    static async getReadingListById(req, res) {
        try {
            const listId = parseInt(req.params.id);
            if (isNaN(listId)) {
                res.status(400).json({
                    success: false,
                    message: "ID de la liste invalide",
                    error: "INVALID_LIST_ID",
                });
                return;
            }
            const readingList = await ReadingListService.getReadingListById(listId);
            if (!readingList) {
                res.status(404).json({
                    success: false,
                    message: "Liste de lecture non trouvée",
                    error: "READING_LIST_NOT_FOUND",
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: "Liste de lecture récupérée avec succès",
                data: readingList,
            });
        }
        catch (error) {
            if (error instanceof ReadingListError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    error: error.code,
                });
            }
            else {
                console.error("Erreur lors de la récupération de la liste:", error);
                res.status(500).json({
                    success: false,
                    message: "Erreur interne du serveur",
                    error: "INTERNAL_SERVER_ERROR",
                });
            }
        }
    }
    /**
     * Récupérer les listes de lecture d'un utilisateur
     * GET /api/reading-lists/user/:userId
     */
    static async getUserReadingLists(req, res) {
        try {
            const userId = parseInt(req.params.userId);
            const includeInactive = req.query.includeInactive === "true";
            if (isNaN(userId)) {
                res.status(400).json({
                    success: false,
                    message: "ID utilisateur invalide",
                    error: "INVALID_USER_ID",
                });
                return;
            }
            const readingLists = await ReadingListService.getUserReadingLists(userId, includeInactive);
            res.status(200).json({
                success: true,
                message: "Listes utilisateur récupérées avec succès",
                data: readingLists,
            });
        }
        catch (error) {
            if (error instanceof ReadingListError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    error: error.code,
                });
            }
            else {
                console.error("Erreur lors de la récupération des listes utilisateur:", error);
                res.status(500).json({
                    success: false,
                    message: "Erreur interne du serveur",
                    error: "INTERNAL_SERVER_ERROR",
                });
            }
        }
    }
    /**
     * Mettre à jour une liste de lecture
     * PUT /api/reading-lists/:id
     */
    static async updateReadingList(req, res) {
        try {
            const listId = parseInt(req.params.id);
            const updateData = req.body;
            if (isNaN(listId)) {
                res.status(400).json({
                    success: false,
                    message: "ID de la liste invalide",
                    error: "INVALID_LIST_ID",
                });
                return;
            }
            const updatedList = await ReadingListService.updateReadingList(listId, updateData);
            res.status(200).json({
                success: true,
                message: "Liste de lecture mise à jour avec succès",
                data: updatedList,
            });
        }
        catch (error) {
            if (error instanceof ReadingListError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    error: error.code,
                });
            }
            else {
                console.error("Erreur lors de la mise à jour de la liste:", error);
                res.status(500).json({
                    success: false,
                    message: "Erreur interne du serveur",
                    error: "INTERNAL_SERVER_ERROR",
                });
            }
        }
    }
    /**
     * Supprimer une liste de lecture
     * DELETE /api/reading-lists/:id
     */
    static async deleteReadingList(req, res) {
        try {
            const listId = parseInt(req.params.id);
            if (isNaN(listId)) {
                res.status(400).json({
                    success: false,
                    message: "ID de la liste invalide",
                    error: "INVALID_LIST_ID",
                });
                return;
            }
            await ReadingListService.deleteReadingList(listId);
            res.status(200).json({
                success: true,
                message: "Liste de lecture supprimée avec succès",
            });
        }
        catch (error) {
            if (error instanceof ReadingListError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    error: error.code,
                });
            }
            else {
                console.error("Erreur lors de la suppression de la liste:", error);
                res.status(500).json({
                    success: false,
                    message: "Erreur interne du serveur",
                    error: "INTERNAL_SERVER_ERROR",
                });
            }
        }
    }
    /**
     * Rechercher des listes de lecture
     * GET /api/reading-lists/search
     */
    static async searchReadingLists(req, res) {
        try {
            const searchTerm = req.query.q;
            const userId = req.query.userId
                ? parseInt(req.query.userId)
                : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            if (!searchTerm || searchTerm.trim().length === 0) {
                res.status(400).json({
                    success: false,
                    message: "Terme de recherche requis",
                    error: "SEARCH_TERM_REQUIRED",
                });
                return;
            }
            const readingLists = await ReadingListService.searchReadingLists(searchTerm, userId, limit);
            res.status(200).json({
                success: true,
                message: "Recherche effectuée avec succès",
                data: readingLists,
            });
        }
        catch (error) {
            if (error instanceof ReadingListError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    error: error.code,
                });
            }
            else {
                console.error("Erreur lors de la recherche:", error);
                res.status(500).json({
                    success: false,
                    message: "Erreur interne du serveur",
                    error: "INTERNAL_SERVER_ERROR",
                });
            }
        }
    }
    /**
     * Récupérer les statistiques des listes de lecture
     * GET /api/reading-lists/stats
     */
    static async getReadingListStats(req, res) {
        try {
            const stats = await ReadingListService.getReadingListStats();
            res.status(200).json({
                success: true,
                message: "Statistiques récupérées avec succès",
                data: stats,
            });
        }
        catch (error) {
            if (error instanceof ReadingListError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    error: error.code,
                });
            }
            else {
                console.error("Erreur lors de la récupération des statistiques:", error);
                res.status(500).json({
                    success: false,
                    message: "Erreur interne du serveur",
                    error: "INTERNAL_SERVER_ERROR",
                });
            }
        }
    }
    /**
     * Activer/désactiver une liste de lecture
     * PATCH /api/reading-lists/:id/toggle
     */
    static async toggleReadingListStatus(req, res) {
        try {
            const listId = parseInt(req.params.id);
            if (isNaN(listId)) {
                res.status(400).json({
                    success: false,
                    message: "ID de la liste invalide",
                    error: "INVALID_LIST_ID",
                });
                return;
            }
            const updatedList = await ReadingListService.toggleReadingListStatus(listId);
            res.status(200).json({
                success: true,
                message: "Statut de la liste modifié avec succès",
                data: updatedList,
            });
        }
        catch (error) {
            if (error instanceof ReadingListError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    error: error.code,
                });
            }
            else {
                console.error("Erreur lors du changement de statut:", error);
                res.status(500).json({
                    success: false,
                    message: "Erreur interne du serveur",
                    error: "INTERNAL_SERVER_ERROR",
                });
            }
        }
    }
    /**
     * Vérifier si une liste de lecture existe
     * GET /api/reading-lists/:id/exists
     */
    static async checkReadingListExists(req, res) {
        try {
            const listId = parseInt(req.params.id);
            if (isNaN(listId)) {
                res.status(400).json({
                    success: false,
                    message: "ID de la liste invalide",
                    error: "INVALID_LIST_ID",
                });
                return;
            }
            const exists = await ReadingListService.readingListExists(listId);
            res.status(200).json({
                success: true,
                message: "Vérification effectuée",
                data: { exists },
            });
        }
        catch (error) {
            if (error instanceof ReadingListError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    error: error.code,
                });
            }
            else {
                console.error("Erreur lors de la vérification:", error);
                res.status(500).json({
                    success: false,
                    message: "Erreur interne du serveur",
                    error: "INTERNAL_SERVER_ERROR",
                });
            }
        }
    }
}
//# sourceMappingURL=ReadingListController.js.map