import { Router } from "express";
import type { Response } from "express";

// Import des contrôleurs
import { UserController } from "../controllers/UserController.js";

// Import des middlewares
import {
  requireAuth,
  type SessionRequest,
} from "../middlewares/sessionMiddleware.js";

// Création du router pour les utilisateurs
const router = Router();

/**
 * ROUTES DES UTILISATEURS
 *
 * Routes disponibles:
 * - GET /api/users/profile → Récupérer le profil de l'utilisateur connecté
 * - PUT /api/users/profile → Modifier le profil (firstname, lastname, username, email)
 * - DELETE /api/users/profile → Supprimer le compte
 * - GET /api/users → Récupérer tous les utilisateurs (admin)
 * - GET /api/users/:id → Récupérer un utilisateur par ID
 */

/**
 * GET /api/users/profile
 * Récupère le profil de l'utilisateur connecté
 * Nécessite une authentification (session valide)
 */
router.get(
  "/profile",
  requireAuth,
  async (req: SessionRequest, res: Response) => {
    try {
      // L'utilisateur est déjà vérifié par requireAuth
      const sessionUser = req.session.user;

      if (!sessionUser) {
        res.status(401).json({
          success: false,
          message: "Session invalide",
          code: "INVALID_SESSION",
        });
        return;
      }

      // Option 1: Utiliser directement les données de session (rapide)
      res.status(200).json({
        success: true,
        data: {
          id: sessionUser.id,
          email: sessionUser.email,
          username: sessionUser.username,
          firstname: sessionUser.firstname,
          lastname: sessionUser.lastname,
        },
        message: "Profil récupéré avec succès",
      });
    } catch (error) {
      console.error("❌ Erreur lors de la récupération du profil:", error);
      res.status(500).json({
        success: false,
        message: "Erreur interne lors de la récupération du profil",
      });
    }
  }
);

/**
 * PUT /api/users/profile
 * Modifie le profil de l'utilisateur connecté
 */
router.put("/profile", requireAuth, UserController.updateProfile);

/**
 * DELETE /api/users/profile
 * Supprime le compte de l'utilisateur connecté
 */
router.delete("/profile", requireAuth, UserController.deleteUser);

/**
 * GET /api/users (admin only - à implémenter plus tard)
 * Récupère tous les utilisateurs
 */
// router.get('/', requireAuth, requireRole('admin'), UserController.getAllUsers);

/**
 * GET /api/users/:id
 * Récupère un utilisateur par son ID
 * Pour le moment accessible sans restriction admin pour les tests
 */
router.get("/:id", requireAuth, UserController.getUserById);

export default router;
