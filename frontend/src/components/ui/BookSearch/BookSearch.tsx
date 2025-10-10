// src/components/BookSearch.tsx
import "../BookSearch/BookSearch.scss"; 
import React, { useState } from "react";
import { booksApi, type OpenLibraryBook } from "../../../api/booksApi";

/**
 * COMPOSANT DE RECHERCHE DE LIVRES
 *
 * Démontre l'intégration OpenLibrary avec votre backend
 */
const BookSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<OpenLibraryBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<OpenLibraryBook | null>(
    null
  );

  /**
   * Recherche de livres
   */
  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await booksApi.searchBooks(query.trim(), 5);
      setBooks(response.data);
      console.log(`✅ ${response.total} livre(s) trouvé(s)`);
    } catch (err) {
      setError("Erreur lors de la recherche de livres");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Récupération des détails d'un livre
   */
  const handleBookDetails = async (book: OpenLibraryBook) => {
    try {
      const response = await booksApi.getBookDetails(book.openLibraryId);
      setSelectedBook(response.data);
      console.log("✅ Détails récupérés:", response.data);
    } catch (err) {
      console.error("❌ Erreur détails:", err);
    }
  };

  /**
   * Sauvegarde d'un livre
   */
  const handleSaveBook = async (book: OpenLibraryBook) => {
    try {
      const response = await booksApi.saveBook({
        openLibraryId: book.openLibraryId,
        status: "to_read",
      });
      console.log("✅ Livre sauvegardé:", response);
      alert("Livre ajouté à votre bibliothèque !");
    } catch (err) {
      console.error("❌ Erreur sauvegarde:", err);
      alert("Erreur lors de la sauvegarde");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>

      {/* Zone de recherche */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un livre (titre, auteur, ISBN...)"
          style={{
            width: "70%",
            padding: "10px",
            marginRight: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          style={{
            padding: "10px 20px",
            backgroundColor: "#CBA469",
            color: "white",
            border: "#442020 solid 2px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {loading ? "Recherche..." : "Rechercher"}
        </button>
      </div>

      {/* Gestion des erreurs */}
      {error && (
        <div style={{ color: "red", marginBottom: "20px" }}>❌ {error}</div>
      )}

      {/* Résultats de recherche */}
      {books.length > 0 && (
        <div>
          <h2>📚 Résultats ({books.length} livres)</h2>
          <div style={{ display: "grid", gap: "15px" }}>
            {books.map((book) => (
              <div
                key={book.openLibraryId}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "15px",
                  display: "flex",
                  gap: "15px",
                }}
              >
                {/* Image de couverture */}
                {book.coverUrl && (
                  <img
                    src={book.coverUrl}
                    alt={`Couverture de ${book.title}`}
                    style={{
                      width: "80px",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}

                {/* Informations du livre */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 10px 0" }}>{book.title}</h3>

                  {book.authors && book.authors.length > 0 && (
                    <p style={{ margin: "5px 0", color: "#666" }}>
                      👤 {booksApi.utils.formatAuthors(book.authors)}
                    </p>
                  )}

                  {book.publishYear && (
                    <p style={{ margin: "5px 0", color: "#666" }}>
                      📅 {book.publishYear}
                    </p>
                  )}

                  {book.pageCount && (
                    <p style={{ margin: "5px 0", color: "#666" }}>
                      📖 {book.pageCount} pages
                    </p>
                  )}

                  {book.subjects && book.subjects.length > 0 && (
                    <p
                      style={{
                        margin: "5px 0",
                        color: "#666",
                        fontSize: "0.9em",
                      }}
                    >
                      🏷️ {booksApi.utils.formatSubjects(book.subjects)}
                    </p>
                  )}

                  {/* Actions */}
                  <div
                    style={{ marginTop: "10px", display: "flex", gap: "10px" }}
                  >
                    <button
                      onClick={() => handleBookDetails(book)}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#CBA469",
                        color: "white",
                        fontWeight:'bold',
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                        fontSize: "0.9em",
                      }}
                    >
                      📋 Détails
                    </button>

                    <button
                      onClick={() => handleSaveBook(book)}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#442020",
                        color: "white",
                        fontWeight:'bold',
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                        fontSize: "0.9em",
                      }}
                    >
                      ➕ Ajouter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Détails du livre sélectionné */}
      {selectedBook && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            backgroundColor: "#f2e5d0",
            border:'solid 2px #442020',
            borderRadius: "8px",
            fontFamily:'Poppins'
          }}
        >
          <h2>📖 Détails de : {selectedBook.title}</h2>

          {selectedBook.description && (
            <div style={{ marginTop: "15px" }}>
              <h4>📝 Description :</h4>
              <p style={{ lineHeight: 1.6 }}>{selectedBook.description}</p>
            </div>
          )}

          <button
            onClick={() => setSelectedBook(null)}
            style={{
              marginTop: "15px",
              padding: "8px 16px",
              backgroundColor: "#442020",
              fontWeight:'bold',
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            ✕ Fermer
          </button>
        </div>
      )}
    </div>
  );
};

export default BookSearch;
