import { Genre } from "../models/Genre.js";
import { Op } from "sequelize";

/**
 * SERVICE DES GENRES
 *
 * Contient toute la logique métier liée aux genres
 * Indépendant du protocole HTTP (réutilisable partout)
 */

// Types pour les données de genre
export interface GenreData {
  id: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateGenreData {
  name: string;
}

export interface UpdateGenreData {
  name?: string;
}

export interface GenreSearchFilters {
  search?: string;
  limit?: number;
  offset?: number;
}

// Erreurs métier personnalisées
export class GenreError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "GenreError";
  }
}

export class GenreService {
  /**
   * Créer un nouveau genre
   */
  static async createGenre(genreData: CreateGenreData): Promise<GenreData> {
    try {
      // Validation des données
      if (!genreData.name || genreData.name.trim().length === 0) {
        throw new GenreError(
          "Le nom du genre est requis",
          "GENRE_NAME_REQUIRED",
          400
        );
      }

      // Vérifier si le genre existe déjà
      const existingGenre = await Genre.findOne({
        where: {
          name: genreData.name.trim().toLowerCase(),
        },
      });

      if (existingGenre) {
        throw new GenreError(
          "Un genre avec ce nom existe déjà",
          "GENRE_ALREADY_EXISTS",
          409
        );
      }

      // Créer le genre
      const newGenre = await Genre.create({
        name: genreData.name.trim().toLowerCase(),
      });

      return {
        id: newGenre.dataValues.id,
        name: newGenre.dataValues.name,
        createdAt: newGenre.dataValues.created_at,
        updatedAt: newGenre.dataValues.updated_at,
      };
    } catch (error) {
      if (error instanceof GenreError) {
        throw error;
      }
      throw new GenreError(
        "Erreur lors de la création du genre",
        "CREATE_GENRE_ERROR",
        500
      );
    }
  }

