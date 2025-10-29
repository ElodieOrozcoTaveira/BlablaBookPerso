// src/components/BookSearch.tsx
import React, { useState } from "react";
import "./BookSearch.scss";
import { booksApi } from "../../../api/booksApi";
import { useMyBooksStore } from "../../../store/addBook";
import type { OpenLibraryBook } from "../../../api/booksApi";

/**
 * COMPOSANT DE RECHERCHE DE LIVRES
 * Intégration OpenLibrary + backend
 */
const BookSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<OpenLibraryBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<OpenLibraryBook | null>(null);

  const addBookToStore = useMyBooksStore((state) => state.addBook);

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
   * Détails d’un livre
   */
  const handleBookDetails = async (book: OpenLibraryBook) => {
    try {
      const response = await booksApi.getBookDetails(book.openLibraryId);
      setSelectedBook(response.data);
    } catch (err) {
      console.error("❌ Erreur lors de la récupération des détails :", err);
    }
  };

  /**
   * Sauvegarde d’un livre dans la BDD et le store Zustand
   */
  const handleSaveBook = async (book: OpenLibraryBook) => {
    try {
      const response = await booksApi.saveBook({
        openLibraryId: book.openLibraryId,
        status: "to_read",
      });

      const savedBookData = response.data;

      addBookToStore({
        id: savedBookData.id?.toString() || book.openLibraryId,
        title: savedBookData.title || book.title,
        authors: book.authors?.join(", ") || "Auteur inconnu",
        cover_url:
          savedBookData.cover_url || book.coverUrl || "/book-placeholder.svg",
        publication_year: book.publishYear ? Number(book.publishYear) : 2024,
        isbn: savedBookData.isbn || book.isbn13?.[0] || "",
        open_library_key: book.openLibraryId,
        read: false,
      });

      alert("Livre ajouté à votre bibliothèque !");
    } catch (err: any) {
      console.error("❌ Erreur sauvegarde :", err);

      if (err.response?.status === 409) {
        alert("Ce livre est déjà dans votre bibliothèque !");
      } else if (err.response?.status === 401) {
        alert("Vous devez être connecté pour ajouter un livre");
      } else {
        alert("Erreur lors de la sauvegarde");
      }
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      {/* Barre de recherche */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un livre (titre, auteur, ISBN...)"
          style={{
            width: "70%",
            padding: 10,
            margin: "0 auto",
            border: "1px solid #ddd",
            borderRadius: 4,
            display: "block",
          }}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          style={{
            padding: "8.5px 18.5px",
            backgroundColor: "#CBA469",
            color: "white",
            border: "#442020 solid 2px",
            borderRadius: 4,
            cursor: "pointer",
            display: "block",
            margin: "-38px auto 0 auto",
          }}
        >
          {loading ? "Recherche..." : "Rechercher"}
        </button>
      </div>

      {/* Erreurs */}
      {error && (
        <div style={{ color: "red", marginBottom: 20 }}>❌ {error}</div>
      )}

      {/* Résultats trouvés */}
      {books.length > 0 && (
        <div>
          <h2>📚 Résultats ({books.length} livres)</h2>
          <div style={{ display: "grid", gap: 15 }}>
            {books.map((book) => (
              <div
                key={book.openLibraryId}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 15,
                  display: "flex",
                  gap: 15,
                }}
              >
                {book.coverUrl && (
                  <img
                    src={book.coverUrl}
                    alt={`Couverture de ${book.title}`}
                    style={{
                      width: 80,
                      height: 120,
                      objectFit: "cover",
                      borderRadius: 4,
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}

                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 10px 0" }}>{book.title}</h3>

                  {book.authors && (
                    <p style={{ margin: "5px 0", color: "#666" }}>
                      👤 {booksApi.utils.formatAuthors(book.authors)}
                    </p>
                  )}

                  {book.publishYear && (
                    <p style={{ margin: "5px 0", color: "#666" }}>
                      📅 {book.publishYear}
                    </p>
                  )}

                  <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                    <button
                      onClick={() => handleBookDetails(book)}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#CBA469",
                        color: "white",
                        fontWeight: "bold",
                        border: "none",
                        borderRadius: 3,
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
                        fontWeight: "bold",
                        border: "none",
                        borderRadius: 3,
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

      {/* ✅ Message "Aucun livre trouvé" */}
      {!loading && query && books.length === 0 && !error && (
        <p style={{ color: "#555", textAlign: "center" }}>
          Aucun livre trouvé pour « {query} »
        </p>
      )}

      {/* Détails du livre sélectionné */}
      {selectedBook && (
        <div
          style={{
            marginTop: 30,
            padding: 20,
            backgroundColor: "#f2e5d0",
            border: "solid 2px #442020",
            borderRadius: 8,
            fontFamily: "Poppins",
          }}
        >
          <h2>📖 Détails de : {selectedBook.title}</h2>

          {selectedBook.description && (
            <div style={{ marginTop: 15 }}>
              <h4>📝 Description :</h4>
              <p style={{ lineHeight: 1.6 }}>{selectedBook.description}</p>
            </div>
          )}

          <button
            onClick={() => setSelectedBook(null)}
            style={{
              marginTop: 15,
              padding: "8px 16px",
              backgroundColor: "#442020",
              fontWeight: "bold",
              color: "white",
              border: "none",
              borderRadius: 4,
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
