import type { Response } from "express";
import type { SessionRequest } from "../middlewares/sessionMiddleware.js";
import {
  RoleService,
  RoleError,
  type CreateRoleData,
  type UpdateRoleData,
  type RoleSearchFilters,
} from "../services/RoleService.js";

/**
 * CONTRÔLEUR DES RÔLES
 *
 * Gère les requêtes HTTP liées aux rôles
 * Utilise RoleService pour la logique métier
 */
export class RoleController {
  /**
   * POST /api/roles
   * Créer un nouveau rôle
   */
  static async createRole(req: SessionRequest, res: Response): Promise<void> {
    try {
      const { name, description }: CreateRoleData = req.body;

      // Validation des données d'entrée
      if (!name) {
        res.status(400).json({
          success: false,
          message: "Le nom du rôle est requis",
          code: "ROLE_NAME_REQUIRED",
        });
        return;
      }

      if (!description) {
        res.status(400).json({
          success: false,
          message: "La description du rôle est requise",
          code: "ROLE_DESCRIPTION_REQUIRED",
        });
        return;
      }

      const roleData: CreateRoleData = {
        name: name.trim(),
        description: description.trim(),
      };

      const newRole = await RoleService.createRole(roleData);

      res.status(201).json({
        success: true,
        message: "Rôle créé avec succès",
        data: newRole,
      });
    } catch (error) {
      console.error("❌ Erreur lors de la création du rôle:", error);

      if (error instanceof RoleError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Erreur interne lors de la création du rôle",
      });
    }
  }

  /**
   * GET /api/roles
   * Récupérer tous les rôles avec filtres optionnels
   */
  static async getAllRoles(req: SessionRequest, res: Response): Promise<void> {
    try {
      const { search, page = 1, limit = 20 } = req.query;

      const filters: RoleSearchFilters = {
        search: search as string,
        limit: Number(limit),
        offset: (Number(page) - 1) * Number(limit),
      };

      const result = await RoleService.getAllRoles(filters);

      res.status(200).json({
        success: true,
        message: "Rôles récupérés avec succès",
        data: result.roles,
        pagination: {
          page: result.page,
          limit: Number(limit),
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des rôles:", error);

      if (error instanceof RoleError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Erreur interne lors de la récupération des rôles",
      });
    }
  }

  /**
   * GET /api/roles/:id
   * Récupérer un rôle par ID
   */
  static async getRoleById(req: SessionRequest, res: Response): Promise<void> {
    try {
      const roleId = parseInt(req.params.id || "");

      if (isNaN(roleId)) {
        res.status(400).json({
          success: false,
          message: "ID de rôle invalide",
          code: "INVALID_ROLE_ID",
        });
        return;
      }

      const role = await RoleService.getRoleById(roleId);

      if (!role) {
        res.status(404).json({
          success: false,
          message: "Rôle non trouvé",
          code: "ROLE_NOT_FOUND",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Rôle récupéré avec succès",
        data: role,
      });
    } catch (error) {
      console.error("❌ Erreur lors de la récupération du rôle:", error);

      if (error instanceof RoleError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Erreur interne lors de la récupération du rôle",
      });
    }
  }

  /**
   * GET /api/roles/name/:name
   * Récupérer un rôle par nom
   */
  static async getRoleByName(
    req: SessionRequest,
    res: Response
  ): Promise<void> {
    try {
      const roleName = req.params.name;

      if (!roleName) {
        res.status(400).json({
          success: false,
          message: "Nom de rôle requis",
          code: "ROLE_NAME_REQUIRED",
        });
        return;
      }

      const role = await RoleService.getRoleByName(roleName);

      if (!role) {
        res.status(404).json({
          success: false,
          message: "Rôle non trouvé",
          code: "ROLE_NOT_FOUND",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Rôle récupéré avec succès",
        data: role,
      });
    } catch (error) {
      console.error("❌ Erreur lors de la récupération du rôle:", error);

      if (error instanceof RoleError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Erreur interne lors de la récupération du rôle",
      });
    }
  }

  /**
   * PUT /api/roles/:id
   * Mettre à jour un rôle
   */
  static async updateRole(req: SessionRequest, res: Response): Promise<void> {
    try {
      const roleId = parseInt(req.params.id || "");

      if (isNaN(roleId)) {
        res.status(400).json({
          success: false,
          message: "ID de rôle invalide",
          code: "INVALID_ROLE_ID",
        });
        return;
      }

      const { name, description }: UpdateRoleData = req.body;

      // Validation: au moins un champ doit être fourni
      if (name === undefined && description === undefined) {
        res.status(400).json({
          success: false,
          message: "Au moins un champ (name ou description) doit être fourni",
          code: "NO_UPDATE_DATA",
        });
        return;
      }

      const updateData: UpdateRoleData = {};
      if (name !== undefined) {
        updateData.name = name;
      }
      if (description !== undefined) {
        updateData.description = description;
      }

      const updatedRole = await RoleService.updateRole(roleId, updateData);

      res.status(200).json({
        success: true,
        message: "Rôle mis à jour avec succès",
        data: updatedRole,
      });
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour du rôle:", error);

      if (error instanceof RoleError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Erreur interne lors de la mise à jour du rôle",
      });
    }
  }

  /**
   * DELETE /api/roles/:id
   * Supprimer un rôle
   */
  static async deleteRole(req: SessionRequest, res: Response): Promise<void> {
    try {
      const roleId = parseInt(req.params.id || "");

      if (isNaN(roleId)) {
        res.status(400).json({
          success: false,
          message: "ID de rôle invalide",
          code: "INVALID_ROLE_ID",
        });
        return;
      }

      await RoleService.deleteRole(roleId);

      res.status(200).json({
        success: true,
        message: "Rôle supprimé avec succès",
      });
    } catch (error) {
      console.error("❌ Erreur lors de la suppression du rôle:", error);

      if (error instanceof RoleError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Erreur interne lors de la suppression du rôle",
      });
    }
  }

  /**
   * GET /api/roles/search
   * Rechercher des rôles par nom ou description
   */
  static async searchRoles(req: SessionRequest, res: Response): Promise<void> {
    try {
      const { q: searchTerm, limit = 10 } = req.query;

      if (!searchTerm) {
        res.status(400).json({
          success: false,
          message: "Terme de recherche requis",
          code: "SEARCH_TERM_REQUIRED",
        });
        return;
      }

      const roles = await RoleService.searchRoles(
        searchTerm as string,
        Number(limit)
      );

      res.status(200).json({
        success: true,
        message: "Recherche effectuée avec succès",
        data: roles,
      });
    } catch (error) {
      console.error("❌ Erreur lors de la recherche de rôles:", error);

      if (error instanceof RoleError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Erreur interne lors de la recherche",
      });
    }
  }

  /**
   * GET /api/roles/stats
   * Statistiques des rôles
   */
  static async getRoleStats(req: SessionRequest, res: Response): Promise<void> {
    try {
      const stats = await RoleService.getRoleStats();

      res.status(200).json({
        success: true,
        message: "Statistiques récupérées avec succès",
        data: stats,
      });
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des statistiques:",
        error
      );

      if (error instanceof RoleError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Erreur interne lors de la récupération des statistiques",
      });
    }
  }

  /**
   * GET /api/roles/default
   * Récupérer les rôles par défaut du système
   */
  static async getDefaultRoles(
    req: SessionRequest,
    res: Response
  ): Promise<void> {
    try {
      const defaultRoles = await RoleService.getDefaultRoles();

      res.status(200).json({
        success: true,
        message: "Rôles par défaut récupérés avec succès",
        data: defaultRoles,
      });
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des rôles par défaut:",
        error
      );

      if (error instanceof RoleError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Erreur interne lors de la récupération des rôles par défaut",
      });
    }
  }
}
