import type { Response } from "express";
import { LibraryService, LibraryError } from "../services/LibraryService.js";
import type { SessionRequest } from "../middlewares/sessionMiddleware.js";

/**
 * CONTRÔLEUR POUR LA GESTION DES BIBLIOTHÈQUES
 *
 * Gère les requêtes HTTP liées aux bibliothèques utilisateur
 * Fait le lien entre les routes et les services
 */

export class LibraryController {
  /**
   * POST /api/libraries
   * Créer une nouvelle bibliothèque
   */
  static async createLibrary(
    req: SessionRequest,
    res: Response
  ): Promise<void> {
    try {
      const sessionUser = req.session.user;

      if (!sessionUser) {
        res.status(401).json({
          success: false,
          message: "Session invalide",
          code: "INVALID_SESSION",
        });
        return;
      }

      const { name } = req.body;

      if (!name) {
        res.status(400).json({
          success: false,
          message: "Le nom de la bibliothèque est requis",
          code: "NAME_REQUIRED",
        });
        return;
      }

      const library = await LibraryService.createLibrary({
        name,
        id_user: sessionUser.id,
      });

      res.status(201).json({
        success: true,
        message: "Bibliothèque créée avec succès",
        data: library,
      });
    } catch (error) {
      console.error("❌ Erreur lors de la création de la bibliothèque:", error);

      if (error instanceof LibraryError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Erreur interne lors de la création de la bibliothèque",
      });
    }
  }

  /**
   * GET /api/libraries
   * Récupérer toutes les bibliothèques de l'utilisateur connecté
   */
  static async getUserLibraries(
    req: SessionRequest,
    res: Response
  ): Promise<void> {
    try {
      const sessionUser = req.session.user;

      if (!sessionUser) {
        res.status(401).json({
          success: false,
          message: "Session invalide",
          code: "INVALID_SESSION",
        });
        return;
      }

      // Récupération du paramètre de recherche optionnel
      const { search } = req.query;

      let libraries;
      if (search && typeof search === "string") {
        libraries = await LibraryService.searchLibraries(
          sessionUser.id,
          search
        );
      } else {
        libraries = await LibraryService.getUserLibraries(sessionUser.id);
      }

      res.status(200).json({
        success: true,
        message: "Bibliothèques récupérées avec succès",
        data: libraries,
        count: libraries.length,
      });
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des bibliothèques:",
        error
      );

      if (error instanceof LibraryError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Erreur interne lors de la récupération des bibliothèques",
      });
    }
  }

  /**
   * GET /api/libraries/:id
   * Récupérer une bibliothèque spécifique par ID
   */
  static async getLibraryById(
    req: SessionRequest,
    res: Response
  ): Promise<void> {
    try {
      const sessionUser = req.session.user;

      if (!sessionUser) {
        res.status(401).json({
          success: false,
          message: "Session invalide",
          code: "INVALID_SESSION",
        });
        return;
      }

      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "ID de bibliothèque manquant",
          code: "MISSING_ID",
        });
        return;
      }

      const libraryId = parseInt(id, 10);

      if (isNaN(libraryId)) {
        res.status(400).json({
          success: false,
          message: "ID de bibliothèque invalide",
          code: "INVALID_ID",
        });
        return;
      }

      const library = await LibraryService.getLibraryById(
        libraryId,
        sessionUser.id
      );

      if (!library) {
        res.status(404).json({
          success: false,
          message: "Bibliothèque non trouvée",
          code: "LIBRARY_NOT_FOUND",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Bibliothèque récupérée avec succès",
        data: library,
      });
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération de la bibliothèque:",
        error
      );

      if (error instanceof LibraryError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Erreur interne lors de la récupération de la bibliothèque",
      });
    }
  }

  /**
   * PUT /api/libraries/:id
   * Mettre à jour une bibliothèque
   */
  static async updateLibrary(
    req: SessionRequest,
    res: Response
  ): Promise<void> {
    try {
      const sessionUser = req.session.user;

      if (!sessionUser) {
        res.status(401).json({
          success: false,
          message: "Session invalide",
          code: "INVALID_SESSION",
        });
        return;
      }

      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "ID de bibliothèque manquant",
          code: "MISSING_ID",
        });
        return;
      }

      const libraryId = parseInt(id, 10);

      if (isNaN(libraryId)) {
        res.status(400).json({
          success: false,
          message: "ID de bibliothèque invalide",
          code: "INVALID_ID",
        });
        return;
      }

      const { name } = req.body;

      if (!name) {
        res.status(400).json({
          success: false,
          message: "Le nom de la bibliothèque est requis",
          code: "NAME_REQUIRED",
        });
        return;
      }

      const updatedLibrary = await LibraryService.updateLibrary(
        libraryId,
        sessionUser.id,
        { name }
      );

      if (!updatedLibrary) {
        res.status(404).json({
          success: false,
          message: "Bibliothèque non trouvée",
          code: "LIBRARY_NOT_FOUND",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Bibliothèque mise à jour avec succès",
        data: updatedLibrary,
      });
    } catch (error) {
      console.error(
        "❌ Erreur lors de la mise à jour de la bibliothèque:",
        error
      );

      if (error instanceof LibraryError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Erreur interne lors de la mise à jour de la bibliothèque",
      });
    }
  }

  /**
   * DELETE /api/libraries/:id
   * Supprimer une bibliothèque (soft delete)
   */
  static async deleteLibrary(
    req: SessionRequest,
    res: Response
  ): Promise<void> {
    try {
      const sessionUser = req.session.user;

      if (!sessionUser) {
        res.status(401).json({
          success: false,
          message: "Session invalide",
          code: "INVALID_SESSION",
        });
        return;
      }

      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "ID de bibliothèque manquant",
          code: "MISSING_ID",
        });
        return;
      }

      const libraryId = parseInt(id, 10);

      if (isNaN(libraryId)) {
        res.status(400).json({
          success: false,
          message: "ID de bibliothèque invalide",
          code: "INVALID_ID",
        });
        return;
      }

      const deleted = await LibraryService.deleteLibrary(
        libraryId,
        sessionUser.id
      );

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Bibliothèque non trouvée",
          code: "LIBRARY_NOT_FOUND",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Bibliothèque supprimée avec succès",
      });
    } catch (error) {
      console.error(
        "❌ Erreur lors de la suppression de la bibliothèque:",
        error
      );

      if (error instanceof LibraryError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Erreur interne lors de la suppression de la bibliothèque",
      });
    }
  }

  /**
   * GET /api/libraries/stats
   * Récupérer les statistiques des bibliothèques de l'utilisateur
   */
  static async getLibraryStats(
    req: SessionRequest,
    res: Response
  ): Promise<void> {
    try {
      const sessionUser = req.session.user;

      if (!sessionUser) {
        res.status(401).json({
          success: false,
          message: "Session invalide",
          code: "INVALID_SESSION",
        });
        return;
      }

      const stats = await LibraryService.getUserLibraryStats(sessionUser.id);

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

      if (error instanceof LibraryError) {
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
