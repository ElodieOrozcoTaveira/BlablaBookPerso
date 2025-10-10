import type { Request, Response } from "express";
import { RateService, RateError } from "../services/RateService.js";
import type {
  CreateRateData,
  UpdateRateData,
  RateSearchFilters,
} from "../services/RateService.js";

/**
 * CONTRÔLEUR DES NOTES
 *
 * Gère les requêtes HTTP liées aux notes/évaluations
 * Fait le lien entre les routes Express et le RateService
 */

export class RateController {
  /**
   * Créer une nouvelle note
   * POST /api/rates
   */
  static async createRate(req: Request, res: Response): Promise<void> {
    try {
      const rateData: CreateRateData = req.body;

      const newRate = await RateService.createRate(rateData);

      res.status(201).json({
        success: true,
        message: "Note créée avec succès",
        data: newRate,
      });
    } catch (error) {
      if (error instanceof RateError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
        console.error("Erreur lors de la création de la note:", error);
        res.status(500).json({
          success: false,
          message: "Erreur interne du serveur",
          error: "INTERNAL_SERVER_ERROR",
        });
      }
    }
  }

  /**
   * Récupérer toutes les notes avec filtres
   * GET /api/rates
   */
  static async getAllRates(req: Request, res: Response): Promise<void> {
    try {
      const filters: RateSearchFilters = {};

      if (req.query.userId) {
        filters.userId = parseInt(req.query.userId as string);
      }

      if (req.query.bookId) {
        filters.bookId = parseInt(req.query.bookId as string);
      }

      if (req.query.readingListId) {
        filters.readingListId = parseInt(req.query.readingListId as string);
      }

      if (req.query.minRate) {
        filters.minRate = parseInt(req.query.minRate as string);
      }

      if (req.query.maxRate) {
        filters.maxRate = parseInt(req.query.maxRate as string);
      }

      if (req.query.limit) {
        filters.limit = parseInt(req.query.limit as string);
      }

      if (req.query.offset) {
        filters.offset = parseInt(req.query.offset as string);
      }

      const result = await RateService.getAllRates(filters);

      res.status(200).json({
        success: true,
        message: "Notes récupérées avec succès",
        data: result,
      });
    } catch (error) {
      if (error instanceof RateError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
        console.error("Erreur lors de la récupération des notes:", error);
        res.status(500).json({
          success: false,
          message: "Erreur interne du serveur",
          error: "INTERNAL_SERVER_ERROR",
        });
      }
    }
  }

  /**
   * Récupérer une note par ID
   * GET /api/rates/:id
   */
  static async getRateById(req: Request, res: Response): Promise<void> {
    try {
      const rateId = parseInt(req.params.id as string);

      if (isNaN(rateId)) {
        res.status(400).json({
          success: false,
          message: "ID de la note invalide",
          error: "INVALID_RATE_ID",
        });
        return;
      }

      const rate = await RateService.getRateById(rateId);

      if (!rate) {
        res.status(404).json({
          success: false,
          message: "Note non trouvée",
          error: "RATE_NOT_FOUND",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Note récupérée avec succès",
        data: rate,
      });
    } catch (error) {
      if (error instanceof RateError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
        console.error("Erreur lors de la récupération de la note:", error);
        res.status(500).json({
          success: false,
          message: "Erreur interne du serveur",
          error: "INTERNAL_SERVER_ERROR",
        });
      }
    }
  }

  /**
   * Récupérer la note d'un utilisateur pour un livre
   * GET /api/rates/user/:userId/book/:bookId
   */
  static async getUserRateForBook(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId as string);
      const bookId = parseInt(req.params.bookId as string);

      if (isNaN(userId) || isNaN(bookId)) {
        res.status(400).json({
          success: false,
          message: "ID utilisateur ou livre invalide",
          error: "INVALID_IDS",
        });
        return;
      }

      const rate = await RateService.getUserRateForBook(userId, bookId);

      if (!rate) {
        res.status(404).json({
          success: false,
          message: "Aucune note trouvée pour cet utilisateur et ce livre",
          error: "RATE_NOT_FOUND",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Note récupérée avec succès",
        data: rate,
      });
    } catch (error) {
      if (error instanceof RateError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
        console.error("Erreur lors de la récupération de la note:", error);
        res.status(500).json({
          success: false,
          message: "Erreur interne du serveur",
          error: "INTERNAL_SERVER_ERROR",
        });
      }
    }
  }

