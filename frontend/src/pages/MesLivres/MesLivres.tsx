import "./MesLivres.scss";
import NavBar from "@/components/common/NavBar/NavBar";
import BookCard, { type Book } from "@/components/ui/BookCard/BookCard";
import { useToastStore } from "@/store/toastStore";
import { booksApi, type OpenLibraryBook } from "../../api/booksApi";
import { useState, useEffect } from "react";
import axios from "../../api/axiosConfig";

export default function MesLivres() {
  const [myBooks, setMyBooks] = useState<OpenLibraryBook[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error: showError } = useToastStore();

  // Charger les livres depuis l'API
  useEffect(() => {
    const fetchUserLibrary = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/books/library");
        setMyBooks(response.data.data || []);
      } catch (error) {
        console.error("Erreur chargement bibliothèque:", error);
        showError("Erreur lors du chargement de votre bibliothèque");
        setMyBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserLibrary();
  }, [showError]);

  // Adapter les données OpenLibrary au format BookCard
  const adaptBookFormat = (book: OpenLibraryBook): Book => {
    return {
      id_book: parseInt(book.openLibraryId.replace(/\D/g, "")) || Date.now(), // Convertir en number
      title: book.title,
      authors: booksApi.utils.formatAuthors(book.authors),
      cover_url: book.coverUrl || "",
      isbn: book.isbn13 || book.isbn10 || "",
      publication_year: book.publishYear || 0,
      description: book.description || "",
      reading_status: "to_read", // Statut par défaut, sera récupéré de l'API plus tard
      added_at: new Date().toISOString(),
      started_at: undefined,
      finished_at: undefined,
    };
  };

  const handleRemoveBook = async (
    bookId: number | string,
    bookTitle: string
  ) => {
    try {
      // TODO: Implémenter la suppression côté API
      // await axios.delete(`/api/books/library/${bookId}`);

      // Pour l'instant, on supprime juste du state local
      setMyBooks((prev) =>
        prev.filter((book) => book.openLibraryId !== bookId)
      );
      success(`"${bookTitle}" supprimé de votre bibliothèque`);
    } catch (error) {
      console.error("Erreur suppression livre:", error);
      showError("Erreur lors de la suppression du livre");
    }
  };

  const handleStatusChange = async (
    bookId: number | string,
    newStatus: Book["reading_status"],
    bookTitle: string
  ) => {
    try {
      // Appel API pour mettre à jour le statut
      await axios.put(`/api/books/library/${bookId}/status`, {
        status: newStatus,
      });

      const statusMap: Record<Book["reading_status"], string> = {
        to_read: "À lire",
        reading: "En cours",
        read: "Lu",
        abandoned: "Abandonné",
      };

      const statusText = statusMap[newStatus];
      success(`"${bookTitle}" marqué comme ${statusText}`);
    } catch (error) {
      console.error("Erreur mise à jour statut:", error);
      showError("Erreur lors de la mise à jour du statut");
    }
  };

  const handleBookClick = (book: Book) => {
    // Navigation vers une page de détail du livre
    const isbn = book.isbn;
    if (isbn) {
      window.location.href = `/books/${isbn}`;
    }
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="mesLivres-grid">
          <h2 className="mesLivres-h2">Mes Livres</h2>
          <div className="loading">Chargement de votre bibliothèque...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="mesLivres-grid">
        <h2 className="mesLivres-h2">Mes Livres</h2>

        {myBooks.length === 0 ? (
          <div className="empty-library">
            <h3>Votre Bibliothèque est vide</h3>
            <p>Commencez par rechercher et ajouter des livres !</p>
          </div>
        ) : (
          <div className="mesLivres-container">
            {myBooks.map((book) => (
              <BookCard
                key={
                  book.openLibraryId || book.isbn13 || book.isbn10 || book.title
                }
                book={adaptBookFormat(book)}
                onRemove={handleRemoveBook}
                onStatusChange={handleStatusChange}
                onClick={handleBookClick}
                showRemoveButton={true}
                showStatusSelector={true}
                showDescription={true}
                isClickable={true}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
