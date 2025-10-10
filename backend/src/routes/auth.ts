import { Router } from "express";
import type { Response } from "express";

// Import des contrôleurs
import { AuthController } from "../controllers/AuthController.js";

// Import des middlewares
import {
  requireAuth,
  type SessionRequest,
} from "../middlewares/sessionMiddleware.js";
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} from "../middlewares/validationMiddlewares.js";

// Création du routeur pour l'authentification
const router = Router();

/**
 * ROUTES D'AUTHENTIFICATION AVEC COOKIE-SESSION
 *
 * Routes disponibles :
 * - POST /api/auth/register → Inscription d'un nouvel utilisateur
 * - POST /api/auth/login → Connexion utilisateur (crée la session)
 * - POST /api/auth/logout → Déconnexion utilisateur (détruit la session)
 * - GET /api/auth/me → Récupérer le profil de l'utilisateur connecté
 * - POST /api/auth/forgot-password → Demande de réinitialisation du mot de passe
 * - POST /api/auth/reset-password → Réinitialiser le mot de passe
 */

// Route d'inscription
router.post(
  "/register",
  validateRegister,
  async (req: SessionRequest, res: Response) => {
    try {
      const result = await AuthController.register(req, res);
      return result;
    } catch (error) {
      console.error("❌ Erreur lors de l'inscription:", error);
      return res.status(500).json({
        success: false,
        message: "Erreur interne du serveur lors de l'inscription",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }
);

//Route de connexion
router.post(
  "/login",
  validateLogin,
  async (req: SessionRequest, res: Response) => {
    try {
      const result = await AuthController.login(req, res);
      return result;
    } catch (error) {
      console.error("❌ Erreur lors de la connexion:", error);
      return res.status(500).json({
        success: false,
        message: "Erreur interne du serveur lors de la connexion",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }
);

//Route de déconnexion
router.post("/logout", async (req: SessionRequest, res: Response) => {
  try {
    // Destruction de la session
    req.session.destroy((err) => {
      if (err) {
        console.error("❌ Erreur lors de la destruction de la session:", err);
        return res.status(500).json({
          success: false,
          message: "Erreur lors de la déconnexion",
        });
      }

      // Suppression du cookie
      res.clearCookie("blablabook_session");

      return res.status(200).json({
        success: true,
        message: "Déconnexion réussie",
      });
    });
  } catch (error) {
    console.error("❌ Erreur lors de la déconnexion:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur interne du serveur lors de la déconnexion",
    });
  }
});

// Route pour récupérer le profil utilisateur
router.get("/me", requireAuth, AuthController.getProfile);

// Route pour vérifier la session (optionnelle)
router.get("/check-session", AuthController.checkSession);

// Route pour la réinitialisation du mot de passe (optionnelle pour l'instant)
router.post(
  "/forgot-password",
  validateForgotPassword,
  async (req: SessionRequest, res: Response) => {
    try {
      // TODO: Implémenter la logique de reset password
      return res.status(501).json({
        success: false,
        message: "Fonctionnalité non encore implémentée",
      });
    } catch (error) {
      console.error("❌ Erreur lors de la demande de réinitialisation:", error);
      return res.status(500).json({
        success: false,
        message:
          "Erreur interne du serveur lors de la demande de réinitialisation",
      });
    }
  }
);

// Route pour réinitialiser le mot de passe (optionnelle pour l'instant)
router.post(
  "/reset-password",
  validateResetPassword,
  async (req: SessionRequest, res: Response) => {
    try {
      // TODO: Implémenter la logique de reset password
      return res.status(501).json({
        success: false,
        message: "Fonctionnalité non encore implémentée",
      });
    } catch (error) {
      console.error(
        "❌ Erreur lors de la réinitialisation du mot de passe:",
        error
      );
      return res.status(500).json({
        success: false,
        message:
          "Erreur interne du serveur lors de la réinitialisation du mot de passe",
      });
    }
  }
);

export default router;
