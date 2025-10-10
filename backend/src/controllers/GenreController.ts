import type { Request, Response } from "express";
import { GenreService, GenreError } from "../services/GenreService.js";
import type {
  CreateGenreData,
  UpdateGenreData,
  GenreSearchFilters,
} from "../services/GenreService.js";

/**
 * CONTRÔLEUR DES GENRES
 *
 * Gère les requêtes HTTP liées aux genres
 * Fait le lien entre les routes Express et le GenreService
 */

export class GenreController {
  /**
   * Créer un nouveau genre
   * POST /api/genres
   */
  static async createGenre(req: Request, res: Response): Promise<void> {
    try {
      const genreData: CreateGenreData = req.body;

      const newGenre = await GenreService.createGenre(genreData);

      res.status(201).json({
        success: true,
        message: "Genre créé avec succès",
        data: newGenre,
      });
    } catch (error) {
      if (error instanceof GenreError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
        console.error("Erreur lors de la création du genre:", error);
        res.status(500).json({
          success: false,
          message: "Erreur interne du serveur",
          error: "INTERNAL_SERVER_ERROR",
        });
      }
    }
  }

  /**
   * Récupérer tous les genres avec filtres
   * GET /api/genres
   */
  static async getAllGenres(req: Request, res: Response): Promise<void> {
    try {
      const filters: GenreSearchFilters = {};

      if (req.query.search) {
        filters.search = req.query.search as string;
      }

      if (req.query.limit) {
        filters.limit = parseInt(req.query.limit as string);
      }

      if (req.query.offset) {
        filters.offset = parseInt(req.query.offset as string);
      }

      const result = await GenreService.getAllGenres(filters);

      res.status(200).json({
        success: true,
        message: "Genres récupérés avec succès",
        data: result,
      });
    } catch (error) {
      if (error instanceof GenreError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
        console.error("Erreur lors de la récupération des genres:", error);
        res.status(500).json({
          success: false,
          message: "Erreur interne du serveur",
          error: "INTERNAL_SERVER_ERROR",
        });
      }
    }
  }

  /**
   * Récupérer un genre par ID
   * GET /api/genres/:id
   */
  static async getGenreById(req: Request, res: Response): Promise<void> {
    try {
      const genreId = parseInt(req.params.id as string);

      if (isNaN(genreId)) {
        res.status(400).json({
          success: false,
          message: "ID du genre invalide",
          error: "INVALID_GENRE_ID",
        });
        return;
      }

      const genre = await GenreService.getGenreById(genreId);

      if (!genre) {
        res.status(404).json({
          success: false,
          message: "Genre non trouvé",
          error: "GENRE_NOT_FOUND",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Genre récupéré avec succès",
        data: genre,
      });
    } catch (error) {
      if (error instanceof GenreError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
        console.error("Erreur lors de la récupération du genre:", error);
        res.status(500).json({
          success: false,
          message: "Erreur interne du serveur",
          error: "INTERNAL_SERVER_ERROR",
        });
      }
    }
  }

  /**
   * Récupérer un genre par nom
   * GET /api/genres/by-name/:name
   */
  static async getGenreByName(req: Request, res: Response): Promise<void> {
    try {
      const genreName = req.params.name;

      if (!genreName || genreName.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: "Nom du genre requis",
          error: "GENRE_NAME_REQUIRED",
        });
        return;
      }

      const genre = await GenreService.getGenreByName(genreName);

      if (!genre) {
        res.status(404).json({
          success: false,
          message: "Genre non trouvé",
          error: "GENRE_NOT_FOUND",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Genre récupéré avec succès",
        data: genre,
      });
    } catch (error) {
      if (error instanceof GenreError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
        console.error("Erreur lors de la récupération du genre:", error);
        res.status(500).json({
          success: false,
          message: "Erreur interne du serveur",
          error: "INTERNAL_SERVER_ERROR",
        });
      }
    }
  }

