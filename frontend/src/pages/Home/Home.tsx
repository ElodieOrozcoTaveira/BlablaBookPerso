import "./Home.scss";
import { BiSolidBookAdd } from "react-icons/bi";
import { IoBookmarkOutline } from "react-icons/io5"; // Nouvelle icône pour ajouter à une liste
import ListCard from "../../components/common/ListCard/ListCard";
import AddToListModal from "../../components/ui/Modal/AddToListModal";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Book } from "../../Types/Books";
import { useMyBooksStore } from "@/store/addBook";
import { useAuthStore } from "@/store/authStore";
import HomeHeader from "@/components/common/HomeHeader/HomeHader";
import { booksApi, type OpenLibraryBook } from "../../api/booksApi";
import BookSearch from "@/components/ui/BookSearch/BookSearch";

// Liste de listes populaires statique
const popularLists = [
  {
    id: 1,
    title: "Les Incontournables de la Fantasy",
    description:
      "Une sélection des meilleurs romans de fantasy pour débuter ou approfondir ce genre captivant.",
    bookCount: 15,
    username: "MagicReader",
  },
  {
    id: 2,
    title: "Classiques de la Littérature Française",
    description:
      "Les œuvres essentielles de la littérature française à lire absolument.",
    bookCount: 22,
    username: "ProfDeLettres",
  },
  {
    id: 3,
    title: "Science-Fiction Moderne",
    description:
      "Les dernières pépites de la SF contemporaine qui révolutionnent le genre.",
    bookCount: 12,
    username: "SciFiAddict",
  },
];

// Liste de termes pour obtenir des livres variés
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