  /**
   * Récupérer tous les genres avec filtres optionnels
   */
  static async getAllGenres(filters: GenreSearchFilters = {}): Promise<{
    genres: GenreData[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const { search, limit = 20, offset = 0 } = filters;

      // Construction de la condition de recherche
      const whereCondition: any = {};

      if (search) {
        whereCondition.name = {
          [Op.iLike]: `%${search}%`,
        };
      }

      // Requête avec pagination
      const { rows: genres, count: total } = await Genre.findAndCountAll({
        where: whereCondition,
        limit: Number(limit),
        offset: Number(offset),
        order: [["name", "ASC"]],
        attributes: ["id", "name", "created_at", "updated_at"],
      });

      const genresList: GenreData[] = genres.map((genre) => ({
        id: genre.dataValues.id,
        name: genre.dataValues.name,
        createdAt: genre.dataValues.created_at,
        updatedAt: genre.dataValues.updated_at,
      }));

      return {
        genres: genresList,
        total,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new GenreError(
        "Erreur lors de la récupération des genres",
        "GET_GENRES_ERROR",
        500
      );
    }
  }

  /**
   * Récupérer un genre par ID
   */
  static async getGenreById(genreId: number): Promise<GenreData | null> {
    try {
      const genre = await Genre.findByPk(genreId, {
        attributes: ["id", "name", "created_at", "updated_at"],
      });

      if (!genre) {
        return null;
      }

      return {
        id: genre.dataValues.id,
        name: genre.dataValues.name,
        createdAt: genre.dataValues.created_at,
        updatedAt: genre.dataValues.updated_at,
      };
    } catch (error) {
      throw new GenreError(
        "Erreur lors de la récupération du genre",
        "GET_GENRE_ERROR",
        500
      );
    }
  }

  /**
   * Récupérer un genre par nom
   */
  static async getGenreByName(genreName: string): Promise<GenreData | null> {
    try {
      const genre = await Genre.findOne({
        where: {
          name: genreName.toLowerCase(),
        },
        attributes: ["id", "name", "created_at", "updated_at"],
      });

      if (!genre) {
        return null;
      }

      return {
        id: genre.dataValues.id,
        name: genre.dataValues.name,
        createdAt: genre.dataValues.created_at,
        updatedAt: genre.dataValues.updated_at,
      };
    } catch (error) {
      throw new GenreError(
        "Erreur lors de la récupération du genre",
        "GET_GENRE_ERROR",
        500
      );
    }
  }

  /**
   * Mettre à jour un genre
   */
  static async updateGenre(
    genreId: number,
    updateData: UpdateGenreData
  ): Promise<GenreData> {
    try {
      // Vérifier que le genre existe
      const genre = await Genre.findByPk(genreId);
      if (!genre) {
        throw new GenreError("Genre non trouvé", "GENRE_NOT_FOUND", 404);
      }

      // Validation des données
      if (
        updateData.name !== undefined &&
        updateData.name.trim().length === 0
      ) {
        throw new GenreError(
          "Le nom du genre ne peut pas être vide",
          "GENRE_NAME_REQUIRED",
          400
        );
      }

      // Vérifier les doublons si on modifie le nom
      if (updateData.name !== undefined) {
        const newName = updateData.name.trim().toLowerCase();

        const existingGenre = await Genre.findOne({
          where: {
            name: newName,
            id: { [Op.not]: genreId },
          },
        });

        if (existingGenre) {
          throw new GenreError(
            "Un genre avec ce nom existe déjà",
            "GENRE_ALREADY_EXISTS",
            409
          );
        }
      }

      // Préparer les données de mise à jour
      const dataToUpdate: any = {};
      if (updateData.name !== undefined) {
        dataToUpdate.name = updateData.name.trim().toLowerCase();
      }

      // Mettre à jour
      await Genre.update(dataToUpdate, {
        where: { id: genreId },
      });

      // Récupérer le genre mis à jour
      const updatedGenre = await Genre.findByPk(genreId, {
        attributes: ["id", "name", "created_at", "updated_at"],
      });

      return {
        id: updatedGenre!.dataValues.id,
        name: updatedGenre!.dataValues.name,
        createdAt: updatedGenre!.dataValues.created_at,
        updatedAt: updatedGenre!.dataValues.updated_at,
      };
    } catch (error) {
      if (error instanceof GenreError) {
        throw error;
      }
      throw new GenreError(
        "Erreur lors de la mise à jour du genre",
        "UPDATE_GENRE_ERROR",
        500
      );
    }
  }

  /**
   * Supprimer un genre
   */
  static async deleteGenre(genreId: number): Promise<void> {
    try {
      const genre = await Genre.findByPk(genreId);
      if (!genre) {
        throw new GenreError("Genre non trouvé", "GENRE_NOT_FOUND", 404);
      }

      // TODO: Vérifier s'il y a des livres associés à ce genre
      // avant de permettre la suppression

      await Genre.destroy({
        where: { id: genreId },
      });
    } catch (error) {
      if (error instanceof GenreError) {
        throw error;
      }
      throw new GenreError(
        "Erreur lors de la suppression du genre",
        "DELETE_GENRE_ERROR",
        500
      );
    }
  }

  /**
   * Rechercher des genres par nom
   */
  static async searchGenres(
    searchTerm: string,
    limit: number = 10
  ): Promise<GenreData[]> {
    try {
      if (!searchTerm || searchTerm.trim().length === 0) {
        return [];
      }

      const genres = await Genre.findAll({
        where: {
          name: {
            [Op.iLike]: `%${searchTerm.trim()}%`,
          },
        },
        limit: Number(limit),
        order: [["name", "ASC"]],
        attributes: ["id", "name"],
      });

      return genres.map((genre) => ({
        id: genre.dataValues.id,
        name: genre.dataValues.name,
      }));
    } catch (error) {
      throw new GenreError(
        "Erreur lors de la recherche de genres",
        "SEARCH_GENRES_ERROR",
        500
      );
    }
  }

  /**
   * Statistiques des genres
   */
  static async getGenreStats(): Promise<{
    totalGenres: number;
    genresWithBooks: number;
    genresWithoutBooks: number;
    popularGenres: GenreData[];
  }> {
    try {
      const totalGenres = await Genre.count();

      // TODO: Implémenter le comptage avec les livres quand la relation sera définie
      const genresWithBooks = 0;
      const genresWithoutBooks = totalGenres;

      // TODO: Implémenter la récupération des genres populaires basée sur le nombre de livres
      const popularGenres: GenreData[] = [];

      return {
        totalGenres,
        genresWithBooks,
        genresWithoutBooks,
        popularGenres,
      };
    } catch (error) {
      throw new GenreError(
        "Erreur lors de la récupération des statistiques",
        "GET_STATS_ERROR",
        500
      );
    }
  }

  /**
   * Vérifier si un genre existe
   */
  static async genreExists(genreId: number): Promise<boolean> {
    try {
      const genre = await Genre.findByPk(genreId);
      return !!genre;
    } catch (error) {
      throw new GenreError(
        "Erreur lors de la vérification du genre",
        "CHECK_GENRE_ERROR",
        500
      );
    }
  }

  /**
   * Récupérer les genres les plus populaires
   */
  static async getPopularGenres(limit: number = 10): Promise<GenreData[]> {
    try {
      // TODO: Implémenter la logique basée sur le nombre de livres par genre
      // Pour l'instant, on retourne tous les genres triés par nom
      const genres = await Genre.findAll({
        limit: Number(limit),
        order: [["name", "ASC"]],
        attributes: ["id", "name", "created_at"],
      });

      return genres.map((genre) => ({
        id: genre.dataValues.id,
        name: genre.dataValues.name,
        createdAt: genre.dataValues.created_at,
      }));
    } catch (error) {
      throw new GenreError(
        "Erreur lors de la récupération des genres populaires",
        "GET_POPULAR_GENRES_ERROR",
        500
      );
    }
  }

  /**
   * Récupérer les genres par ordre alphabétique
   */
  static async getGenresAlphabetically(): Promise<GenreData[]> {
    try {
      const genres = await Genre.findAll({
        order: [["name", "ASC"]],
        attributes: ["id", "name"],
      });

      return genres.map((genre) => ({
        id: genre.dataValues.id,
        name: genre.dataValues.name,
      }));
    } catch (error) {
      throw new GenreError(
        "Erreur lors de la récupération des genres",
        "GET_ALPHABETICAL_GENRES_ERROR",
        500
      );
    }
  }
}
