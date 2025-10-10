import { Books } from "../models/Books.js";
import { Library } from "../models/Library.js";
import type { OpenLibraryBook } from "./OpenLibraryService.js";

/**
 * ERREUR PERSONNALISÉE POUR LES LIVRES
 */
export class BookError extends Error {
  public statusCode: number;
  public code: string;

  constructor(
    message: string,
    statusCode: number = 400,
    code: string = "BOOK_ERROR"
  ) {
    super(message);
    this.name = "BookError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * SERVICE LIVRES - VERSION SIMPLIFIÉE
 *
 * Gère la sauvegarde des livres OpenLibrary dans la BDD locale
 */
export class BookService {
  /**
   * Sauvegarde un livre d'OpenLibrary dans la BDD locale
   */
  static async saveFromOpenLibrary(
    userId: number,
    openLibraryBook: OpenLibraryBook,
    status: "to_read" | "reading" | "read" = "to_read"
  ) {
    try {
      // 1. Vérifier si le livre existe déjà avec l'openLibraryId
      let book = await Books.findOne({
        where: {
          // Adapter selon votre modèle Books
          title: openLibraryBook.title,
        },
      });

      // 2. Si le livre n'existe pas, le créer
      if (!book) {
        // Créer le livre avec les champs disponibles dans votre modèle
        book = await Books.create({
          title: openLibraryBook.title,
          isbn: openLibraryBook.isbn13 || openLibraryBook.isbn10 || null,
          summary: openLibraryBook.description || null,
          nb_pages: openLibraryBook.pageCount || null,
          published_at: openLibraryBook.publishYear
            ? new Date(openLibraryBook.publishYear, 0, 1)
            : null,
          image: openLibraryBook.coverUrl ? true : false,
        } as any);

        console.log(`✅ Livre créé en BDD: ${book.get("title")}`);
      } else {
        console.log(`📚 Livre existant trouvé: ${book.get("title")}`);
      }

      // 3. Vérifier si le livre est déjà dans la bibliothèque de l'utilisateur
      const existingLibraryEntry = await Library.findOne({
        where: {
          // Adapter selon votre modèle Library
          // user_id: userId,
          // book_id: book.get('id')
        },
      });

      if (existingLibraryEntry) {
        throw new BookError(
          "Ce livre est déjà dans votre bibliothèque",
          409,
          "BOOK_ALREADY_IN_LIBRARY"
        );
      }

      // 4. Ajouter le livre à la bibliothèque de l'utilisateur
      // Note: Adapter selon votre modèle Library
      await Library.create({
        // Adapter les champs selon votre modèle
        // user_id: userId,
        // book_id: book.get('id'),
        // status: status
      } as any);

      console.log(
        `✅ Livre ajouté à la bibliothèque de l'utilisateur ${userId}`
      );

      // 5. Retourner le livre avec les infos de bibliothèque
      return {
        id: book.get("id"),
        title: book.get("title"),
        isbn: book.get("isbn"),
        summary: book.get("summary"),
        pages: book.get("nb_pages"),
        publishedAt: book.get("published_at"),
        image: book.get("image"),
        openLibraryData: openLibraryBook,
        libraryStatus: status,
        addedAt: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof BookError) {
        throw error;
      }
      console.error("❌ Erreur lors de la sauvegarde du livre:", error);
      throw new BookError(
        "Erreur lors de la sauvegarde du livre en base de données",
        500,
        "SAVE_ERROR"
      );
    }
  }

  /**
   * Récupère les livres de la bibliothèque d'un utilisateur
   */
  static async getUserLibrary(userId: number) {
    try {
      // TODO: Implémenter la récupération des livres de l'utilisateur
      // selon votre modèle Library et les associations

      console.log(`📖 Récupération bibliothèque utilisateur ${userId}`);

      return {
        message: "Récupération bibliothèque à implémenter",
        userId,
      };
    } catch (error) {
      console.error("❌ Erreur récupération bibliothèque:", error);
      throw new BookError(
        "Erreur lors de la récupération de la bibliothèque",
        500,
        "LIBRARY_FETCH_ERROR"
      );
    }
  }
}
