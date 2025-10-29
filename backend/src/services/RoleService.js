import { Role } from "../models/Role.js";
import { Op } from "sequelize";
// Erreurs métier personnalisées
export class RoleError extends Error {
    code;
    statusCode;
    constructor(message, code, statusCode = 400) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = "RoleError";
    }
}
export class RoleService {
    /**
     * Créer un nouveau rôle
     */
    static async createRole(roleData) {
        try {
            // Validation des données
            if (!roleData.name || roleData.name.trim().length === 0) {
                throw new RoleError("Le nom du rôle est requis", "ROLE_NAME_REQUIRED", 400);
            }
            if (!roleData.description || roleData.description.trim().length === 0) {
                throw new RoleError("La description du rôle est requise", "ROLE_DESCRIPTION_REQUIRED", 400);
            }
            // Vérifier si le rôle existe déjà
            const existingRole = await Role.findOne({
                where: {
                    name: roleData.name.trim().toLowerCase(),
                },
            });
            if (existingRole) {
                throw new RoleError("Un rôle avec ce nom existe déjà", "ROLE_ALREADY_EXISTS", 409);
            }
            // Créer le rôle
            const newRole = await Role.create({
                name: roleData.name.trim().toLowerCase(),
                description: roleData.description.trim(),
            });
            return {
                id: newRole.dataValues.id,
                name: newRole.dataValues.name,
                description: newRole.dataValues.description,
                createdAt: newRole.dataValues.created_at,
                updatedAt: newRole.dataValues.updated_at,
            };
        }
        catch (error) {
            if (error instanceof RoleError) {
                throw error;
            }
            throw new RoleError("Erreur lors de la création du rôle", "CREATE_ROLE_ERROR", 500);
        }
    }
    /**
     * Récupérer tous les rôles avec filtres optionnels
     */
    static async getAllRoles(filters = {}) {
        try {
            const { search, limit = 20, offset = 0 } = filters;
            // Construction de la condition de recherche
            const whereCondition = {};
            if (search) {
                whereCondition[Op.or] = [
                    {
                        name: {
                            [Op.iLike]: `%${search}%`,
                        },
                    },
                    {
                        description: {
                            [Op.iLike]: `%${search}%`,
                        },
                    },
                ];
            }
            // Requête avec pagination
            const { rows: roles, count: total } = await Role.findAndCountAll({
                where: whereCondition,
                limit: Number(limit),
                offset: Number(offset),
                order: [["name", "ASC"]],
                attributes: ["id", "name", "description", "created_at", "updated_at"],
            });
            const rolesList = roles.map((role) => ({
                id: role.dataValues.id,
                name: role.dataValues.name,
                description: role.dataValues.description,
                createdAt: role.dataValues.created_at,
                updatedAt: role.dataValues.updated_at,
            }));
            return {
                roles: rolesList,
                total,
                page: Math.floor(offset / limit) + 1,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            throw new RoleError("Erreur lors de la récupération des rôles", "GET_ROLES_ERROR", 500);
        }
    }
    /**
     * Récupérer un rôle par ID
     */
    static async getRoleById(roleId) {
        try {
            const role = await Role.findByPk(roleId, {
                attributes: ["id", "name", "description", "created_at", "updated_at"],
            });
            if (!role) {
                return null;
            }
            return {
                id: role.dataValues.id,
                name: role.dataValues.name,
                description: role.dataValues.description,
                createdAt: role.dataValues.created_at,
                updatedAt: role.dataValues.updated_at,
            };
        }
        catch (error) {
            throw new RoleError("Erreur lors de la récupération du rôle", "GET_ROLE_ERROR", 500);
        }
    }
    /**
     * Récupérer un rôle par nom
     */
    static async getRoleByName(roleName) {
        try {
            const role = await Role.findOne({
                where: {
                    name: roleName.toLowerCase(),
                },
                attributes: ["id", "name", "description", "created_at", "updated_at"],
            });
            if (!role) {
                return null;
            }
            return {
                id: role.dataValues.id,
                name: role.dataValues.name,
                description: role.dataValues.description,
                createdAt: role.dataValues.created_at,
                updatedAt: role.dataValues.updated_at,
            };
        }
        catch (error) {
            throw new RoleError("Erreur lors de la récupération du rôle", "GET_ROLE_ERROR", 500);
        }
    }
    /**
     * Mettre à jour un rôle
     */
    static async updateRole(roleId, updateData) {
        try {
            // Vérifier que le rôle existe
            const role = await Role.findByPk(roleId);
            if (!role) {
                throw new RoleError("Rôle non trouvé", "ROLE_NOT_FOUND", 404);
            }
            // Validation des données
            if (updateData.name !== undefined &&
                updateData.name.trim().length === 0) {
                throw new RoleError("Le nom du rôle ne peut pas être vide", "ROLE_NAME_REQUIRED", 400);
            }
            if (updateData.description !== undefined &&
                updateData.description.trim().length === 0) {
                throw new RoleError("La description du rôle ne peut pas être vide", "ROLE_DESCRIPTION_REQUIRED", 400);
            }
            // Vérifier les doublons si on modifie le nom
            if (updateData.name !== undefined) {
                const newName = updateData.name.trim().toLowerCase();
                const existingRole = await Role.findOne({
                    where: {
                        name: newName,
                        id: { [Op.not]: roleId },
                    },
                });
                if (existingRole) {
                    throw new RoleError("Un rôle avec ce nom existe déjà", "ROLE_ALREADY_EXISTS", 409);
                }
            }
            // Préparer les données de mise à jour
            const dataToUpdate = {};
            if (updateData.name !== undefined) {
                dataToUpdate.name = updateData.name.trim().toLowerCase();
            }
            if (updateData.description !== undefined) {
                dataToUpdate.description = updateData.description.trim();
            }
            // Mettre à jour
            await Role.update(dataToUpdate, {
                where: { id: roleId },
            });
            // Récupérer le rôle mis à jour
            const updatedRole = await Role.findByPk(roleId, {
                attributes: ["id", "name", "description", "created_at", "updated_at"],
            });
            return {
                id: updatedRole.dataValues.id,
                name: updatedRole.dataValues.name,
                description: updatedRole.dataValues.description,
                createdAt: updatedRole.dataValues.created_at,
                updatedAt: updatedRole.dataValues.updated_at,
            };
        }
        catch (error) {
            if (error instanceof RoleError) {
                throw error;
            }
            throw new RoleError("Erreur lors de la mise à jour du rôle", "UPDATE_ROLE_ERROR", 500);
        }
    }
    /**
     * Supprimer un rôle
     */
    static async deleteRole(roleId) {
        try {
            const role = await Role.findByPk(roleId);
            if (!role) {
                throw new RoleError("Rôle non trouvé", "ROLE_NOT_FOUND", 404);
            }
            // Vérifier que ce n'est pas un rôle système critique
            const systemRoles = ["admin", "user", "moderator"];
            if (systemRoles.includes(role.dataValues.name)) {
                throw new RoleError("Impossible de supprimer un rôle système", "SYSTEM_ROLE_DELETION_FORBIDDEN", 403);
            }
            // TODO: Vérifier s'il y a des utilisateurs associés à ce rôle
            // avant de permettre la suppression
            await Role.destroy({
                where: { id: roleId },
            });
        }
        catch (error) {
            if (error instanceof RoleError) {
                throw error;
            }
            throw new RoleError("Erreur lors de la suppression du rôle", "DELETE_ROLE_ERROR", 500);
        }
    }
    /**
     * Rechercher des rôles par nom
     */
    static async searchRoles(searchTerm, limit = 10) {
        try {
            if (!searchTerm || searchTerm.trim().length === 0) {
                return [];
            }
            const roles = await Role.findAll({
                where: {
                    [Op.or]: [
                        {
                            name: {
                                [Op.iLike]: `%${searchTerm.trim()}%`,
                            },
                        },
                        {
                            description: {
                                [Op.iLike]: `%${searchTerm.trim()}%`,
                            },
                        },
                    ],
                },
                limit: Number(limit),
                order: [["name", "ASC"]],
                attributes: ["id", "name", "description"],
            });
            return roles.map((role) => ({
                id: role.dataValues.id,
                name: role.dataValues.name,
                description: role.dataValues.description,
            }));
        }
        catch (error) {
            throw new RoleError("Erreur lors de la recherche de rôles", "SEARCH_ROLES_ERROR", 500);
        }
    }
    /**
     * Statistiques des rôles
     */
    static async getRoleStats() {
        try {
            const totalRoles = await Role.count();
            // Compter les rôles système
            const systemRoles = await Role.count({
                where: {
                    name: {
                        [Op.in]: ["admin", "user", "moderator"],
                    },
                },
            });
            const customRoles = totalRoles - systemRoles;
            // TODO: Implémenter le comptage avec les utilisateurs quand la relation sera définie
            const rolesWithUsers = 0;
            return {
                totalRoles,
                systemRoles,
                customRoles,
                rolesWithUsers,
            };
        }
        catch (error) {
            throw new RoleError("Erreur lors de la récupération des statistiques", "GET_STATS_ERROR", 500);
        }
    }
    /**
     * Vérifier si un rôle existe
     */
    static async roleExists(roleId) {
        try {
            const role = await Role.findByPk(roleId);
            return !!role;
        }
        catch (error) {
            throw new RoleError("Erreur lors de la vérification du rôle", "CHECK_ROLE_ERROR", 500);
        }
    }
    /**
     * Récupérer les rôles par défaut du système
     */
    static async getDefaultRoles() {
        try {
            const defaultRoleNames = ["admin", "user", "moderator"];
            const roles = await Role.findAll({
                where: {
                    name: {
                        [Op.in]: defaultRoleNames,
                    },
                },
                order: [["name", "ASC"]],
                attributes: ["id", "name", "description", "created_at"],
            });
            return roles.map((role) => ({
                id: role.dataValues.id,
                name: role.dataValues.name,
                description: role.dataValues.description,
                createdAt: role.dataValues.created_at,
            }));
        }
        catch (error) {
            throw new RoleError("Erreur lors de la récupération des rôles par défaut", "GET_DEFAULT_ROLES_ERROR", 500);
        }
    }
}
//# sourceMappingURL=RoleService.js.map