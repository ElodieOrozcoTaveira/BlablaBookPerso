import { RolePermission } from "../models/RolePermission.js";
import { Op } from "sequelize";
export class RolePermissionError extends Error {
    code;
    statusCode;
    constructor(message, code, statusCode = 400) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = "RolePermissionError";
    }
}
export class RolePermissionService {
    /**
     * Assigner une permission à un rôle
     */
    static async assignPermissionToRole(data) {
        try {
            // Vérifier si l'association existe déjà
            const existing = await RolePermission.findOne({
                where: {
                    id_role: data.roleId,
                    id_permission: data.permissionId,
                },
            });
            if (existing) {
                throw new RolePermissionError("Cette permission est déjà assignée à ce rôle", "PERMISSION_ALREADY_ASSIGNED", 409);
            }
            const rolePermission = await RolePermission.create({
                id_role: data.roleId,
                id_permission: data.permissionId,
            });
            return {
                id: rolePermission.dataValues.id,
                roleId: rolePermission.dataValues.id_role,
                permissionId: rolePermission.dataValues.id_permission,
            };
        }
        catch (error) {
            if (error instanceof RolePermissionError) {
                throw error;
            }
            throw new RolePermissionError("Erreur lors de l'assignation de la permission", "ASSIGN_PERMISSION_ERROR", 500);
        }
    }
    /**
     * Retirer une permission d'un rôle
     */
    static async removePermissionFromRole(roleId, permissionId) {
        try {
            const result = await RolePermission.destroy({
                where: {
                    id_role: roleId,
                    id_permission: permissionId,
                },
            });
            if (result === 0) {
                throw new RolePermissionError("Association rôle-permission non trouvée", "ROLE_PERMISSION_NOT_FOUND", 404);
            }
        }
        catch (error) {
            if (error instanceof RolePermissionError) {
                throw error;
            }
            throw new RolePermissionError("Erreur lors de la suppression de la permission", "REMOVE_PERMISSION_ERROR", 500);
        }
    }
    /**
     * Récupérer toutes les permissions d'un rôle
     */
    static async getRolePermissions(roleId) {
        try {
            const rolePermissions = await RolePermission.findAll({
                where: { id_role: roleId },
            });
            return rolePermissions.map((rp) => ({
                id: rp.dataValues.id,
                roleId: rp.dataValues.id_role,
                permissionId: rp.dataValues.id_permission,
            }));
        }
        catch (error) {
            throw new RolePermissionError("Erreur lors de la récupération des permissions du rôle", "GET_ROLE_PERMISSIONS_ERROR", 500);
        }
    }
    /**
     * Récupérer tous les rôles qui ont une permission donnée
     */
    static async getPermissionRoles(permissionId) {
        try {
            const rolePermissions = await RolePermission.findAll({
                where: { id_permission: permissionId },
            });
            return rolePermissions.map((rp) => ({
                id: rp.dataValues.id,
                roleId: rp.dataValues.id_role,
                permissionId: rp.dataValues.id_permission,
            }));
        }
        catch (error) {
            throw new RolePermissionError("Erreur lors de la récupération des rôles de la permission", "GET_PERMISSION_ROLES_ERROR", 500);
        }
    }
}
//# sourceMappingURL=RolePermissionService.js.map