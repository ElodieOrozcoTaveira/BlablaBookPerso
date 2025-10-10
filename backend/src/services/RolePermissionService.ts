import { RolePermission } from "../models/RolePermission.js";
import { Op } from "sequelize";

/**
 * SERVICE DES PERMISSIONS DE RÔLES
 *
 * Gère l'association entre les rôles et leurs permissions (RBAC)
 * Table de liaison pour le système de contrôle d'accès basé sur les rôles
 */

export interface RolePermissionData {
  id: number;
  roleId: number;
  permissionId: number;
}

export interface CreateRolePermissionData {
  roleId: number;
  permissionId: number;
}

export class RolePermissionError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "RolePermissionError";
  }
}

export class RolePermissionService {
  /**
   * Assigner une permission à un rôle
   */
  static async assignPermissionToRole(
    data: CreateRolePermissionData
  ): Promise<RolePermissionData> {
    try {
      // Vérifier si l'association existe déjà
      const existing = await RolePermission.findOne({
        where: {
          id_role: data.roleId,
          id_permission: data.permissionId,
        },
      });

      if (existing) {
        throw new RolePermissionError(
          "Cette permission est déjà assignée à ce rôle",
          "PERMISSION_ALREADY_ASSIGNED",
          409
        );
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
    } catch (error) {
      if (error instanceof RolePermissionError) {
        throw error;
      }
      throw new RolePermissionError(
        "Erreur lors de l'assignation de la permission",
        "ASSIGN_PERMISSION_ERROR",
        500
      );
    }
  }

  /**
   * Retirer une permission d'un rôle
   */
  static async removePermissionFromRole(
    roleId: number,
    permissionId: number
  ): Promise<void> {
    try {
      const result = await RolePermission.destroy({
        where: {
          id_role: roleId,
          id_permission: permissionId,
        },
      });

      if (result === 0) {
        throw new RolePermissionError(
          "Association rôle-permission non trouvée",
          "ROLE_PERMISSION_NOT_FOUND",
          404
        );
      }
    } catch (error) {
      if (error instanceof RolePermissionError) {
        throw error;
      }
      throw new RolePermissionError(
        "Erreur lors de la suppression de la permission",
        "REMOVE_PERMISSION_ERROR",
        500
      );
    }
  }

  /**
   * Récupérer toutes les permissions d'un rôle
   */
  static async getRolePermissions(
    roleId: number
  ): Promise<RolePermissionData[]> {
    try {
      const rolePermissions = await RolePermission.findAll({
        where: { id_role: roleId },
      });

      return rolePermissions.map((rp) => ({
        id: rp.dataValues.id,
        roleId: rp.dataValues.id_role,
        permissionId: rp.dataValues.id_permission,
      }));
    } catch (error) {
      throw new RolePermissionError(
        "Erreur lors de la récupération des permissions du rôle",
        "GET_ROLE_PERMISSIONS_ERROR",
        500
      );
    }
  }

  /**
   * Récupérer tous les rôles qui ont une permission donnée
   */
  static async getPermissionRoles(
    permissionId: number
  ): Promise<RolePermissionData[]> {
    try {
      const rolePermissions = await RolePermission.findAll({
        where: { id_permission: permissionId },
      });

      return rolePermissions.map((rp) => ({
        id: rp.dataValues.id,
        roleId: rp.dataValues.id_role,
        permissionId: rp.dataValues.id_permission,
      }));
    } catch (error) {
      throw new RolePermissionError(
        "Erreur lors de la récupération des rôles de la permission",
        "GET_PERMISSION_ROLES_ERROR",
        500
      );
    }
  }
}
