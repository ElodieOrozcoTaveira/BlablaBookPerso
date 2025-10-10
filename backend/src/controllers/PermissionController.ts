import type { Request, Response } from "express";
import {
  PermissionService,
  PermissionError,
} from "../services/PermissionService.js";
import type {
  CreatePermissionData,
  UpdatePermissionData,
  PermissionSearchFilters,
} from "../services/PermissionService.js";

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
  static async createPermission(req: Request, res: Response): Promise<void> {
    try {
      const permissionData: CreatePermissionData = req.body;

      const newPermission = await PermissionService.createPermission(
        permissionData
      );

      res.status(201).json({
        success: true,
        message: "Permission créée avec succès",
        data: newPermission,
      });
    } catch (error) {
      if (error instanceof PermissionError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
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
  static async getAllPermissions(req: Request, res: Response): Promise<void> {
    try {
      const filters: PermissionSearchFilters = {};

      if (req.query.search) {
        filters.search = req.query.search as string;
      }

      if (req.query.limit) {
        filters.limit = parseInt(req.query.limit as string);
      }

      if (req.query.offset) {
        filters.offset = parseInt(req.query.offset as string);
      }

      const result = await PermissionService.getAllPermissions(filters);

      res.status(200).json({
        success: true,
        message: "Permissions récupérées avec succès",
        data: result,
      });
    } catch (error) {
      if (error instanceof PermissionError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
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
  static async getPermissionById(req: Request, res: Response): Promise<void> {
    try {
      const permissionId = parseInt(req.params.id as string);

      if (isNaN(permissionId)) {
        res.status(400).json({
          success: false,
          message: "ID de la permission invalide",
          error: "INVALID_PERMISSION_ID",
        });
        return;
      }

      const permission = await PermissionService.getPermissionById(
        permissionId
      );

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
    } catch (error) {
      if (error instanceof PermissionError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
        console.error(
          "Erreur lors de la récupération de la permission:",
          error
        );
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
  static async getPermissionByLabel(
    req: Request,
    res: Response
  ): Promise<void> {
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

      const permission = await PermissionService.getPermissionByLabel(
        permissionLabel
      );

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
    } catch (error) {
      if (error instanceof PermissionError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
        console.error(
          "Erreur lors de la récupération de la permission:",
          error
        );
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
  static async updatePermission(req: Request, res: Response): Promise<void> {
    try {
      const permissionId = parseInt(req.params.id as string);
      const updateData: UpdatePermissionData = req.body;

      if (isNaN(permissionId)) {
        res.status(400).json({
          success: false,
          message: "ID de la permission invalide",
          error: "INVALID_PERMISSION_ID",
        });
        return;
      }

      const updatedPermission = await PermissionService.updatePermission(
        permissionId,
        updateData
      );

      res.status(200).json({
        success: true,
        message: "Permission mise à jour avec succès",
        data: updatedPermission,
      });
    } catch (error) {
      if (error instanceof PermissionError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
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
  static async deletePermission(req: Request, res: Response): Promise<void> {
    try {
      const permissionId = parseInt(req.params.id as string);

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
    } catch (error) {
      if (error instanceof PermissionError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
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
  static async searchPermissions(req: Request, res: Response): Promise<void> {
    try {
      const searchTerm = req.query.q as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      if (!searchTerm || searchTerm.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: "Terme de recherche requis",
          error: "SEARCH_TERM_REQUIRED",
        });
        return;
      }

      const permissions = await PermissionService.searchPermissions(
        searchTerm,
        limit
      );

      res.status(200).json({
        success: true,
        message: "Recherche effectuée avec succès",
        data: permissions,
      });
    } catch (error) {
      if (error instanceof PermissionError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
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
  static async getPermissionStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await PermissionService.getPermissionStats();

      res.status(200).json({
        success: true,
        message: "Statistiques récupérées avec succès",
        data: stats,
      });
    } catch (error) {
      if (error instanceof PermissionError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
        console.error(
          "Erreur lors de la récupération des statistiques:",
          error
        );
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
  static async getPermissionsAlphabetically(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const permissions =
        await PermissionService.getPermissionsAlphabetically();

      res.status(200).json({
        success: true,
        message: "Permissions récupérées par ordre alphabétique",
        data: permissions,
      });
    } catch (error) {
      if (error instanceof PermissionError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
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
  static async getPermissionsByActionCategory(
    req: Request,
    res: Response
  ): Promise<void> {
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

      const permissions =
        await PermissionService.getPermissionsByActionCategory(category);

      res.status(200).json({
        success: true,
        message: "Permissions récupérées par catégorie",
        data: permissions,
      });
    } catch (error) {
      if (error instanceof PermissionError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
        console.error(
          "Erreur lors de la récupération des permissions par catégorie:",
          error
        );
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
  static async checkPermissionExists(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const permissionId = parseInt(req.params.id as string);

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
    } catch (error) {
      if (error instanceof PermissionError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
        console.error(
          "Erreur lors de la vérification de la permission:",
          error
        );
        res.status(500).json({
          success: false,
          message: "Erreur interne du serveur",
          error: "INTERNAL_SERVER_ERROR",
        });
      }
    }
  }
}
