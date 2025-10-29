import { UserRole } from "../models/UserRole.js";
import { Op } from "sequelize";
export class UserRoleError extends Error {
    code;
    statusCode;
    constructor(message, code, statusCode = 400) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = "UserRoleError";
    }
}
export class UserRoleService {
    /**
     * Assigner un rôle à un utilisateur
     */
    static async assignRoleToUser(data) {
        try {
            // Vérifier si l'association existe déjà
            const existing = await UserRole.findOne({
                where: {
                    id_user: data.userId,
                    id_role: data.roleId,
                },
            });
            if (existing) {
                throw new UserRoleError("Ce rôle est déjà assigné à cet utilisateur", "ROLE_ALREADY_ASSIGNED", 409);
            }
            const userRole = await UserRole.create({
                id_user: data.userId,
                id_role: data.roleId,
            });
            return {
                id: userRole.dataValues.id,
                userId: userRole.dataValues.id_user,
                roleId: userRole.dataValues.id_role,
                assignedAt: userRole.dataValues.assigned_at,
            };
        }
        catch (error) {
            if (error instanceof UserRoleError) {
                throw error;
            }
            throw new UserRoleError("Erreur lors de l'assignation du rôle", "ASSIGN_ROLE_ERROR", 500);
        }
    }
    /**
     * Retirer un rôle d'un utilisateur
     */
    static async removeRoleFromUser(userId, roleId) {
        try {
            const result = await UserRole.destroy({
                where: {
                    id_user: userId,
                    id_role: roleId,
                },
            });
            if (result === 0) {
                throw new UserRoleError("Association utilisateur-rôle non trouvée", "USER_ROLE_NOT_FOUND", 404);
            }
        }
        catch (error) {
            if (error instanceof UserRoleError) {
                throw error;
            }
            throw new UserRoleError("Erreur lors de la suppression du rôle", "REMOVE_ROLE_ERROR", 500);
        }
    }
    /**
     * Récupérer tous les rôles d'un utilisateur
     */
    static async getUserRoles(userId) {
        try {
            const userRoles = await UserRole.findAll({
                where: { id_user: userId },
            });
            return userRoles.map((ur) => ({
                id: ur.dataValues.id,
                userId: ur.dataValues.id_user,
                roleId: ur.dataValues.id_role,
                assignedAt: ur.dataValues.assigned_at,
            }));
        }
        catch (error) {
            throw new UserRoleError("Erreur lors de la récupération des rôles utilisateur", "GET_USER_ROLES_ERROR", 500);
        }
    }
    /**
     * Récupérer tous les utilisateurs qui ont un rôle donné
     */
    static async getRoleUsers(roleId) {
        try {
            const userRoles = await UserRole.findAll({
                where: { id_role: roleId },
            });
            return userRoles.map((ur) => ({
                id: ur.dataValues.id,
                userId: ur.dataValues.id_user,
                roleId: ur.dataValues.id_role,
                assignedAt: ur.dataValues.assigned_at,
            }));
        }
        catch (error) {
            throw new UserRoleError("Erreur lors de la récupération des utilisateurs du rôle", "GET_ROLE_USERS_ERROR", 500);
        }
    }
    /**
     * Vérifier si un utilisateur a un rôle spécifique
     */
    static async userHasRole(userId, roleId) {
        try {
            const userRole = await UserRole.findOne({
                where: {
                    id_user: userId,
                    id_role: roleId,
                },
            });
            return !!userRole;
        }
        catch (error) {
            throw new UserRoleError("Erreur lors de la vérification du rôle", "CHECK_USER_ROLE_ERROR", 500);
        }
    }
    /**
     * Remplacer tous les rôles d'un utilisateur
     */
    static async replaceUserRoles(userId, roleIds) {
        try {
            // Supprimer tous les rôles existants
            await UserRole.destroy({
                where: { id_user: userId },
            });
            // Ajouter les nouveaux rôles
            const newUserRoles = [];
            for (const roleId of roleIds) {
                const userRole = await this.assignRoleToUser({ userId, roleId });
                newUserRoles.push(userRole);
            }
            return newUserRoles;
        }
        catch (error) {
            if (error instanceof UserRoleError) {
                throw error;
            }
            throw new UserRoleError("Erreur lors du remplacement des rôles", "REPLACE_USER_ROLES_ERROR", 500);
        }
    }
}
//# sourceMappingURL=UserRoleService.js.map