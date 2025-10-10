// src/api/booksApi.ts
import axios from "./axiosConfig";

/**
 * TYPES FRONTEND POUR LES LIVRES
 */
export interface OpenLibraryBook {
  title: string;
  authors?: string[];
  isbn13?: string;
  isbn10?: string;
  publishYear?: number;
  pageCount?: number;
  subjects?: string[];
  coverUrl?: string;
  openLibraryId: string;
  description?: string;
}

export interface BookSearchResponse {
  success: boolean;
  data: OpenLibraryBook[];
  total: number;
  query: string;
  message: string;
}

export interface BookDetailsResponse {
  success: boolean;
  data: OpenLibraryBook;
  message: string;
}

export interface SaveBookRequest {
  openLibraryId: string;
  status?: "to_read" | "reading" | "read";
}

/**
 * API LIVRES FRONTEND
 *
 * Service pour interagir avec l'API OpenLibrary via notre backend
 */
export const booksApi = {
  /**
   * Recherche de livres sur OpenLibrary
   * @param query - Terme de recherche (titre, auteur, etc.)
   * @param limit - Nombre de résultats (défaut: 20)
   */
  searchBooks: async (
    query: string,
    limit: number = 20
  ): Promise<BookSearchResponse> => {
    try {
      const response = await axios.get("/api/books/search", {
        params: { q: query, limit },
      });
      return response.data;
    } catch (error) {
      console.error("❌ Erreur recherche livres:", error);
      throw error;
    }
  },

  /**
   * Recherche par ISBN
   * @param isbn - Code ISBN-10 ou ISBN-13
   */
  searchByISBN: async (isbn: string): Promise<BookDetailsResponse> => {
    try {
      const response = await axios.get(`/api/books/isbn/${isbn}`);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur recherche ISBN:", error);
      throw error;
    }
  },

  /**
   * Récupère les détails d'un livre OpenLibrary
   * @param openLibraryId - ID OpenLibrary (ex: "works/OL82563W")
   */
  getBookDetails: async (
    openLibraryId: string
  ): Promise<BookDetailsResponse> => {
    try {
      // Nettoyer l'ID pour s'assurer qu'il n'y a pas de "/" au début
      const cleanId = openLibraryId.startsWith("/")
        ? openLibraryId.slice(1)
        : openLibraryId;
      const response = await axios.get(`/api/books/openlibrary/${cleanId}`);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur détails livre:", error);
      throw error;
    }
  },

  /**
   * Sauvegarde un livre dans la bibliothèque utilisateur
   * @param bookData - Données du livre à sauvegarder
   */
  saveBook: async (bookData: SaveBookRequest): Promise<any> => {
    try {
      const response = await axios.post("/api/books/save", bookData);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur sauvegarde livre:", error);
      throw error;
    }
  },

  /**
   * Récupère la bibliothèque de l'utilisateur connecté
   */
  getUserLibrary: async (): Promise<BookSearchResponse> => {
    try {
      const response = await axios.get("/api/books/library");
      return response.data;
    } catch (error) {
      console.error("❌ Erreur récupération bibliothèque:", error);
      throw error;
    }
  },

  /**
   * Ajoute un livre OpenLibrary à la bibliothèque utilisateur
   * @param openLibraryBook - Livre OpenLibrary à ajouter
   */
  addBookToLibrary: async (openLibraryBook: OpenLibraryBook): Promise<any> => {
    try {
      const response = await axios.post("/api/books/library/add", {
        openLibraryBook,
      });
      return response.data;
    } catch (error) {
      console.error("❌ Erreur ajout livre à la bibliothèque:", error);
      throw error;
    }
  },

  /**
   * Met à jour le statut d'un livre dans la bibliothèque
   * @param bookId - ID du livre
   * @param status - Nouveau statut
   */
  updateBookStatus: async (
    bookId: string,
    status: "to_read" | "reading" | "read"
  ): Promise<any> => {
    try {
      const response = await axios.put(`/api/books/status/${bookId}`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error("❌ Erreur mise à jour statut:", error);
      throw error;
    }
  },

  /**
   * Supprime un livre de la bibliothèque utilisateur
   * @param bookId - ID du livre à supprimer
   */
  removeBookFromLibrary: async (bookId: string): Promise<any> => {
    try {
      const response = await axios.delete(`/api/books/library/${bookId}`);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur suppression livre:", error);
      throw error;
    }
  },

  /**
   * Utilitaires pour les images de couverture
   */
  utils: {
    /**
     * Génère l'URL de couverture OpenLibrary
     * @param coverId - ID de couverture
     * @param size - Taille ('S', 'M', 'L')
     */
    getCoverUrl: (coverId: number, size: "S" | "M" | "L" = "M"): string => {
      return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
    },

    /**
     * Formate la liste des auteurs
     * @param authors - Tableau des auteurs
     */
    formatAuthors: (authors?: string[]): string => {
      if (!authors || authors.length === 0) return "Auteur inconnu";
      if (authors.length === 1) return authors[0];
      if (authors.length === 2) return authors.join(" et ");
      return `${authors.slice(0, -1).join(", ")} et ${
        authors[authors.length - 1]
      }`;
    },

    /**
     * Formate l'année de publication
     * @param year - Année de publication
     */
    formatYear: (year?: number): string => {
      return year ? `(${year})` : "";
    },

    /**
     * Génère un résumé court des sujets
     * @param subjects - Tableau des sujets
     * @param maxCount - Nombre max de sujets à afficher
     */
    formatSubjects: (subjects?: string[], maxCount: number = 3): string => {
      if (!subjects || subjects.length === 0) return "";
      const displaySubjects = subjects.slice(0, maxCount);
      const remaining = subjects.length - maxCount;
      return (
        displaySubjects.join(", ") +
        (remaining > 0 ? ` +${remaining} autres` : "")
      );
    },
  },
};

export default booksApi;
