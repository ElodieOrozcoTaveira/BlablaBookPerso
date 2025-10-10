import { Authors } from "../models/Authors.js";
import { Op } from "sequelize";

/**
 * SERVICE DES AUTEURS
 *
 * Contient toute la logique métier liée aux auteurs
 * Indépendant du protocole HTTP (réutilisable partout)
 */

// Types pour les données d'auteur
export interface AuthorData {
  id: number;
  firstname?: string;
  lastname: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateAuthorData {
  firstname?: string;
  lastname: string;
}

export interface UpdateAuthorData {
  firstname?: string;
  lastname?: string;
}

export interface AuthorSearchFilters {
  search?: string;
  limit?: number;
  offset?: number;
}

// Erreurs métier personnalisées
export class AuthorError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "AuthorError";
  }
}

export class AuthorService {
  /**
   * Créer un nouvel auteur
   */
  static async createAuthor(authorData: CreateAuthorData): Promise<AuthorData> {
    try {
      // Validation des données
      if (!authorData.lastname || authorData.lastname.trim().length === 0) {
        throw new AuthorError(
          "Le nom de famille est requis",
          "LASTNAME_REQUIRED",
          400
        );
      }

      // Vérifier si l'auteur existe déjà
      const existingAuthor = await Authors.findOne({
        where: {
          firstname: authorData.firstname || null,
          lastname: authorData.lastname.trim(),
        },
      });

      if (existingAuthor) {
        throw new AuthorError(
          "Un auteur avec ce nom existe déjà",
          "AUTHOR_ALREADY_EXISTS",
          409
        );
      }

      // Créer l'auteur
      const newAuthor = await Authors.create({
        firstname: authorData.firstname?.trim() || null,
        lastname: authorData.lastname.trim(),
      });

      return {
        id: newAuthor.dataValues.id,
        firstname: newAuthor.dataValues.firstname,
        lastname: newAuthor.dataValues.lastname,
        createdAt: newAuthor.dataValues.created_at,
        updatedAt: newAuthor.dataValues.updated_at,
      };
    } catch (error) {
      if (error instanceof AuthorError) {
        throw error;
      }
      throw new AuthorError(
        "Erreur lors de la création de l'auteur",
        "CREATE_AUTHOR_ERROR",
        500
      );
    }
  }