  /**
   * Mettre à jour une note
   * PUT /api/rates/:id
   */
  static async updateRate(req: Request, res: Response): Promise<void> {
    try {
      const rateId = parseInt(req.params.id as string);
      const updateData: UpdateRateData = req.body;

      if (isNaN(rateId)) {
        res.status(400).json({
          success: false,
          message: "ID de la note invalide",
          error: "INVALID_RATE_ID",
        });
        return;
      }

      const updatedRate = await RateService.updateRate(rateId, updateData);

      res.status(200).json({
        success: true,
        message: "Note mise à jour avec succès",
        data: updatedRate,
      });
    } catch (error) {
      if (error instanceof RateError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
        console.error("Erreur lors de la mise à jour de la note:", error);
        res.status(500).json({
          success: false,
          message: "Erreur interne du serveur",
          error: "INTERNAL_SERVER_ERROR",
        });
      }
    }
  }

  /**
   * Supprimer une note
   * DELETE /api/rates/:id
   */
  static async deleteRate(req: Request, res: Response): Promise<void> {
    try {
      const rateId = parseInt(req.params.id as string);

      if (isNaN(rateId)) {
        res.status(400).json({
          success: false,
          message: "ID de la note invalide",
          error: "INVALID_RATE_ID",
        });
        return;
      }

      await RateService.deleteRate(rateId);

      res.status(200).json({
        success: true,
        message: "Note supprimée avec succès",
      });
    } catch (error) {
      if (error instanceof RateError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
        console.error("Erreur lors de la suppression de la note:", error);
        res.status(500).json({
          success: false,
          message: "Erreur interne du serveur",
          error: "INTERNAL_SERVER_ERROR",
        });
      }
    }
  }

  /**
   * Calculer la moyenne des notes pour un livre
   * GET /api/rates/book/:bookId/average
   */
  static async getBookAverageRate(req: Request, res: Response): Promise<void> {
    try {
      const bookId = parseInt(req.params.bookId as string);

      if (isNaN(bookId)) {
        res.status(400).json({
          success: false,
          message: "ID du livre invalide",
          error: "INVALID_BOOK_ID",
        });
        return;
      }

      const result = await RateService.getBookAverageRate(bookId);

      res.status(200).json({
        success: true,
        message: "Moyenne calculée avec succès",
        data: result,
      });
    } catch (error) {
      if (error instanceof RateError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
        console.error("Erreur lors du calcul de la moyenne:", error);
        res.status(500).json({
          success: false,
          message: "Erreur interne du serveur",
          error: "INTERNAL_SERVER_ERROR",
        });
      }
    }
  }

  /**
   * Récupérer les statistiques des notes
   * GET /api/rates/stats
   */
  static async getRateStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await RateService.getRateStats();

      res.status(200).json({
        success: true,
        message: "Statistiques récupérées avec succès",
        data: stats,
      });
    } catch (error) {
      if (error instanceof RateError) {
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
   * Récupérer les notes récentes
   * GET /api/rates/recent
   */
  static async getRecentRates(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const rates = await RateService.getRecentRates(limit);

      res.status(200).json({
        success: true,
        message: "Notes récentes récupérées avec succès",
        data: rates,
      });
    } catch (error) {
      if (error instanceof RateError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
        console.error(
          "Erreur lors de la récupération des notes récentes:",
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
   * Vérifier si une note existe
   * GET /api/rates/:id/exists
   */
  static async checkRateExists(req: Request, res: Response): Promise<void> {
    try {
      const rateId = parseInt(req.params.id as string);

      if (isNaN(rateId)) {
        res.status(400).json({
          success: false,
          message: "ID de la note invalide",
          error: "INVALID_RATE_ID",
        });
        return;
      }

      const exists = await RateService.rateExists(rateId);

      res.status(200).json({
        success: true,
        message: "Vérification effectuée",
        data: { exists },
      });
    } catch (error) {
      if (error instanceof RateError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
        console.error("Erreur lors de la vérification de la note:", error);
        res.status(500).json({
          success: false,
          message: "Erreur interne du serveur",
          error: "INTERNAL_SERVER_ERROR",
        });
      }
    }
  }
}
