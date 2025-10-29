import "./MyBooks.scss";
import { useNavigate } from "react-router-dom";
import { IoTrashOutline } from "react-icons/io5"; // icône poubelle
import { GiWhiteBook } from "react-icons/gi"; // icône livre
import { useMyBooksStore } from "@/store/addBook";
import NavBar from "@/components/common/NavBar/NavBar";
import ToggleRead from "@/components/common/ToggleRead/ToggleRead";
import { useEffect } from "react";

interface MyBooksProps {
  max?: number;
}

export default function MyBooks({ max }: MyBooksProps) {
  const navigate = useNavigate();
  const myBooks = useMyBooksStore((state) => state.myBooks);
  const booksToShow = max ? myBooks.slice(0, max) : myBooks;

  // Charger les livres depuis l'API au montage du composant
  const loadBooksFromAPI = useMyBooksStore((state) => state.loadBooksFromAPI);

  useEffect(() => {
    console.log("🔄 Tentative de chargement des livres depuis l'API...");
    loadBooksFromAPI();
  }, [loadBooksFromAPI]);

  // Debug : afficher les livres et leurs covers
  console.log("📚 Livres dans MyBooks:", myBooks);
  console.log("📊 Nombre de livres:", myBooks.length);
  console.log("🎯 booksToShow:", booksToShow);

  const removeBook = useMyBooksStore((state) => state.removeBook);
  const toggleRead = useMyBooksStore((state) => state.toggleRead);

  return (
    <>
      <NavBar />
      <div className="mybooks-grid">
        <div className="mybooks-grid__item mybooks-grid__header">
          Mes Livres <GiWhiteBook />
        </div>
        {booksToShow.length === 0 ? (
          <div className="mybooks-grid__empty">
            Votre bibliothèque est vide.
          </div>
        ) : (
          booksToShow.map((book) => {
            console.log("🎨 Rendu du livre:", book.title, book);
            return (
              <div
                className="mybooks-grid__item"
                key={book.id || book.open_library_key}
                tabIndex={0}
                role="button"
                style={{
                  border: "2px solid red",
                  margin: "10px",
                  padding: "10px",
                  backgroundColor: "yellow",
                }}
                onClick={() =>
                  navigate(`/books/${book.isbn || book.open_library_key}`)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigate(`/books/${book.isbn || book.open_library_key}`);
                  }
                }}
              >
                <img
                  src={
                    book.cover_url && book.cover_url !== "N/A"
                      ? book.cover_url
                      : "/book-placeholder.svg"
                  }
                  alt={book.title}
                  className="book-cover"
                  onLoad={() => {
                    console.log(
                      `✅ Image chargée pour: ${book.title}, URL: ${book.cover_url}`
                    );
                  }}
                  onError={(e) => {
                    console.log(
                      `❌ Erreur de chargement pour: ${book.title}, URL: ${book.cover_url}`
                    );
                    // Éviter la boucle infinie : ne changer qu'une seule fois
                    const target = e.target as HTMLImageElement;
                    const placeholder = "/book-placeholder.svg";
                    if (target.src.indexOf(placeholder) === -1) {
                      target.src = placeholder;
                    }
                  }}
                />
                <div className="book-info">
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-author">
                    {book.authors || "Auteur inconnu"}
                  </p>
                </div>
                {removeBook && (
                  <button
                    className="delete-book-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        window.confirm(
                          `Retirer "${book.title}" de cette vue ?\n\n⚠️ Note: Le livre restera en base de données et reviendra au prochain chargement.`
                        )
                      ) {
                        removeBook(book);
                      }
                    }}
                    title="Retirer de la vue (temporaire)"
                    aria-label={`Retirer le livre ${book.title}`}
                  >
                    <IoTrashOutline />
                  </button>
                )}
                <div className="toggle-read">
                  <ToggleRead
                    read={Boolean(book.read)}
                    onToggle={(e) => {
                      e.stopPropagation(); // Arrête la propagation
                      toggleRead(book.id);
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
