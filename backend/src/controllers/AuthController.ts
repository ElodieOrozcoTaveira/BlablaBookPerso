import type { Response } from "express";
import type { SessionRequest } from "../middlewares/sessionMiddleware.js";
import { AuthService, AuthError } from "../services/AuthService.js";

/**
 * 🎮 CONTRÔLEUR D'AUTHENTIFICATION - Cookie Sessions
 * 
 * Orchestre les requêtes HTTP et délègue la logique métier au service
 */
export class AuthController {
  
  /**
   * POST /api/auth/register
   * Inscription d'un nouvel utilisateur
   */
  static async register(req: SessionRequest, res: Response): Promise<void> {
    try {
      const userData = req.body;

      // Délégation de la logique métier au service
      const newUser = await AuthService.registerUser(userData);

      // Création de la session
      req.session.user = {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        firstname: newUser.firstname,
        lastname: newUser.lastname
      };

      // Réponse HTTP
      res.status(201).json({
        success: true,
        message: "Inscription réussie",
        user: newUser
      });

    } catch (error) {
      // Gestion des erreurs métier
      if (error instanceof AuthError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code
        });
        return;
      }

      // Erreurs inattendues
      console.error("❌ Erreur lors de l'inscription:", error);
      res.status(500).json({
        success: false,
        message: "Erreur interne lors de l'inscription",
        error: process.env.NODE_ENV === "development" ? error : undefined
      });
    }
  }

  /**
   * POST /api/auth/login
   * Connexion d'un utilisateur existant
   */
  static async login(req: SessionRequest, res: Response): Promise<void> {
    try {
      const credentials = req.body;

      // Délégation de l'authentification au service
      const user = await AuthService.authenticateUser(credentials);

      // Création de la session
      req.session.user = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname
      };

      // Réponse HTTP
      res.status(200).json({
        success: true,
        message: "Connexion réussie",
        user: user
      });

    } catch (error) {
      // Gestion des erreurs métier
      if (error instanceof AuthError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code
        });
        return;
      }

      // Erreurs inattendues
      console.error("❌ Erreur lors de la connexion:", error);
      res.status(500).json({
        success: false,
        message: "Erreur interne lors de la connexion",
        error: process.env.NODE_ENV === "development" ? error : undefined
      });
    }
  }

  /**
   * POST /api/auth/logout
   * Déconnexion de l'utilisateur
   */
  static async logout(req: SessionRequest, res: Response): Promise<void> {
    try {
      // Vérifier si l'utilisateur est connecté
      if (!req.session.user) {
        res.status(401).json({
          success: false,
          message: "Aucune session active",
          code: "NO_ACTIVE_SESSION"
        });
        return;
      }

      // Destruction de la session
      req.session.destroy((error) => {
        if (error) {
          console.error("❌ Erreur lors de la destruction de session:", error);
          res.status(500).json({
            success: false,
            message: "Erreur lors de la déconnexion"
          });
          return;
        }

        // Suppression du cookie côté client
        res.clearCookie('blablabook_session');
        
        res.status(200).json({
          success: true,
          message: "Déconnexion réussie"
        });
      });

    } catch (error) {
      console.error("❌ Erreur lors de la déconnexion:", error);
      res.status(500).json({
        success: false,
        message: "Erreur interne lors de la déconnexion"
      });
    }
  }

  /**
   * GET /api/auth/me
   * Récupérer le profil de l'utilisateur connecté
   */
  static async getProfile(req: SessionRequest, res: Response): Promise<void> {
    try {
      const sessionUser = req.session.user;

      if (!sessionUser) {
        res.status(401).json({
          success: false,
          message: "Session invalide",
          code: "INVALID_SESSION"
        });
        return;
      }

      // Récupération des données complètes via le service
      const user = await AuthService.getUserById(sessionUser.id);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé",
          code: "USER_NOT_FOUND"
        });
        return;
      }

      res.status(200).json({
        success: true,
        user: user
      });

    } catch (error) {
      console.error("❌ Erreur lors de la récupération du profil:", error);
      res.status(500).json({
        success: false,
        message: "Erreur interne lors de la récupération du profil"
      });
    }
  }

  /**
   * GET /api/auth/check-session
   * Vérifier si la session est valide
   */
  static async checkSession(req: SessionRequest, res: Response): Promise<void> {
    try {
      if (req.session.user) {
        res.status(200).json({
          success: true,
          authenticated: true,
          user: req.session.user
        });
      } else {
        res.status(200).json({
          success: true,
          authenticated: false
        });
      }
    } catch (error) {
      console.error("❌ Erreur lors de la vérification de session:", error);
      res.status(500).json({
        success: false,
        message: "Erreur interne lors de la vérification"
      });
    }
  }
}