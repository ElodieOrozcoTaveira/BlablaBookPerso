import "./LivresPopulaires.scss";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useMyBooksStore } from "../../store/addBook";
import { useState, useEffect } from "react";
import { BiSolidBookAdd } from "react-icons/bi";
import { booksApi, type OpenLibraryBook } from "../../api/booksApi";

const searchTerms = [
  "fiction",
  "mystery",
  "romance",
  "fantasy",
  "science",
  "history",
  "adventure",
  "classic",
  "novel",
  "literature",
];

export default function PopularBooks() {
  const navigate = useNavigate();
  const [popularBooks, setPopularBooks] = useState<OpenLibraryBook[]>([]);
  const [loading, setLoading] = useState(true);
  const addBook = useMyBooksStore((state) => state.addBook);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchPopularBooks = async () => {
      setLoading(true);
      try {
        const randomTerm =
          searchTerms[Math.floor(Math.random() * searchTerms.length)];

        const response = await booksApi.searchBooks(randomTerm, 20);
        const allBooks: OpenLibraryBook[] = response.data || [];

        const filteredBooks = allBooks.filter(
          (b) => b.title && b.title.length < 40
        );
        const shuffled = filteredBooks.sort(() => 0.5 - Math.random());
        const topBooks = shuffled.slice(0, 20);
        setPopularBooks(topBooks);
      } catch (error) {
        console.error("Erreur récupération livres populaires:", error);
        setPopularBooks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPopularBooks();
  }, []);

  const handleAddBook = (book: OpenLibraryBook) => {
    if (!user) {
      navigate("/login");
      return;
    }
    // Adapter le livre OpenLibrary au format attendu par le store
    const bookForStore = {
      id: book.openLibraryId,
      title: book.title,
      authors: booksApi.utils.formatAuthors(book.authors),
      cover_url: book.coverUrl || "/placeholder-book.png", // Le store attend une string, URL par défaut
      publication_year: book.publishYear || 0,
      isbn: book.isbn13 || book.isbn10,
      description: book.description,
      open_library_key: book.openLibraryId,
    };
    addBook(bookForStore);
    navigate("/MesLivres");
  };

  if (loading) {
    return <div>Chargement des livres populaires...</div>;
  }

  if (popularBooks.length === 0) {
    return <div>Aucun livre populaire disponible.</div>;
  }

  return (
    <section
      className="popular-books-grid"
      aria-label="Liste des livres populaires"
    >
      {popularBooks.map((book) => (
        <div
          key={
            book.openLibraryId ||
            book.isbn13 ||
            book.isbn10 ||
            `book-${book.title}`
          }
          className="popular-books-grid__item"
          onClick={() => {
            const isbn = book.isbn13 || book.isbn10;
            if (isbn) {
              navigate(`/books/${isbn}`);
            } else {
              alert("Ce livre n'a pas d'ISBN.");
            }
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            const isbn = book.isbn13 || book.isbn10;
            if ((e.key === "Enter" || e.key === " ") && isbn) {
              navigate(`/books/${isbn}`);
            }
          }}
          aria-label={`Voir les détails du livre ${book.title}`}
        >
          {book.coverUrl ? (
            <img
              src={String(book.coverUrl || "")}
              alt={book.title}
              onError={(e) => (e.currentTarget.src = "/placeholder-book.png")}
              className="popular-books-grid__cover"
            />
          ) : (
            <div className="popular-books-grid__no-cover">
              Pas de couverture
            </div>
          )}
          <div className="popular-books-grid__title">{book.title}</div>
          <div className="popular-books-grid__authors">
            {booksApi.utils.formatAuthors(book.authors)}
          </div>
          <button
            aria-label={`Ajouter le livre ${book.title} à ma bibliothèque`}
            onClick={(e) => {
              e.stopPropagation();
              handleAddBook(book);
            }}
            className="add-btn"
          >
            <BiSolidBookAdd aria-hidden="true" focusable="false" />
          </button>
        </div>
      ))}
    </section>
  );
}
