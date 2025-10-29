import { Permissions } from "../models/Permissions.js";
import { Op } from "sequelize";
// Erreurs métier personnalisées
export class PermissionError extends Error {
    code;
    statusCode;
    constructor(message, code, statusCode = 400) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = "PermissionError";
    }
}
export class PermissionService {
    /**
     * Créer une nouvelle permission
     */
    static async createPermission(permissionData) {
        try {
            // Validation des données
            if (!permissionData.label || permissionData.label.trim().length === 0) {
                throw new PermissionError("Le libellé de la permission est requis", "PERMISSION_LABEL_REQUIRED", 400);
            }
            // Vérifier si la permission existe déjà
            const existingPermission = await Permissions.findOne({
                where: {
                    label: permissionData.label.trim().toLowerCase(),
                },
            });
            if (existingPermission) {
                throw new PermissionError("Une permission avec ce libellé existe déjà", "PERMISSION_ALREADY_EXISTS", 409);
            }
            // Créer la permission
            const newPermission = await Permissions.create({
                label: permissionData.label.trim().toLowerCase(),
                action: permissionData.action?.trim() || null,
            });
            return {
                id: newPermission.dataValues.id,
                label: newPermission.dataValues.label,
                action: newPermission.dataValues.action,
                createdAt: newPermission.dataValues.createdAt,
                updatedAt: newPermission.dataValues.updatedAt,
            };
        }
        catch (error) {
            if (error instanceof PermissionError) {
                throw error;
            }
            throw new PermissionError("Erreur lors de la création de la permission", "CREATE_PERMISSION_ERROR", 500);
        }
    }
    /**
     * Récupérer toutes les permissions avec filtres optionnels
     */
    static async getAllPermissions(filters = {}) {
        try {
            const { search, limit = 20, offset = 0 } = filters;
            // Construction de la condition de recherche
            const whereCondition = {};
            if (search) {
                whereCondition[Op.or] = [
                    { label: { [Op.iLike]: `%${search}%` } },
                    { action: { [Op.iLike]: `%${search}%` } },
                ];
            }
            // Requête avec pagination
            const { rows: permissions, count: total } = await Permissions.findAndCountAll({
                where: whereCondition,
                limit: Number(limit),
                offset: Number(offset),
                order: [["label", "ASC"]],
                attributes: ["id", "label", "action"],
            });
            const permissionsList = permissions.map((permission) => ({
                id: permission.dataValues.id,
                label: permission.dataValues.label,
                action: permission.dataValues.action,
            }));
            return {
                permissions: permissionsList,
                total,
                page: Math.floor(offset / limit) + 1,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            throw new PermissionError("Erreur lors de la récupération des permissions", "GET_PERMISSIONS_ERROR", 500);
        }
    }
    /**
     * Récupérer une permission par ID
     */
    static async getPermissionById(permissionId) {
        try {
            const permission = await Permissions.findByPk(permissionId, {
                attributes: ["id", "label", "action"],
            });
            if (!permission) {
                return null;
            }
            return {
                id: permission.dataValues.id,
                label: permission.dataValues.label,
                action: permission.dataValues.action,
            };
        }
        catch (error) {
            throw new PermissionError("Erreur lors de la récupération de la permission", "GET_PERMISSION_ERROR", 500);
        }
    }
    /**
     * Récupérer une permission par libellé
     */
    static async getPermissionByLabel(permissionLabel) {
        try {
            const permission = await Permissions.findOne({
                where: {
                    label: permissionLabel.toLowerCase(),
                },
                attributes: ["id", "label", "action"],
            });
            if (!permission) {
                return null;
            }
            return {
                id: permission.dataValues.id,
                label: permission.dataValues.label,
                action: permission.dataValues.action,
            };
        }
        catch (error) {
            throw new PermissionError("Erreur lors de la récupération de la permission", "GET_PERMISSION_ERROR", 500);
        }
    }
    /**
     * Mettre à jour une permission
     */
    static async updatePermission(permissionId, updateData) {
        try {
            // Vérifier que la permission existe
            const permission = await Permissions.findByPk(permissionId);
            if (!permission) {
                throw new PermissionError("Permission non trouvée", "PERMISSION_NOT_FOUND", 404);
            }
            // Validation des données
            if (updateData.label !== undefined &&
                updateData.label.trim().length === 0) {
                throw new PermissionError("Le libellé de la permission ne peut pas être vide", "PERMISSION_LABEL_REQUIRED", 400);
            }
            // Vérifier les doublons si on modifie le libellé
            if (updateData.label !== undefined) {
                const newLabel = updateData.label.trim().toLowerCase();
                const existingPermission = await Permissions.findOne({
                    where: {
                        label: newLabel,
                        id: { [Op.not]: permissionId },
                    },
                });
                if (existingPermission) {
                    throw new PermissionError("Une permission avec ce libellé existe déjà", "PERMISSION_ALREADY_EXISTS", 409);
                }
            }
            // Préparer les données de mise à jour
            const dataToUpdate = {};
            if (updateData.label !== undefined) {
                dataToUpdate.label = updateData.label.trim().toLowerCase();
            }
            if (updateData.action !== undefined) {
                dataToUpdate.action = updateData.action?.trim() || null;
            }
            // Mettre à jour
            await Permissions.update(dataToUpdate, {
                where: { id: permissionId },
            });
            // Récupérer la permission mise à jour
            const updatedPermission = await Permissions.findByPk(permissionId, {
                attributes: ["id", "label", "action"],
            });
            return {
                id: updatedPermission.dataValues.id,
                label: updatedPermission.dataValues.label,
                action: updatedPermission.dataValues.action,
            };
        }
        catch (error) {
            if (error instanceof PermissionError) {
                throw error;
            }
            throw new PermissionError("Erreur lors de la mise à jour de la permission", "UPDATE_PERMISSION_ERROR", 500);
        }
    }
    /**
     * Supprimer une permission
     */
    static async deletePermission(permissionId) {
        try {
            const permission = await Permissions.findByPk(permissionId);
            if (!permission) {
                throw new PermissionError("Permission non trouvée", "PERMISSION_NOT_FOUND", 404);
            }
            // TODO: Vérifier s'il y a des rôles associés à cette permission
            // avant de permettre la suppression
            await Permissions.destroy({
                where: { id: permissionId },
            });
        }
        catch (error) {
            if (error instanceof PermissionError) {
                throw error;
            }
            throw new PermissionError("Erreur lors de la suppression de la permission", "DELETE_PERMISSION_ERROR", 500);
        }
    }
    /**
     * Rechercher des permissions par libellé ou action
     */
    static async searchPermissions(searchTerm, limit = 10) {
        try {
            if (!searchTerm || searchTerm.trim().length === 0) {
                return [];
            }
            const permissions = await Permissions.findAll({
                where: {
                    [Op.or]: [
                        { label: { [Op.iLike]: `%${searchTerm.trim()}%` } },
                        { action: { [Op.iLike]: `%${searchTerm.trim()}%` } },
                    ],
                },
                limit: Number(limit),
                order: [["label", "ASC"]],
                attributes: ["id", "label", "action"],
            });
            return permissions.map((permission) => ({
                id: permission.dataValues.id,
                label: permission.dataValues.label,
                action: permission.dataValues.action,
            }));
        }
        catch (error) {
            throw new PermissionError("Erreur lors de la recherche de permissions", "SEARCH_PERMISSIONS_ERROR", 500);
        }
    }
    /**
     * Statistiques des permissions
     */
    static async getPermissionStats() {
        try {
            const totalPermissions = await Permissions.count();
            const permissionsWithAction = await Permissions.count({
                where: {
                    action: { [Op.not]: null },
                },
            });
            const permissionsWithoutAction = totalPermissions - permissionsWithAction;
            return {
                totalPermissions,
                permissionsWithAction,
                permissionsWithoutAction,
            };
        }
        catch (error) {
            throw new PermissionError("Erreur lors de la récupération des statistiques", "GET_STATS_ERROR", 500);
        }
    }
    /**
     * Vérifier si une permission existe
     */
    static async permissionExists(permissionId) {
        try {
            const permission = await Permissions.findByPk(permissionId);
            return !!permission;
        }
        catch (error) {
            throw new PermissionError("Erreur lors de la vérification de la permission", "CHECK_PERMISSION_ERROR", 500);
        }
    }
    /**
     * Récupérer toutes les permissions par ordre alphabétique
     */
    static async getPermissionsAlphabetically() {
        try {
            const permissions = await Permissions.findAll({
                order: [["label", "ASC"]],
                attributes: ["id", "label", "action"],
            });
            return permissions.map((permission) => ({
                id: permission.dataValues.id,
                label: permission.dataValues.label,
                action: permission.dataValues.action,
            }));
        }
        catch (error) {
            throw new PermissionError("Erreur lors de la récupération des permissions", "GET_ALPHABETICAL_PERMISSIONS_ERROR", 500);
        }
    }
    /**
     * Récupérer les permissions par catégorie d'action
     */
    static async getPermissionsByActionCategory(category) {
        try {
            const permissions = await Permissions.findAll({
                where: {
                    action: { [Op.iLike]: `%${category}%` },
                },
                order: [["label", "ASC"]],
                attributes: ["id", "label", "action"],
            });
            return permissions.map((permission) => ({
                id: permission.dataValues.id,
                label: permission.dataValues.label,
                action: permission.dataValues.action,
            }));
        }
        catch (error) {
            throw new PermissionError("Erreur lors de la récupération des permissions par catégorie", "GET_PERMISSIONS_BY_CATEGORY_ERROR", 500);
        }
    }
}
//# sourceMappingURL=PermissionService.js.map