  /**
   * Mettre à jour un genre
   * PUT /api/genres/:id
   */
  static async updateGenre(req: Request, res: Response): Promise<void> {
    try {
      const genreId = parseInt(req.params.id as string);
      const updateData: UpdateGenreData = req.body;

      if (isNaN(genreId)) {
        res.status(400).json({
          success: false,
          message: "ID du genre invalide",
          error: "INVALID_GENRE_ID",
        });
        return;
      }

      const updatedGenre = await GenreService.updateGenre(genreId, updateData);

      res.status(200).json({
        success: true,
        message: "Genre mis à jour avec succès",
        data: updatedGenre,
      });
    } catch (error) {
      if (error instanceof GenreError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
        console.error("Erreur lors de la mise à jour du genre:", error);
        res.status(500).json({
          success: false,
          message: "Erreur interne du serveur",
          error: "INTERNAL_SERVER_ERROR",
        });
      }
    }
  }

  /**
   * Supprimer un genre
   * DELETE /api/genres/:id
   */
  static async deleteGenre(req: Request, res: Response): Promise<void> {
    try {
      const genreId = parseInt(req.params.id as string);

      if (isNaN(genreId)) {
        res.status(400).json({
          success: false,
          message: "ID du genre invalide",
          error: "INVALID_GENRE_ID",
        });
        return;
      }

      await GenreService.deleteGenre(genreId);

      res.status(200).json({
        success: true,
        message: "Genre supprimé avec succès",
      });
    } catch (error) {
      if (error instanceof GenreError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
        console.error("Erreur lors de la suppression du genre:", error);
        res.status(500).json({
          success: false,
          message: "Erreur interne du serveur",
          error: "INTERNAL_SERVER_ERROR",
        });
      }
    }
  }

  /**
   * Rechercher des genres
   * GET /api/genres/search
   */
  static async searchGenres(req: Request, res: Response): Promise<void> {
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

      const genres = await GenreService.searchGenres(searchTerm, limit);

      res.status(200).json({
        success: true,
        message: "Recherche effectuée avec succès",
        data: genres,
      });
    } catch (error) {
      if (error instanceof GenreError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
        console.error("Erreur lors de la recherche de genres:", error);
        res.status(500).json({
          success: false,
          message: "Erreur interne du serveur",
          error: "INTERNAL_SERVER_ERROR",
        });
      }
    }
  }

  /**
   * Récupérer les statistiques des genres
   * GET /api/genres/stats
   */
  static async getGenreStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await GenreService.getGenreStats();

      res.status(200).json({
        success: true,
        message: "Statistiques récupérées avec succès",
        data: stats,
      });
    } catch (error) {
      if (error instanceof GenreError) {
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
   * Récupérer les genres populaires
   * GET /api/genres/popular
   */
  static async getPopularGenres(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const genres = await GenreService.getPopularGenres(limit);

      res.status(200).json({
        success: true,
        message: "Genres populaires récupérés avec succès",
        data: genres,
      });
    } catch (error) {
      if (error instanceof GenreError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
        console.error(
          "Erreur lors de la récupération des genres populaires:",
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
   * Récupérer les genres par ordre alphabétique
   * GET /api/genres/alphabetical
   */
  static async getGenresAlphabetically(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const genres = await GenreService.getGenresAlphabetically();

      res.status(200).json({
        success: true,
        message: "Genres récupérés par ordre alphabétique",
        data: genres,
      });
    } catch (error) {
      if (error instanceof GenreError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
        console.error("Erreur lors de la récupération des genres:", error);
        res.status(500).json({
          success: false,
          message: "Erreur interne du serveur",
          error: "INTERNAL_SERVER_ERROR",
        });
      }
    }
  }

  /**
   * Vérifier si un genre existe
   * GET /api/genres/:id/exists
   */
  static async checkGenreExists(req: Request, res: Response): Promise<void> {
    try {
      const genreId = parseInt(req.params.id as string);

      if (isNaN(genreId)) {
        res.status(400).json({
          success: false,
          message: "ID du genre invalide",
          error: "INVALID_GENRE_ID",
        });
        return;
      }

      const exists = await GenreService.genreExists(genreId);

      res.status(200).json({
        success: true,
        message: "Vérification effectuée",
        data: { exists },
      });
    } catch (error) {
      if (error instanceof GenreError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      } else {
        console.error("Erreur lors de la vérification du genre:", error);
        res.status(500).json({
          success: false,
          message: "Erreur interne du serveur",
          error: "INTERNAL_SERVER_ERROR",
        });
      }
    }
  }
}
