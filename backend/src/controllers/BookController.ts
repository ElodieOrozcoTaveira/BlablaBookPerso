import type { Response } from "express";
import type { SessionRequest } from "../middlewares/sessionMiddleware.js";
import { OpenLibraryService } from "../services/OpenLibraryService.js";
import { BookService, BookError } from "../services/BookService.js";

/**
 * CONTRÔLEUR LIVRES
 *
 * Orchestre les requêtes HTTP pour les livres et l'intégration OpenLibrary
 */
export class BookController {
  /**
   * GET /api/books/search
   * Recherche de livres sur OpenLibrary
   */
  static async searchOpenLibrary(
    req: SessionRequest,
    res: Response
  ): Promise<void> {
    try {
      const { q: query, limit } = req.query;

      if (!query || typeof query !== "string") {
        res.status(400).json({
          success: false,
          message: "Le paramètre 'q' (query) est requis",
          code: "MISSING_QUERY",
        });
        return;
      }

      const limitNumber = limit ? parseInt(limit as string) : 20;

      // Recherche sur OpenLibrary
      const books = await OpenLibraryService.searchBooks(query, limitNumber);

      res.status(200).json({
        success: true,
        data: books,
        total: books.length,
        query,
        message: `${books.length} livre(s) trouvé(s)`,
      });
    } catch (error) {
      console.error("❌ Erreur recherche OpenLibrary:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la recherche de livres",
        code: "SEARCH_ERROR",
      });
    }
  }

  /**
   * GET /api/books/openlibrary/:path(.*)
   * Récupère les détails d'un livre OpenLibrary
   */
  static async getOpenLibraryDetails(
    req: SessionRequest,
    res: Response
  ): Promise<void> {
    try {
      // Récupérer type et id au lieu de path
      const { type, id } = req.params;

      if (!type || !id) {
        res.status(400).json({
          success: false,
          message: "Type et ID OpenLibrary requis",
          code: "MISSING_PARAMS",
        });
        return;
      }

      // Construire l'openLibraryId : "/works/OL123W"
      const openLibraryId = `/${type}/${id}`;

      const book = await OpenLibraryService.getBookDetails(openLibraryId);

      res.status(200).json({
        success: true,
        data: book,
        message: "Détails du livre récupérés",
      });
    } catch (error) {
      console.error("❌ Erreur détails OpenLibrary:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des détails",
        code: "DETAILS_ERROR",
      });
    }
  }

  /**
   * GET /api/books/isbn/:isbn
   * Recherche par ISBN
   */
  static async searchByISBN(req: SessionRequest, res: Response): Promise<void> {
    try {
      const { isbn } = req.params;

      if (!isbn) {
        res.status(400).json({
          success: false,
          message: "ISBN requis",
          code: "MISSING_ISBN",
        });
        return;
      }

      const book = await OpenLibraryService.searchByISBN(isbn);

      if (!book) {
        res.status(404).json({
          success: false,
          message: "Aucun livre trouvé pour cet ISBN",
          code: "BOOK_NOT_FOUND",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: book,
        message: "Livre trouvé par ISBN",
      });
    } catch (error) {
      console.error("❌ Erreur recherche ISBN:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la recherche par ISBN",
        code: "ISBN_SEARCH_ERROR",
      });
    }
  }

  /**
   * POST /api/books/save
   * Sauvegarde un livre d'OpenLibrary dans la bibliothèque utilisateur
   */
  static async saveBookFromOpenLibrary(
    req: SessionRequest,
    res: Response
  ): Promise<void> {
    try {
      const sessionUser = req.session.user;
      if (!sessionUser) {
        res.status(401).json({
          success: false,
          message: "Authentification requise",
          code: "UNAUTHORIZED",
        });
        return;
      }

      const { openLibraryId, status = "to_read" } = req.body;

      if (!openLibraryId) {
        res.status(400).json({
          success: false,
          message: "ID OpenLibrary requis",
          code: "MISSING_OPENLIBRARY_ID",
        });
        return;
      }

      // Récupérer les détails depuis OpenLibrary
      const openLibraryBook = await OpenLibraryService.getBookDetails(
        openLibraryId
      );

      // Sauvegarder en BDD via BookService
      const savedBook = await BookService.saveFromOpenLibrary(
        sessionUser.id,
        openLibraryBook,
        status
      );

      res.status(201).json({
        success: true,
        data: savedBook,
        message: "Livre ajouté à votre bibliothèque et sauvegardé en BDD",
      });
    } catch (error) {
      if (error instanceof BookError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code,
        });
        return;
      }

      console.error("❌ Erreur sauvegarde livre:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la sauvegarde du livre",
        code: "SAVE_ERROR",
      });
    }
  }

  /**
   * GET /api/books/library
   * Récupère tous les livres de la bibliothèque de l'utilisateur connecté
   */
  static async getUserLibrary(
    req: SessionRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.session?.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Utilisateur non authentifié",
          code: "NOT_AUTHENTICATED",
        });
        return;
      }

      // Importer les modèles et associations
      await import("../models/association.js");
      const { User } = await import("../models/user.js");
      const { Library } = await import("../models/Library.js");
      const { Books } = await import("../models/Books.js");

      // Récupérer l'utilisateur avec ses bibliothèques et leurs livres
      const user = await User.findByPk(userId, {
        include: [
          {
            model: Library,
            as: "UserHasManyLibrary",
            include: [
              {
                model: Books,
                as: "libraryhasbook",
                through: { attributes: [] }, // Exclure les attributs de la table de liaison
              },
            ],
          },
        ],
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: "Utilisateur introuvable",
          code: "USER_NOT_FOUND",
        });
        return;
      }

      // Extraire tous les livres de toutes les bibliothèques de l'utilisateur
      const allBooks: any[] = [];
      if (user.get("UserHasManyLibrary")) {
        const libraries = user.get("UserHasManyLibrary") as any[];
        libraries.forEach((library) => {
          if (library.libraryhasbook) {
            allBooks.push(...library.libraryhasbook);
          }
        });
      }

      // Transformer les données en format OpenLibrary
      const formattedBooks = allBooks.map((book) => ({
        title: book.title,
        authors: [], // TODO: Récupérer les auteurs si besoin
        isbn13: book.isbn,
        publishYear: book.published_at
          ? new Date(book.published_at).getFullYear()
          : undefined,
        pageCount: book.nb_pages,
        subjects: [],
        coverUrl: book.image || undefined, // Utiliser l'URL directement
        openLibraryId: `/books/${book.id}`,
        description: book.summary,
      }));

      res.status(200).json({
        success: true,
        data: formattedBooks,
        message: "Bibliothèque récupérée avec succès",
        total: formattedBooks.length,
      });
    } catch (error) {
      console.error("❌ Erreur récupération bibliothèque:", error);
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la récupération de la bibliothèque",
        code: "SERVER_ERROR",
      });
    }
  }

  /**
   * PUT /api/books/status/:id
   * Met à jour le statut d'un livre dans la bibliothèque de l'utilisateur
   */
  static async updateBookStatus(
    req: SessionRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.session?.user?.id;
      const bookId = req.params.id;
      const { status } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Utilisateur non authentifié",
          code: "NOT_AUTHENTICATED",
        });
        return;
      }

      if (!bookId || !status) {
        res.status(400).json({
          success: false,
          message: "ID du livre et statut requis",
          code: "MISSING_PARAMETERS",
        });
        return;
      }

      // Importer les modèles nécessaires
      const { User } = await import("../models/user.js");
      const { Library } = await import("../models/Library.js");
      const { Books } = await import("../models/Books.js");
      const { sequelize } = await import("../db/sequelize.js");

      // Vérifier que l'utilisateur existe
      const user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: "Utilisateur introuvable",
          code: "USER_NOT_FOUND",
        });
        return;
      }

      // Vérifier que le livre existe
      const book = await Books.findByPk(bookId);
      if (!book) {
        res.status(404).json({
          success: false,
          message: "Livre introuvable",
          code: "BOOK_NOT_FOUND",
        });
        return;
      }

      // Récupérer la première bibliothèque de l'utilisateur (ou créer une logique plus complexe)
      let library = await Library.findOne({
        where: { id_user: userId },
      });

      // Si pas de bibliothèque, en créer une par défaut
      if (!library) {
        library = await Library.create({
          id_user: userId,
          name: "Ma bibliothèque",
          created_at: new Date(),
          updated_at: new Date(),
        });
      }

      // Mettre à jour le statut dans la table de liaison BOOK_LIBRARY
      // Utilisation d'une requête raw SQL pour mettre à jour la table de liaison
      await sequelize.query(
        `UPDATE book_library 
         SET status = :status, updated_at = NOW() 
         WHERE id_library = :libraryId AND id_book = :bookId`,
        {
          replacements: {
            status: status,
            libraryId: library.get("id"),
            bookId: bookId,
          },
        }
      );

      res.status(200).json({
        success: true,
        message: "Statut du livre mis à jour avec succès",
        data: {
          bookId: bookId,
          status: status,
        },
      });
    } catch (error) {
      console.error("❌ Erreur mise à jour statut:", error);
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la mise à jour du statut",
        code: "SERVER_ERROR",
      });
    }
  }

  /**
   * POST /api/books/library/add
   * Ajoute un livre OpenLibrary à la bibliothèque de l'utilisateur
   */
  static async addBookToLibrary(
    req: SessionRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.session?.user?.id;
      const { openLibraryBook } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Utilisateur non authentifié",
          code: "NOT_AUTHENTICATED",
        });
        return;
      }

      if (!openLibraryBook) {
        res.status(400).json({
          success: false,
          message: "Données du livre requises",
          code: "MISSING_BOOK_DATA",
        });
        return;
      }

      // Importer les modèles nécessaires
      const { User } = await import("../models/user.js");
      const { Library } = await import("../models/Library.js");
      const { Books } = await import("../models/Books.js");
      const { sequelize } = await import("../db/sequelize.js");

      // Vérifier que l'utilisateur existe
      const user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: "Utilisateur introuvable",
          code: "USER_NOT_FOUND",
        });
        return;
      }

      // Récupérer ou créer la bibliothèque de l'utilisateur
      let library = await Library.findOne({
        where: { id_user: userId },
      });

      if (!library) {
        library = await Library.create({
          id_user: userId,
          name: "Ma bibliothèque",
          created_at: new Date(),
          updated_at: new Date(),
        });
      }

      // Vérifier si le livre existe déjà dans la base
      let book = await Books.findOne({
        where: { isbn: openLibraryBook.isbn13 || openLibraryBook.isbn },
      });

      // Si le livre n'existe pas, le créer
      if (!book) {
        book = await Books.create({
          title: openLibraryBook.title,
          isbn: openLibraryBook.isbn13 || openLibraryBook.isbn,
          published_at: openLibraryBook.publishYear
            ? new Date(`${openLibraryBook.publishYear}-01-01`)
            : null,
          nb_pages: openLibraryBook.pageCount || null,
          summary: openLibraryBook.description || null,
          image: openLibraryBook.coverUrl || null,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }

      // Vérifier si le livre est déjà dans la bibliothèque
      const existingRelation = await sequelize.query(
        `SELECT * FROM book_library 
         WHERE id_library = :libraryId AND id_book = :bookId`,
        {
          replacements: {
            libraryId: library.get("id"),
            bookId: book.get("id"),
          },
        }
      );

      if (existingRelation[0] && (existingRelation[0] as any[]).length > 0) {
        res.status(409).json({
          success: false,
          message: "Ce livre est déjà dans votre bibliothèque",
          code: "BOOK_ALREADY_EXISTS",
        });
        return;
      }

      // Ajouter le livre à la bibliothèque
      await sequelize.query(
        `INSERT INTO book_library (id_library, id_book, status, created_at, updated_at)
         VALUES (:libraryId, :bookId, 'to_read', NOW(), NOW())`,
        {
          replacements: {
            libraryId: library.get("id"),
            bookId: book.get("id"),
          },
        }
      );

      res.status(201).json({
        success: true,
        message: "Livre ajouté à votre bibliothèque avec succès",
        data: {
          bookId: book.get("id"),
          libraryId: library.get("id"),
          status: "to_read",
        },
      });
    } catch (error) {
      console.error("❌ Erreur ajout livre à la bibliothèque:", error);
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de l'ajout du livre",
        code: "SERVER_ERROR",
      });
    }
  }
}
