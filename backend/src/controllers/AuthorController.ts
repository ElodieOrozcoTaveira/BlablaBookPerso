import type { Response } from "express";
import type { SessionRequest } from "../middlewares/sessionMiddleware.js";
import {
  AuthorService,
  AuthorError,
  type CreateAuthorData,
  type UpdateAuthorData,
  type AuthorSearchFilters,
} from "../services/AuthorService.js";

/**
 * CONTRÔLEUR DES AUTEURS
 *
 * Gère les requêtes HTTP liées aux auteurs
 * Utilise AuthorService pour la logique métier
 */
export class AuthorController {
  /**
   * POST /api/authors
   * Créer un nouvel auteur
   */
  static async createAuthor(req: SessionRequest, res: Response): Promise<void> {
    try {
      const { firstname, lastname }: CreateAuthorData = req.body;

      // Validation des données d'entrée
      if (!lastname) {
        res.status(400).json({
          success: false,
          message: "Le nom de famille est requis",
          code: "LASTNAME_REQUIRED",
        });
        return;
      }

      const authorData: CreateAuthorData = {
        lastname: lastname.trim(),
      };

      if (firstname) {
        authorData.firstname = firstname.trim();
      }

      const newAuthor = await AuthorService.createAuthor(authorData);

      res.status(201).json({
        success: true,
        message: "Auteur créé avec succès",
        data: newAuthor,
      });
    } catch (error) {
      console.error("❌ Erreur lors de la création de l'auteur:", error);

      if (error instanceof AuthorError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Erreur interne lors de la création de l'auteur",
      });
    }
  }

  /**
   * GET /api/authors
   * Récupérer tous les auteurs avec filtres optionnels
   */
  static async getAllAuthors(
    req: SessionRequest,
    res: Response
  ): Promise<void> {
    try {
      const { search, page = 1, limit = 20 } = req.query;

      const filters: AuthorSearchFilters = {
        search: search as string,
        limit: Number(limit),
        offset: (Number(page) - 1) * Number(limit),
      };

      const result = await AuthorService.getAllAuthors(filters);

      res.status(200).json({
        success: true,
        message: "Auteurs récupérés avec succès",
        data: result.authors,
        pagination: {
          page: result.page,
          limit: Number(limit),
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des auteurs:", error);

      if (error instanceof AuthorError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Erreur interne lors de la récupération des auteurs",
      });
    }
  }

  /**
   * GET /api/authors/:id
   * Récupérer un auteur par ID
   */
  static async getAuthorById(
    req: SessionRequest,
    res: Response
  ): Promise<void> {
    try {
      const authorId = parseInt(req.params.id || "");

      if (isNaN(authorId)) {
        res.status(400).json({
          success: false,
          message: "ID d'auteur invalide",
          code: "INVALID_AUTHOR_ID",
        });
        return;
      }

      const author = await AuthorService.getAuthorById(authorId);

      if (!author) {
        res.status(404).json({
          success: false,
          message: "Auteur non trouvé",
          code: "AUTHOR_NOT_FOUND",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Auteur récupéré avec succès",
        data: author,
      });
    } catch (error) {
      console.error("❌ Erreur lors de la récupération de l'auteur:", error);

      if (error instanceof AuthorError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Erreur interne lors de la récupération de l'auteur",
      });
    }
  }

  /**
   * PUT /api/authors/:id
   * Mettre à jour un auteur
   */
  static async updateAuthor(req: SessionRequest, res: Response): Promise<void> {
    try {
      const authorId = parseInt(req.params.id || "");

      if (isNaN(authorId)) {
        res.status(400).json({
          success: false,
          message: "ID d'auteur invalide",
          code: "INVALID_AUTHOR_ID",
        });
        return;
      }

      const { firstname, lastname }: UpdateAuthorData = req.body;

      // Validation: au moins un champ doit être fourni
      if (firstname === undefined && lastname === undefined) {
        res.status(400).json({
          success: false,
          message: "Au moins un champ (firstname ou lastname) doit être fourni",
          code: "NO_UPDATE_DATA",
        });
        return;
      }

      const updateData: UpdateAuthorData = {};
      if (firstname !== undefined) {
        updateData.firstname = firstname;
      }
      if (lastname !== undefined) {
        updateData.lastname = lastname;
      }

      const updatedAuthor = await AuthorService.updateAuthor(
        authorId,
        updateData
      );

      res.status(200).json({
        success: true,
        message: "Auteur mis à jour avec succès",
        data: updatedAuthor,
      });
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour de l'auteur:", error);

      if (error instanceof AuthorError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Erreur interne lors de la mise à jour de l'auteur",
      });
    }
  }

  /**
   * DELETE /api/authors/:id
   * Supprimer un auteur
   */
  static async deleteAuthor(req: SessionRequest, res: Response): Promise<void> {
    try {
      const authorId = parseInt(req.params.id || "");

      if (isNaN(authorId)) {
        res.status(400).json({
          success: false,
          message: "ID d'auteur invalide",
          code: "INVALID_AUTHOR_ID",
        });
        return;
      }

      await AuthorService.deleteAuthor(authorId);

      res.status(200).json({
        success: true,
        message: "Auteur supprimé avec succès",
      });
    } catch (error) {
      console.error("❌ Erreur lors de la suppression de l'auteur:", error);

      if (error instanceof AuthorError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Erreur interne lors de la suppression de l'auteur",
      });
    }
  }

  /**
   * GET /api/authors/search
   * Rechercher des auteurs par nom
   */
  static async searchAuthors(
    req: SessionRequest,
    res: Response
  ): Promise<void> {
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

      const authors = await AuthorService.searchAuthors(
        searchTerm as string,
        Number(limit)
      );

      res.status(200).json({
        success: true,
        message: "Recherche effectuée avec succès",
        data: authors,
      });
    } catch (error) {
      console.error("❌ Erreur lors de la recherche d'auteurs:", error);

      if (error instanceof AuthorError) {
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
   * GET /api/authors/stats
   * Statistiques des auteurs
   */
  static async getAuthorStats(
    req: SessionRequest,
    res: Response
  ): Promise<void> {
    try {
      const stats = await AuthorService.getAuthorStats();

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

      if (error instanceof AuthorError) {
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
}
