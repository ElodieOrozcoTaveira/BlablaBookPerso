import { Books } from "../models/Books.js";
import { Library } from "../models/Library.js";
import { sequelize } from "../db/sequelize.js";
/**
 * ERREUR PERSONNALISÉE POUR LES LIVRES
 */
export class BookError extends Error {
    statusCode;
    code;
    constructor(message, statusCode = 400, code = "BOOK_ERROR") {
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
    static async saveFromOpenLibrary(userId, openLibraryBook, status = "to_read") {
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
                    cover_url: openLibraryBook.coverUrl || null,
                });
                console.log(`✅ Livre créé en BDD: ${book.get("title")}`);
            }
            else {
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
                throw new BookError("Ce livre est déjà dans votre bibliothèque", 409, "BOOK_ALREADY_IN_LIBRARY");
            }
            // 4. Récupérer ou créer la bibliothèque de l'utilisateur
            let userLibrary = await Library.findOne({
                where: { id_user: userId },
            });
            if (!userLibrary) {
                // Créer une bibliothèque par défaut pour l'utilisateur
                userLibrary = await Library.create({
                    name: "Ma Bibliothèque",
                    id_user: userId, // Utilise id_user car c'est le nom dans la BDD
                });
                console.log(`📚 Bibliothèque créée pour l'utilisateur ${userId}`);
            }
            // 5. Ajouter le livre à la bibliothèque via la table de liaison
            const bookId = book.get("id");
            const libraryId = userLibrary.get("id");
            console.log(`🔗 Création relation BOOK_LIBRARY: book=${bookId}, library=${libraryId}`);
            await sequelize.query(`
        INSERT INTO "BOOK_LIBRARY" (id_book, id_library, created_at, updated_at)
        VALUES ($1, $2, NOW(), NOW())
        ON CONFLICT (id_book, id_library) DO NOTHING
      `, {
                bind: [bookId, libraryId],
            });
            console.log(`✅ Relation BOOK_LIBRARY créée avec succès`);
            console.log(`✅ Livre "${book.get("title")}" ajouté à la bibliothèque de l'utilisateur ${userId}`);
            // 6. Retourner le livre avec les infos de bibliothèque
            return {
                id: book.get("id"),
                title: book.get("title"),
                isbn: book.get("isbn"),
                summary: book.get("summary"),
                pages: book.get("nb_pages"),
                publishedAt: book.get("published_at"),
                image: book.get("image"),
                cover_url: book.get("cover_url"),
                openLibraryData: openLibraryBook,
                libraryStatus: status,
                addedAt: new Date().toISOString(),
            };
        }
        catch (error) {
            if (error instanceof BookError) {
                throw error;
            }
            console.error("❌ Erreur lors de la sauvegarde du livre:", error);
            throw new BookError("Erreur lors de la sauvegarde du livre en base de données", 500, "SAVE_ERROR");
        }
    }
    /**
     * Récupère les livres de la bibliothèque d'un utilisateur
     */
    static async getUserLibrary(userId) {
        try {
            console.log(`📖 Récupération bibliothèque utilisateur ${userId}`);
            // Requête SQL directe pour joindre les tables et récupérer les livres de l'utilisateur
            const query = `
        SELECT DISTINCT 
          b.id_book as id, 
          b.title, 
          b.isbn, 
          b.summary, 
          b.nb_pages, 
          b.published_at, 
          b.image, 
          b.cover_url
        FROM "BOOK" b
        INNER JOIN "BOOK_LIBRARY" bl ON b.id_book = bl.id_book
        INNER JOIN "LIBRARY" l ON bl.id_library = l.id_library
        WHERE l.id_user = :userId
      `;
            const { QueryTypes } = await import("sequelize");
            const { sequelize } = await import("../db/sequelize.js");
            const books = await sequelize.query(query, {
                type: QueryTypes.SELECT,
                replacements: { userId },
            });
            console.log(`✅ ${books.length} livre(s) trouvé(s) pour l'utilisateur ${userId}`);
            // Formater les données pour le frontend
            return books.map((book) => ({
                id: book.id?.toString(),
                title: book.title,
                authors: "Auteur inconnu", // TODO: Récupérer les auteurs depuis BOOK_AUTHOR
                cover_url: book.cover_url,
                publication_year: book.published_at
                    ? new Date(book.published_at).getFullYear()
                    : 2024,
                isbn: book.isbn,
                description: book.summary,
                open_library_key: `book_${book.id}`,
                read: false,
            }));
        }
        catch (error) {
            console.error("❌ Erreur récupération bibliothèque:", error);
            throw new BookError("Erreur lors de la récupération de la bibliothèque", 500, "LIBRARY_FETCH_ERROR");
        }
    }
}
//# sourceMappingURL=BookService.js.map