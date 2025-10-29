import { PermissionService, PermissionError, } from "../services/PermissionService.js";
/**
 * CONTRÔLEUR DES PERMISSIONS
 *
 * Gère les requêtes HTTP liées aux permissions du système
 * Fait le lien entre les routes Express et le PermissionService
 */
export class PermissionController {
    /**
     * Créer une nouvelle permission
     * POST /api/permissions
     */
    static async createPermission(req, res) {
        try {
            const permissionData = req.body;
            const newPermission = await PermissionService.createPermission(permissionData);
            res.status(201).json({
                success: true,
                message: "Permission créée avec succès",
                data: newPermission,
            });
        }
        catch (error) {
            if (error instanceof PermissionError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    error: error.code,
                });
            }
            else {
                console.error("Erreur lors de la création de la permission:", error);
                res.status(500).json({
                    success: false,
                    message: "Erreur interne du serveur",
                    error: "INTERNAL_SERVER_ERROR",
                });
            }
        }
    }
    /**
     * Récupérer toutes les permissions avec filtres
     * GET /api/permissions
     */
    static async getAllPermissions(req, res) {
        try {
            const filters = {};
            if (req.query.search) {
                filters.search = req.query.search;
            }
            if (req.query.limit) {
                filters.limit = parseInt(req.query.limit);
            }
            if (req.query.offset) {
                filters.offset = parseInt(req.query.offset);
            }
            const result = await PermissionService.getAllPermissions(filters);
            res.status(200).json({
                success: true,
                message: "Permissions récupérées avec succès",
                data: result,
            });
        }
        catch (error) {
            if (error instanceof PermissionError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    error: error.code,
                });
            }
            else {
                console.error("Erreur lors de la récupération des permissions:", error);
                res.status(500).json({
                    success: false,
                    message: "Erreur interne du serveur",
                    error: "INTERNAL_SERVER_ERROR",
                });
            }
        }
    }
    /**
     * Récupérer une permission par ID
     * GET /api/permissions/:id
     */
    static async getPermissionById(req, res) {
        try {
            const permissionId = parseInt(req.params.id);
            if (isNaN(permissionId)) {
                res.status(400).json({
                    success: false,
                    message: "ID de la permission invalide",
                    error: "INVALID_PERMISSION_ID",
                });
                return;
            }
            const permission = await PermissionService.getPermissionById(permissionId);
            if (!permission) {
                res.status(404).json({
                    success: false,
                    message: "Permission non trouvée",
                    error: "PERMISSION_NOT_FOUND",
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: "Permission récupérée avec succès",
                data: permission,
            });
        }
        catch (error) {
            if (error instanceof PermissionError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    error: error.code,
                });
            }
            else {
                console.error("Erreur lors de la récupération de la permission:", error);
                res.status(500).json({
                    success: false,
                    message: "Erreur interne du serveur",
                    error: "INTERNAL_SERVER_ERROR",
                });
            }
        }
    }
    /**
     * Récupérer une permission par libellé
     * GET /api/permissions/by-label/:label
     */
    static async getPermissionByLabel(req, res) {
        try {
            const permissionLabel = req.params.label;
            if (!permissionLabel || permissionLabel.trim().length === 0) {
                res.status(400).json({
                    success: false,
                    message: "Libellé de la permission requis",
                    error: "PERMISSION_LABEL_REQUIRED",
                });
                return;
            }
            const permission = await PermissionService.getPermissionByLabel(permissionLabel);
            if (!permission) {
                res.status(404).json({
                    success: false,
                    message: "Permission non trouvée",
                    error: "PERMISSION_NOT_FOUND",
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: "Permission récupérée avec succès",
                data: permission,
            });
        }
        catch (error) {
            if (error instanceof PermissionError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    error: error.code,
                });
            }
            else {
                console.error("Erreur lors de la récupération de la permission:", error);
                res.status(500).json({
                    success: false,
                    message: "Erreur interne du serveur",
                    error: "INTERNAL_SERVER_ERROR",
                });
            }
        }
    }
    /**
     * Mettre à jour une permission
     * PUT /api/permissions/:id
     */
    static async updatePermission(req, res) {
        try {
            const permissionId = parseInt(req.params.id);
            const updateData = req.body;
            if (isNaN(permissionId)) {
                res.status(400).json({
                    success: false,
                    message: "ID de la permission invalide",
                    error: "INVALID_PERMISSION_ID",
                });
                return;
            }
            const updatedPermission = await PermissionService.updatePermission(permissionId, updateData);
            res.status(200).json({
                success: true,
                message: "Permission mise à jour avec succès",
                data: updatedPermission,
            });
        }
        catch (error) {
            if (error instanceof PermissionError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    error: error.code,
                });
            }
            else {
                console.error("Erreur lors de la mise à jour de la permission:", error);
                res.status(500).json({
                    success: false,
                    message: "Erreur interne du serveur",
                    error: "INTERNAL_SERVER_ERROR",
                });
            }
        }
    }
    /**
     * Supprimer une permission
     * DELETE /api/permissions/:id
     */
    static async deletePermission(req, res) {
        try {
            const permissionId = parseInt(req.params.id);
            if (isNaN(permissionId)) {
                res.status(400).json({
                    success: false,
                    message: "ID de la permission invalide",
                    error: "INVALID_PERMISSION_ID",
                });
                return;
            }
            await PermissionService.deletePermission(permissionId);
            res.status(200).json({
                success: true,
                message: "Permission supprimée avec succès",
            });
        }
        catch (error) {
            if (error instanceof PermissionError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    error: error.code,
                });
            }
            else {
                console.error("Erreur lors de la suppression de la permission:", error);
                res.status(500).json({
                    success: false,
                    message: "Erreur interne du serveur",
                    error: "INTERNAL_SERVER_ERROR",
                });
            }
        }
    }
    /**
     * Rechercher des permissions
     * GET /api/permissions/search
     */
    static async searchPermissions(req, res) {
        try {
            const searchTerm = req.query.q;
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            if (!searchTerm || searchTerm.trim().length === 0) {
                res.status(400).json({
                    success: false,
                    message: "Terme de recherche requis",
                    error: "SEARCH_TERM_REQUIRED",
                });
                return;
            }
            const permissions = await PermissionService.searchPermissions(searchTerm, limit);
            res.status(200).json({
                success: true,
                message: "Recherche effectuée avec succès",
                data: permissions,
            });
        }
        catch (error) {
            if (error instanceof PermissionError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    error: error.code,
                });
            }
            else {
                console.error("Erreur lors de la recherche de permissions:", error);
                res.status(500).json({
                    success: false,
                    message: "Erreur interne du serveur",
                    error: "INTERNAL_SERVER_ERROR",
                });
            }
        }
    }
    /**
     * Récupérer les statistiques des permissions
     * GET /api/permissions/stats
     */
    static async getPermissionStats(req, res) {
        try {
            const stats = await PermissionService.getPermissionStats();
            res.status(200).json({
                success: true,
                message: "Statistiques récupérées avec succès",
                data: stats,
            });
        }
        catch (error) {
            if (error instanceof PermissionError) {
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
     * Récupérer les permissions par ordre alphabétique
     * GET /api/permissions/alphabetical
     */
    static async getPermissionsAlphabetically(req, res) {
        try {
            const permissions = await PermissionService.getPermissionsAlphabetically();
            res.status(200).json({
                success: true,
                message: "Permissions récupérées par ordre alphabétique",
                data: permissions,
            });
        }
        catch (error) {
            if (error instanceof PermissionError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    error: error.code,
                });
            }
            else {
                console.error("Erreur lors de la récupération des permissions:", error);
                res.status(500).json({
                    success: false,
                    message: "Erreur interne du serveur",
                    error: "INTERNAL_SERVER_ERROR",
                });
            }
        }
    }
    /**
     * Récupérer les permissions par catégorie d'action
     * GET /api/permissions/by-category/:category
     */
    static async getPermissionsByActionCategory(req, res) {
        try {
            const category = req.params.category;
            if (!category || category.trim().length === 0) {
                res.status(400).json({
                    success: false,
                    message: "Catégorie d'action requise",
                    error: "ACTION_CATEGORY_REQUIRED",
                });
                return;
            }
            const permissions = await PermissionService.getPermissionsByActionCategory(category);
            res.status(200).json({
                success: true,
                message: "Permissions récupérées par catégorie",
                data: permissions,
            });
        }
        catch (error) {
            if (error instanceof PermissionError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    error: error.code,
                });
            }
            else {
                console.error("Erreur lors de la récupération des permissions par catégorie:", error);
                res.status(500).json({
                    success: false,
                    message: "Erreur interne du serveur",
                    error: "INTERNAL_SERVER_ERROR",
                });
            }
        }
    }
    /**
     * Vérifier si une permission existe
     * GET /api/permissions/:id/exists
     */
    static async checkPermissionExists(req, res) {
        try {
            const permissionId = parseInt(req.params.id);
            if (isNaN(permissionId)) {
                res.status(400).json({
                    success: false,
                    message: "ID de la permission invalide",
                    error: "INVALID_PERMISSION_ID",
                });
                return;
            }
            const exists = await PermissionService.permissionExists(permissionId);
            res.status(200).json({
                success: true,
                message: "Vérification effectuée",
                data: { exists },
            });
        }
        catch (error) {
            if (error instanceof PermissionError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    error: error.code,
                });
            }
            else {
                console.error("Erreur lors de la vérification de la permission:", error);
                res.status(500).json({
                    success: false,
                    message: "Erreur interne du serveur",
                    error: "INTERNAL_SERVER_ERROR",
                });
            }
        }
    }
}
//# sourceMappingURL=PermissionController.js.map