export default function Home() {
  const navigate = useNavigate();
  const [popularBooks, setPopularBooks] = useState<OpenLibraryBook[]>([]);
  const [loading, setLoading] = useState(true);

  // États pour le carrousel
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const booksPerPage: number = 4;

  // États pour le modal d'ajout à une liste
  const [isAddToListModalOpen, setIsAddToListModalOpen] = useState(false);
  const [selectedBookForList, setSelectedBookForList] = useState<Book | null>(
    null
  );

  // Store et auth
  const user = useAuthStore((state) => state.user);
  const addBook = useMyBooksStore((state) => state.addBook);

  // Fonctions de navigation avec typage
  const nextSlide = (): void => {
    setCurrentIndex((prevIndex: number) =>
      prevIndex + booksPerPage >= popularBooks.length
        ? 0
        : prevIndex + booksPerPage
    );
  };

  const prevSlide = (): void => {
    setCurrentIndex((prevIndex: number) =>
      prevIndex === 0
        ? Math.max(0, popularBooks.length - booksPerPage)
        : prevIndex - booksPerPage
    );
  };

  const goToSlide = (slideIndex: number): void => {
    setCurrentIndex(slideIndex * booksPerPage);
  };

  // Gestionnaire d'erreur d'image typé
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ): void => {
    e.currentTarget.src = "/placeholder-book.png";
  };

  // Gestionnaire de clic sur livre typé
  const handleBookClick = (isbn: string | undefined): void => {
    if (isbn && isbn !== "undefined") {
      navigate(`/books/${isbn}`);
    } else {
      alert("Ce livre n'a pas d'ISBN");
    }
  };

  // Ajouter à "Mes Livres" (collection générale)
  const handleAddToMyBooks = (book: Book) => {
    if (!user) {
      navigate("/login");
      return;
    }
    addBook(book);
    navigate("/MesLivres");
  };

  // Ajouter à une liste spécifique
  const handleAddToList = (book: Book) => {
    if (!user) {
      navigate("/login");
      return;
    }
    setSelectedBookForList(book);
    setIsAddToListModalOpen(true);
  };

  // Fermer le modal
  const handleCloseModal = () => {
    setIsAddToListModalOpen(false);
    setSelectedBookForList(null);
  };

  useEffect(() => {
    const fetchRandomPopularBooks = async () => {
      try {
        // Sélectionne un terme de recherche aléatoire
        const randomTerm =
          searchTerms[Math.floor(Math.random() * searchTerms.length)];

        const response = await booksApi.searchBooks(randomTerm, 20);
        const allBooks: OpenLibraryBook[] = response.data || [];

        // Filtre les livres avec des titres de moins de 40 caractères pour une meilleure UI
        const filteredBooks = allBooks.filter(
          (book: OpenLibraryBook) =>
            book.title &&
            book.title.length < 40 &&
            book.authors &&
            book.authors.length > 0
        );
        setPopularBooks(filteredBooks);

        // Vérification qu'on a assez de livres filtrés
        if (filteredBooks.length === 0) {
          console.warn("Aucun livre avec titre <40 caractères");
          const shuffled = allBooks.sort(() => 0.5 - Math.random());
          const randomBooks = shuffled.slice(0, 8);
          setPopularBooks(randomBooks);
          return;
        }

        // Mélange le tableau et prend 16 livres au hasard
        const shuffled = allBooks.sort(() => 0.5 - Math.random());
        const randomBooks = shuffled.slice(0, 16);

        setPopularBooks(randomBooks);
      } catch (error) {
        console.error("Erreur lors de la récupération des livres:", error);
        setPopularBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRandomPopularBooks();
  }, []);

  return (
    <>
      <HomeHeader />
      <BookSearch/>
      <section className="home__section">
        <h2>Livres Populaires</h2>
        {loading ? (
          <div className="loading">Chargement des livres...</div>
        ) : (
          <div className="books-carousel">
            <button
              className="carousel-btn carousel-btn--prev"
              onClick={prevSlide}
              disabled={currentIndex === 0}
              type="button"
              aria-label="Livres précédents"
            >
              &#8249;
            </button>

            <div className="books-carousel__container">
              <div
                className="books-carousel__track"
                style={{
                  transform: `translateX(-${
                    (currentIndex * 100) / booksPerPage
                  }%)`,
                  transition: "transform 0.3s ease-in-out",
                }}
              >
                {popularBooks
                  .filter((book: OpenLibraryBook) => book.isbn13 || book.isbn10)
                  .map((book: OpenLibraryBook, index: number) => (
                    <div
                      key={
                        book.openLibraryId ||
                        book.isbn13 ||
                        book.isbn10 ||
                        `${book.title}-${index}`
                      }
                      className="books-carousel__item"
                      onClick={() => {
                        const isbn = book.isbn13 || book.isbn10;
                        navigate(`/books/${isbn}`);
                      }}
                      style={{ cursor: "pointer" }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                        if (e.key === "Enter" || e.key === " ") {
                          const isbn = book.isbn13 || book.isbn10;
                          if (isbn) {
                            handleBookClick(isbn);
                          }
                        }
                      }}
                    >
                      <img
                        src={String(book.coverUrl || "")}
                        alt={book.title || "Couverture de livre"}
                        className="books-carousel__cover"
                        onError={handleImageError}
                        onClick={() => {
                          const isbn = book.isbn13 || book.isbn10;
                          navigate(`/books/${isbn}`);
                        }}
                      />
                      <div className="book-carousel__title">
                        {book.title || "Titre non disponible"}
                      </div>
                      <div className="book-carousel__authors">
                        {booksApi.utils.formatAuthors(book.authors)}
                      </div>
                      <div className="book-carousel__date">
                        {book.publishYear || ""}
                      </div>

                      {/* Boutons d'action */}
                      <div className="book-actions">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Convertir OpenLibraryBook vers Book pour le store
                            const bookForStore: Book = {
                              id: book.openLibraryId,
                              title: book.title,
                              authors: booksApi.utils.formatAuthors(
                                book.authors
                              ),
                              cover_url: 0, // Le store attend un number
                              publication_year: book.publishYear || 0,
                              isbn: book.isbn13 || book.isbn10,
                              description: book.description,
                              open_library_key: book.openLibraryId,
                            };
                            handleAddToMyBooks(bookForStore);
                          }}
                          className="action-btn action-btn--primary"
                          title="Ajouter à mes livres"
                        >
                          <BiSolidBookAdd />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Convertir OpenLibraryBook vers Book pour le store
                            const bookForStore: Book = {
                              id: book.openLibraryId,
                              title: book.title,
                              authors: booksApi.utils.formatAuthors(
                                book.authors
                              ),
                              cover_url: 0, // Le store attend un number
                              publication_year: book.publishYear || 0,
                              isbn: book.isbn13 || book.isbn10,
                              description: book.description,
                              open_library_key: book.openLibraryId,
                            };
                            handleAddToList(bookForStore);
                          }}
                          className="action-btn action-btn--secondary"
                          title="Ajouter à une liste"
                        >
                          <IoBookmarkOutline />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <button
              className="carousel-btn carousel-btn--next"
              onClick={nextSlide}
              disabled={currentIndex + booksPerPage >= popularBooks.length}
              type="button"
              aria-label="Livres suivants"
            >
              &#8250;
            </button>
          </div>
        )}

        {/* Indicateurs de pagination */}
        {popularBooks.length > booksPerPage && (
          <div className="carousel-indicators">
            {Array.from({
              length: Math.ceil(popularBooks.length / booksPerPage),
            }).map((_, index: number) => (
              <button
                key={index}
                className={`indicator ${
                  index * booksPerPage === currentIndex ? "active" : ""
                }`}
                onClick={() => goToSlide(index)}
                type="button"
                aria-label={`Aller à la page ${index + 1}`}
              />
            ))}
          </div>
        )}

        <div className="section-footer">
          <a href="/popular-books" className="see-all-link">
            Voir tout
          </a>
        </div>
      </section>

      <section className="home__section">
        <h2>Listes Populaires</h2>
        <div className="books-grid">
          {popularLists.map((list) => (
            <ListCard key={list.id} {...list} />
          ))}
        </div>
        <div className="section-footer">
          <a
            onClick={() => navigate("/")}
            href="/popular-lists"
            className="see-all-link"
          >
            Voir tout
          </a>
        </div>
      </section>

      {/* Modal d'ajout à une liste */}
      <AddToListModal
        isOpen={isAddToListModalOpen}
        onClose={handleCloseModal}
        book={selectedBookForList}
      />
    </>
  );
}
