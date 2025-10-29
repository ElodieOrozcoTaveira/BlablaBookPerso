import axios from "axios";
class OpenLibraryService {
    static baseUrl = "https://openlibrary.org";
    /**
     * Recherche des livres sur OpenLibrary
     * @param query - Terme de recherche (titre, auteur, ISBN...)
     * @param limit - Nombre de résultats (défaut: 20)
     */
    static async searchBooks(query, limit = 20) {
        try {
            const response = await axios.get(`${this.baseUrl}/search.json`, {
                params: {
                    q: query,
                    limit,
                    fields: "key,title,author_name,isbn,first_publish_year,number_of_pages_median,subject,cover_i",
                },
            });
            const books = response.data.docs.map((book) => this.formatBookData(book));
            return books;
        }
        catch (error) {
            console.error("Erreur recherche OpenLibrary:", error);
            throw new Error("Impossible de rechercher les livres");
        }
    }
    /**
     * Récupère les détails d'un livre par son ID OpenLibrary
     * @param openLibraryId - ID du livre sur OpenLibrary (ex: "/works/OL82563W")
     */
    static async getBookDetails(openLibraryId) {
        try {
            const response = await axios.get(`${this.baseUrl}${openLibraryId}.json`);
            const book = response.data;
            // Récupération des auteurs si nécessaire
            let authors = [];
            if (book.authors && book.authors.length > 0) {
                const authorPromises = book.authors
                    .filter((author) => author && (author.author?.key || author.key)) // Filtrer les auteurs valides
                    .map((author) => {
                    // Gérer les deux formats possibles
                    const authorKey = author.author?.key || author.key;
                    return axios.get(`${this.baseUrl}${authorKey}.json`);
                });
                if (authorPromises.length > 0) {
                    const authorResponses = await Promise.all(authorPromises);
                    authors = authorResponses.map((res) => res.data.name).filter(Boolean);
                }
            }
            return {
                title: book.title || "Titre non disponible",
                authors,
                description: book.description?.value || book.description || undefined,
                subjects: book.subjects?.slice(0, 5) || undefined,
                openLibraryId,
                coverUrl: book.covers?.[0]
                    ? this.getCoverUrl(book.covers[0])
                    : undefined,
            };
        }
        catch (error) {
            console.error("Erreur détails OpenLibrary:", error);
            throw new Error("Impossible de récupérer les détails du livre");
        }
    }
    /**
     * Formate les données de recherche OpenLibrary
     */
    static formatBookData(book) {
        return {
            title: book.title,
            authors: book.author_name || undefined,
            isbn13: book.isbn?.find((isbn) => isbn.length === 13) || undefined,
            isbn10: book.isbn?.find((isbn) => isbn.length === 10) || undefined,
            publishYear: book.first_publish_year || undefined,
            pageCount: book.number_of_pages_median || undefined,
            subjects: book.subject?.slice(0, 5) || undefined,
            coverUrl: book.cover_i ? this.getCoverUrl(book.cover_i) : undefined,
            openLibraryId: book.key,
        };
    }
    /**
     * Génère l'URL de couverture
     */
    static getCoverUrl(coverId) {
        return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
    }
    /**
     * Recherche par ISBN spécifique
     */
    static async searchByISBN(isbn) {
        try {
            const response = await axios.get(`${this.baseUrl}/api/books`, {
                params: {
                    bibkeys: `ISBN:${isbn}`,
                    format: "json",
                    jscmd: "data",
                },
            });
            const bookData = response.data[`ISBN:${isbn}`];
            if (!bookData)
                return null;
            return {
                title: bookData.title || "Titre non disponible",
                authors: bookData.authors?.map((author) => author.name).filter(Boolean) ||
                    undefined,
                isbn13: isbn.length === 13 ? isbn : undefined,
                isbn10: isbn.length === 10 ? isbn : undefined,
                publishYear: bookData.publish_date
                    ? new Date(bookData.publish_date).getFullYear()
                    : undefined,
                pageCount: bookData.number_of_pages || undefined,
                subjects: bookData.subjects
                    ?.map((s) => s.name)
                    .filter(Boolean)
                    .slice(0, 5) || undefined,
                coverUrl: bookData.cover?.medium || undefined,
                openLibraryId: bookData.key || `ISBN:${isbn}`,
            };
        }
        catch (error) {
            console.error("Erreur recherche ISBN:", error);
            return null;
        }
    }
}
export { OpenLibraryService };
//# sourceMappingURL=OpenLibraryService.js.map