  /**
   * Récupérer tous les auteurs avec filtres optionnels
   */
  static async getAllAuthors(filters: AuthorSearchFilters = {}): Promise<{
    authors: AuthorData[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const { search, limit = 20, offset = 0 } = filters;

      // Construction de la condition de recherche
      const whereCondition: any = {};

      if (search) {
        whereCondition[Op.or] = [
          {
            firstname: {
              [Op.iLike]: `%${search}%`,
            },
          },
          {
            lastname: {
              [Op.iLike]: `%${search}%`,
            },
          },
        ];
      }

      // Requête avec pagination
      const { rows: authors, count: total } = await Authors.findAndCountAll({
        where: whereCondition,
        limit: Number(limit),
        offset: Number(offset),
        order: [
          ["lastname", "ASC"],
          ["firstname", "ASC"],
        ],
        attributes: ["id", "firstname", "lastname", "created_at", "updated_at"],
      });

      const authorsList: AuthorData[] = authors.map((author) => ({
        id: author.dataValues.id,
        firstname: author.dataValues.firstname,
        lastname: author.dataValues.lastname,
        createdAt: author.dataValues.created_at,
        updatedAt: author.dataValues.updated_at,
      }));

      return {
        authors: authorsList,
        total,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new AuthorError(
        "Erreur lors de la récupération des auteurs",
        "GET_AUTHORS_ERROR",
        500
      );
    }
  }

  /**
   * Récupérer un auteur par ID
   */
  static async getAuthorById(authorId: number): Promise<AuthorData | null> {
    try {
      const author = await Authors.findByPk(authorId, {
        attributes: ["id", "firstname", "lastname", "created_at", "updated_at"],
      });

      if (!author) {
        return null;
      }

      return {
        id: author.dataValues.id,
        firstname: author.dataValues.firstname,
        lastname: author.dataValues.lastname,
        createdAt: author.dataValues.created_at,
        updatedAt: author.dataValues.updated_at,
      };
    } catch (error) {
      throw new AuthorError(
        "Erreur lors de la récupération de l'auteur",
        "GET_AUTHOR_ERROR",
        500
      );
    }
  }

  /**
   * Mettre à jour un auteur
   */
  static async updateAuthor(
    authorId: number,
    updateData: UpdateAuthorData
  ): Promise<AuthorData> {
    try {
      // Vérifier que l'auteur existe
      const author = await Authors.findByPk(authorId);
      if (!author) {
        throw new AuthorError("Auteur non trouvé", "AUTHOR_NOT_FOUND", 404);
      }

      // Validation des données
      if (
        updateData.lastname !== undefined &&
        updateData.lastname.trim().length === 0
      ) {
        throw new AuthorError(
          "Le nom de famille ne peut pas être vide",
          "LASTNAME_REQUIRED",
          400
        );
      }

      // Vérifier les doublons si on modifie le nom
      if (
        updateData.firstname !== undefined ||
        updateData.lastname !== undefined
      ) {
        const newFirstname =
          updateData.firstname !== undefined
            ? updateData.firstname?.trim() || null
            : author.dataValues.firstname;
        const newLastname =
          updateData.lastname !== undefined
            ? updateData.lastname.trim()
            : author.dataValues.lastname;

        const existingAuthor = await Authors.findOne({
          where: {
            firstname: newFirstname,
            lastname: newLastname,
            id: { [Op.not]: authorId },
          },
        });

        if (existingAuthor) {
          throw new AuthorError(
            "Un auteur avec ce nom existe déjà",
            "AUTHOR_ALREADY_EXISTS",
            409
          );
        }
      }

      // Préparer les données de mise à jour
      const dataToUpdate: any = {};
      if (updateData.firstname !== undefined) {
        dataToUpdate.firstname = updateData.firstname?.trim() || null;
      }
      if (updateData.lastname !== undefined) {
        dataToUpdate.lastname = updateData.lastname.trim();
      }

      // Mettre à jour
      await Authors.update(dataToUpdate, {
        where: { id: authorId },
      });

      // Récupérer l'auteur mis à jour
      const updatedAuthor = await Authors.findByPk(authorId, {
        attributes: ["id", "firstname", "lastname", "created_at", "updated_at"],
      });

      return {
        id: updatedAuthor!.dataValues.id,
        firstname: updatedAuthor!.dataValues.firstname,
        lastname: updatedAuthor!.dataValues.lastname,
        createdAt: updatedAuthor!.dataValues.created_at,
        updatedAt: updatedAuthor!.dataValues.updated_at,
      };
    } catch (error) {
      if (error instanceof AuthorError) {
        throw error;
      }
      throw new AuthorError(
        "Erreur lors de la mise à jour de l'auteur",
        "UPDATE_AUTHOR_ERROR",
        500
      );
    }
  }

  /**
   * Supprimer un auteur
   */
  static async deleteAuthor(authorId: number): Promise<void> {
    try {
      const author = await Authors.findByPk(authorId);
      if (!author) {
        throw new AuthorError("Auteur non trouvé", "AUTHOR_NOT_FOUND", 404);
      }

      // TODO: Vérifier s'il y a des livres associés à cet auteur
      // avant de permettre la suppression

      await Authors.destroy({
        where: { id: authorId },
      });
    } catch (error) {
      if (error instanceof AuthorError) {
        throw error;
      }
      throw new AuthorError(
        "Erreur lors de la suppression de l'auteur",
        "DELETE_AUTHOR_ERROR",
        500
      );
    }
  }

  /**
   * Rechercher des auteurs par nom
   */
  static async searchAuthors(
    searchTerm: string,
    limit: number = 10
  ): Promise<AuthorData[]> {
    try {
      if (!searchTerm || searchTerm.trim().length === 0) {
        return [];
      }

      const authors = await Authors.findAll({
        where: {
          [Op.or]: [
            {
              firstname: {
                [Op.iLike]: `%${searchTerm.trim()}%`,
              },
            },
            {
              lastname: {
                [Op.iLike]: `%${searchTerm.trim()}%`,
              },
            },
          ],
        },
        limit: Number(limit),
        order: [
          ["lastname", "ASC"],
          ["firstname", "ASC"],
        ],
        attributes: ["id", "firstname", "lastname"],
      });

      return authors.map((author) => ({
        id: author.dataValues.id,
        firstname: author.dataValues.firstname,
        lastname: author.dataValues.lastname,
      }));
    } catch (error) {
      throw new AuthorError(
        "Erreur lors de la recherche d'auteurs",
        "SEARCH_AUTHORS_ERROR",
        500
      );
    }
  }

  /**
   * Statistiques des auteurs
   */
  static async getAuthorStats(): Promise<{
    totalAuthors: number;
    authorsWithBooks: number;
    authorsWithoutBooks: number;
  }> {
    try {
      const totalAuthors = await Authors.count();

      // TODO: Implémenter le comptage avec les livres quand la relation sera définie
      const authorsWithBooks = 0;
      const authorsWithoutBooks = totalAuthors;

      return {
        totalAuthors,
        authorsWithBooks,
        authorsWithoutBooks,
      };
    } catch (error) {
      throw new AuthorError(
        "Erreur lors de la récupération des statistiques",
        "GET_STATS_ERROR",
        500
      );
    }
  }
}
