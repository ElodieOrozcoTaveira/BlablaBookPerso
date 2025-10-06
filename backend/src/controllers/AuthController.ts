import type { Request, Response } from "express";
import { User } from "../models/user.js";
import { PasswordService } from "../services/PasswordService.js";

/**
 * Contrôleur pour l'authentification
 */
class AuthController {
  /**
   * POST /api/auth/register
   * Inscription d'un nouvel utilisateur
   */
  static async register(req: Request, res: Response) {
    try {
      const { firstname, lastname, username, email, password } = req.body;

      // 1. Validation des champs requis
      if (!firstname || !lastname || !username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Tous les champs sont requis",
        });
      }

      // 2. Validation de la complexité du mot de passe
      const passwordValidation =
        PasswordService.validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Mot de passe trop faible",
          errors: passwordValidation.errors,
        });
      }

      // 3. Vérifier si l'email existe déjà
      const existingUser = await User.findOne({
        where: { email },
        paranoid: false, // Inclure les utilisateurs soft-deleted
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Cet email est déjà utilisé",
        });
      }

      // 4. Hasher le mot de passe
      const hashedPassword = await PasswordService.hashPassword(password);

      // 5. Créer l'utilisateur
      const user = await User.create({
        firstname,
        lastname,
        username,
        email,
        password: hashedPassword,
      });

      // 6. Retourner la réponse sans le mot de passe
      const userResponse = { ...user.toJSON() };
      delete userResponse.password;

      res.status(201).json({
        success: true,
        message: "Utilisateur créé avec succès",
        data: userResponse,
      });
    } catch (error) {
      console.error("Erreur register:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la création du compte",
      });
    }
  }

  /**
   * POST /api/auth/login
   * Connexion d'un utilisateur
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // 1. Validation des champs
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email et mot de passe requis",
        });
      }

      // 2. Rechercher l'utilisateur
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Email ou mot de passe incorrect",
        });
      }

      // 3. Vérifier le mot de passe
      const isPasswordValid = await PasswordService.verifyPassword(
        password,
        user.password
      );
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Email ou mot de passe incorrect",
        });
      }

      // 4. Mettre à jour la dernière connexion
      await user.update({ connected_at: new Date() });

      // 5. Préparer la réponse (sans le mot de passe)
      const userResponse = { ...user.toJSON() };
      delete userResponse.password;

      // TODO: Générer un token JWT ici

      res.status(200).json({
        success: true,
        message: "Connexion réussie",
        data: userResponse,
        // token: jwt_token // À ajouter plus tard
      });
    } catch (error) {
      console.error("Erreur login:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la connexion",
      });
    }
  }

  /**
   * POST /api/auth/change-password
   * Changement de mot de passe
   */
  static async changePassword(req: Request, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.params.userId; // TODO: Récupérer depuis le token JWT

      // 1. Validation des champs
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Mot de passe actuel et nouveau mot de passe requis",
        });
      }

      // 2. Validation du nouveau mot de passe
      const passwordValidation =
        PasswordService.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Nouveau mot de passe trop faible",
          errors: passwordValidation.errors,
        });
      }

      // 3. Rechercher l'utilisateur
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé",
        });
      }

      // 4. Vérifier l'ancien mot de passe
      const isCurrentPasswordValid = await PasswordService.verifyPassword(
        currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Mot de passe actuel incorrect",
        });
      }

      // 5. Hasher le nouveau mot de passe
      const hashedNewPassword = await PasswordService.hashPassword(newPassword);

      // 6. Mettre à jour le mot de passe
      await user.update({ password: hashedNewPassword });

      res.status(200).json({
        success: true,
        message: "Mot de passe modifié avec succès",
      });
    } catch (error) {
      console.error("Erreur changePassword:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors du changement de mot de passe",
      });
    }
  }
}

export { AuthController };
