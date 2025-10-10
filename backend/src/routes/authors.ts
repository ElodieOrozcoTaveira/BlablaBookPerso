import { Router } from "express";
import type { Response } from "express";
import { AuthorController } from "../controllers/AuthorController.js";
import {
  requireAuth,
  type SessionRequest,
} from "../middlewares/sessionMiddleware.js";

// Création du routeur pour les auteurs
const router = Router();

/**
 * ROUTES DES AUTEURS
 *
 * Routes disponibles :
 * - POST /api/authors → Créer un nouvel auteur (admin)
 * - GET /api/authors → Récupérer tous les auteurs avec filtres
 * - GET /api/authors/search → Rechercher des auteurs
 * - GET /api/authors/stats → Statistiques des auteurs (admin)
 * - GET /api/authors/:id → Récupérer un auteur par ID
 * - PUT /api/authors/:id → Modifier un auteur (admin)
 * - DELETE /api/authors/:id → Supprimer un auteur (admin)
 */

/**
 * GET /api/authors/search
 * Rechercher des auteurs par nom
 * Accessible à tous les utilisateurs connectés
 */
router.get(
  "/search",
  requireAuth,
  async (req: SessionRequest, res: Response) => {
    try {
      await AuthorController.searchAuthors(req, res);
    } catch (error) {
      console.error("❌ Erreur lors de la recherche d'auteurs:", error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur lors de la recherche",
      });
    }
  }
);

/**
 * GET /api/authors/stats
 * Récupérer les statistiques des auteurs
 * Accessible aux administrateurs uniquement
 */
router.get(
  "/stats",
  requireAuth,
  // TODO: Ajouter un middleware checkAdminRole
  async (req: SessionRequest, res: Response) => {
    try {
      await AuthorController.getAuthorStats(req, res);
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des statistiques:",
        error
      );
      res.status(500).json({
        success: false,
        message:
          "Erreur interne du serveur lors de la récupération des statistiques",
      });
    }
  }
);

/**
 * POST /api/authors
 * Créer un nouvel auteur
 * Accessible aux administrateurs uniquement
 */
router.post(
  "/",
  requireAuth,
  // TODO: Ajouter un middleware checkAdminRole
  async (req: SessionRequest, res: Response) => {
    try {
      await AuthorController.createAuthor(req, res);
    } catch (error) {
      console.error("❌ Erreur lors de la création de l'auteur:", error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur lors de la création",
      });
    }
  }
);

/**
 * GET /api/authors
 * Récupérer tous les auteurs avec filtres optionnels
 * Accessible à tous les utilisateurs connectés
 */
router.get("/", requireAuth, async (req: SessionRequest, res: Response) => {
  try {
    await AuthorController.getAllAuthors(req, res);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des auteurs:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur lors de la récupération",
    });
  }
});

/**
 * GET /api/authors/:id
 * Récupérer un auteur par ID
 * Accessible à tous les utilisateurs connectés
 */
router.get("/:id", requireAuth, async (req: SessionRequest, res: Response) => {
  try {
    await AuthorController.getAuthorById(req, res);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération de l'auteur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur lors de la récupération",
    });
  }
});

/**
 * PUT /api/authors/:id
 * Modifier un auteur
 * Accessible aux administrateurs uniquement
 */
router.put(
  "/:id",
  requireAuth,
  // TODO: Ajouter un middleware checkAdminRole
  async (req: SessionRequest, res: Response) => {
    try {
      await AuthorController.updateAuthor(req, res);
    } catch (error) {
      console.error("❌ Erreur lors de la modification de l'auteur:", error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur lors de la modification",
      });
    }
  }
);

/**
 * DELETE /api/authors/:id
 * Supprimer un auteur
 * Accessible aux administrateurs uniquement
 */
router.delete(
  "/:id",
  requireAuth,
  // TODO: Ajouter un middleware checkAdminRole
  async (req: SessionRequest, res: Response) => {
    try {
      await AuthorController.deleteAuthor(req, res);
    } catch (error) {
      console.error("❌ Erreur lors de la suppression de l'auteur:", error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur lors de la suppression",
      });
    }
  }
);

export default router;
