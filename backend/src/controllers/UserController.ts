import { Request, Response } from 'express';
import { User } from '../models/user.js';

/**
 * Contrôleur pour la gestion des utilisateurs
 * Contient toutes les actions CRUD pour les users
 */
class UserController {
  
  /**
   * GET /api/users
   * Récupère tous les utilisateurs
   */
  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password'] }, // On ne renvoie jamais le mot de passe
        order: [['created_at', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: users,
        count: users.length
      });

    } catch (error) {
      console.error('Erreur getAllUsers:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des utilisateurs'
      });
    }
  }

  /**
   * GET /api/users/:id
   * Récupère un utilisateur par son ID
   */
  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      res.status(200).json({
        success: true,
        data: user
      });

    } catch (error) {
      console.error('Erreur getUserById:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'utilisateur'
      });
    }
  }

  /**
   * POST /api/users
   * Crée un nouvel utilisateur
   */
  static async createUser(req: Request, res: Response) {
    try {
      const { firstname, lastname, username, email, password } = req.body;

      // Validation basique
      if (!firstname || !lastname || !username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Tous les champs sont requis'
        });
      }

      // Vérifier si l'email existe déjà
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Cet email est déjà utilisé'
        });
      }

      // Créer l'utilisateur
      const user = await User.create({
        firstname,
        lastname,
        username,
        email,
        password // TODO: Hasher le mot de passe avec bcrypt
      });

      // Retourner sans le mot de passe
      const userResponse = { ...user.toJSON() };
      delete userResponse.password;

      res.status(201).json({
        success: true,
        message: 'Utilisateur créé avec succès',
        data: userResponse
      });

    } catch (error) {
      console.error('Erreur createUser:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de l\'utilisateur'
      });
    }
  }

  /**
   * PUT /api/users/:id
   * Met à jour un utilisateur
   */
  static async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { firstname, lastname, username, email } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      // Mise à jour
      await user.update({
        firstname: firstname || user.firstname,
        lastname: lastname || user.lastname,
        username: username || user.username,
        email: email || user.email
      });

      // Retourner sans le mot de passe
      const userResponse = { ...user.toJSON() };
      delete userResponse.password;

      res.status(200).json({
        success: true,
        message: 'Utilisateur mis à jour avec succès',
        data: userResponse
      });

    } catch (error) {
      console.error('Erreur updateUser:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de l\'utilisateur'
      });
    }
  }

  /**
   * DELETE /api/users/:id
   * Supprime un utilisateur (soft delete)
   */
  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      // Soft delete (grâce au paranoid: true)
      await user.destroy();

      res.status(200).json({
        success: true,
        message: 'Utilisateur supprimé avec succès'
      });

    } catch (error) {
      console.error('Erreur deleteUser:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression de l\'utilisateur'
      });
    }
  }
}

export { UserController };