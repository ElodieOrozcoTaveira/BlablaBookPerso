import type { Request, Response } from "express";
import { NoticeService, NoticeError } from "../services/NoticeService.js";
import type {
  CreateNoticeData,
  UpdateNoticeData,
  NoticeSearchFilters,
} from "../services/NoticeService.js";

/**
 * CONTRÔLEUR DES AVIS
 *
 * Gère les requêtes HTTP liées aux avis des utilisateurs
 * Fait le lien entre les routes Express et le NoticeService
 */

export class NoticeController {
  /**
   * Créer un nouvel avis
   * POST /api/notices
   */
  static async createNotice(req: Request, res: Response): Promise<void> {
    try {
      const noticeData: CreateNoticeData = req.body;

      const newNotice = await NoticeService.createNotice(noticeData);

      res.status(201).json({
        success: true,
        message: "Avis créé avec succès",
        data: newNotice,
      });
    } catch (error) {
      if (error instanceof NoticeError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
        console.error("Erreur lors de la création de l'avis:", error);
        res.status(500).json({
          success: false,
          message: "Erreur interne du serveur",
          error: "INTERNAL_SERVER_ERROR",
        });
      }
    }
  }

  /**
   * Récupérer tous les avis avec filtres
   * GET /api/notices
   */
  static async getAllNotices(req: Request, res: Response): Promise<void> {
    try {
      const filters: NoticeSearchFilters = {};

      if (req.query.search) {
        filters.search = req.query.search as string;
      }

      if (req.query.limit) {
        filters.limit = parseInt(req.query.limit as string);
      }

      if (req.query.offset) {
        filters.offset = parseInt(req.query.offset as string);
      }

      const result = await NoticeService.getAllNotices(filters);

      res.status(200).json({
        success: true,
        message: "Avis récupérés avec succès",
        data: result,
      });
    } catch (error) {
      if (error instanceof NoticeError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
        console.error("Erreur lors de la récupération des avis:", error);
        res.status(500).json({
          success: false,
          message: "Erreur interne du serveur",
          error: "INTERNAL_SERVER_ERROR",
        });
      }
    }
  }

  /**
   * Récupérer un avis par ID
   * GET /api/notices/:id
   */
  static async getNoticeById(req: Request, res: Response): Promise<void> {
    try {
      const noticeId = parseInt(req.params.id as string);

      if (isNaN(noticeId)) {
        res.status(400).json({
          success: false,
          message: "ID de l'avis invalide",
          error: "INVALID_NOTICE_ID",
        });
        return;
      }

      const notice = await NoticeService.getNoticeById(noticeId);

      if (!notice) {
        res.status(404).json({
          success: false,
          message: "Avis non trouvé",
          error: "NOTICE_NOT_FOUND",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Avis récupéré avec succès",
        data: notice,
      });
    } catch (error) {
      if (error instanceof NoticeError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
        console.error("Erreur lors de la récupération de l'avis:", error);
        res.status(500).json({
          success: false,
          message: "Erreur interne du serveur",
          error: "INTERNAL_SERVER_ERROR",
        });
      }
    }
  }

  /**
   * Mettre à jour un avis
   * PUT /api/notices/:id
   */
  static async updateNotice(req: Request, res: Response): Promise<void> {
    try {
      const noticeId = parseInt(req.params.id as string);
      const updateData: UpdateNoticeData = req.body;

      if (isNaN(noticeId)) {
        res.status(400).json({
          success: false,
          message: "ID de l'avis invalide",
          error: "INVALID_NOTICE_ID",
        });
        return;
      }

      const updatedNotice = await NoticeService.updateNotice(
        noticeId,
        updateData
      );

      res.status(200).json({
        success: true,
        message: "Avis mis à jour avec succès",
        data: updatedNotice,
      });
    } catch (error) {
      if (error instanceof NoticeError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
        console.error("Erreur lors de la mise à jour de l'avis:", error);
        res.status(500).json({
          success: false,
          message: "Erreur interne du serveur",
          error: "INTERNAL_SERVER_ERROR",
        });
      }
    }
  }

  /**
   * Supprimer un avis
   * DELETE /api/notices/:id
   */
  static async deleteNotice(req: Request, res: Response): Promise<void> {
    try {
      const noticeId = parseInt(req.params.id as string);

      if (isNaN(noticeId)) {
        res.status(400).json({
          success: false,
          message: "ID de l'avis invalide",
          error: "INVALID_NOTICE_ID",
        });
        return;
      }

      await NoticeService.deleteNotice(noticeId);

      res.status(200).json({
        success: true,
        message: "Avis supprimé avec succès",
      });
    } catch (error) {
      if (error instanceof NoticeError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
        console.error("Erreur lors de la suppression de l'avis:", error);
        res.status(500).json({
          success: false,
          message: "Erreur interne du serveur",
          error: "INTERNAL_SERVER_ERROR",
        });
      }
    }
  }

  /**
   * Rechercher des avis
   * GET /api/notices/search
   */
  static async searchNotices(req: Request, res: Response): Promise<void> {
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

      const notices = await NoticeService.searchNotices(searchTerm, limit);

      res.status(200).json({
        success: true,
        message: "Recherche effectuée avec succès",
        data: notices,
      });
    } catch (error) {
      if (error instanceof NoticeError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
        console.error("Erreur lors de la recherche d'avis:", error);
        res.status(500).json({
          success: false,
          message: "Erreur interne du serveur",
          error: "INTERNAL_SERVER_ERROR",
        });
      }
    }
  }

  /**
   * Récupérer les statistiques des avis
   * GET /api/notices/stats
   */
  static async getNoticeStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await NoticeService.getNoticeStats();

      res.status(200).json({
        success: true,
        message: "Statistiques récupérées avec succès",
        data: stats,
      });
    } catch (error) {
      if (error instanceof NoticeError) {
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
   * Récupérer les avis récents
   * GET /api/notices/recent
   */
  static async getRecentNotices(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const notices = await NoticeService.getRecentNotices(limit);

      res.status(200).json({
        success: true,
        message: "Avis récents récupérés avec succès",
        data: notices,
      });
    } catch (error) {
      if (error instanceof NoticeError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
        console.error(
          "Erreur lors de la récupération des avis récents:",
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
   * Vérifier si un avis existe
   * GET /api/notices/:id/exists
   */
  static async checkNoticeExists(req: Request, res: Response): Promise<void> {
    try {
      const noticeId = parseInt(req.params.id as string);

      if (isNaN(noticeId)) {
        res.status(400).json({
          success: false,
          message: "ID de l'avis invalide",
          error: "INVALID_NOTICE_ID",
        });
        return;
      }

      const exists = await NoticeService.noticeExists(noticeId);

      res.status(200).json({
        success: true,
        message: "Vérification effectuée",
        data: { exists },
      });
    } catch (error) {
      if (error instanceof NoticeError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
        console.error("Erreur lors de la vérification de l'avis:", error);
        res.status(500).json({
          success: false,
          message: "Erreur interne du serveur",
          error: "INTERNAL_SERVER_ERROR",
        });
      }
    }
  }
}
