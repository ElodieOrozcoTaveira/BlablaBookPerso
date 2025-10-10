import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./DetailsLivre.scss";
import { booksApi, type OpenLibraryBook } from "../../api/booksApi";

export default function DetailsLivre() {
  const { isbn } = useParams<{ isbn: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [book, setBook] = useState<OpenLibraryBook | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Fonction utilitaire pour construire l'URL de la cover
  const getCoverUrl = (bookData: OpenLibraryBook) => {
    if (bookData.coverUrl) {
      return bookData.coverUrl;
    }
    if (bookData.isbn13) {
      return `https://covers.openlibrary.org/b/isbn/${bookData.isbn13}-L.jpg`;
    }
    if (bookData.isbn10) {
      return `https://covers.openlibrary.org/b/isbn/${bookData.isbn10}-L.jpg`;
    }
    return "/placeholder-book.png";
  };

  useEffect(() => {
    console.log("ISBN reçu:", isbn);
    console.log("URL actuelle:", location.pathname);

    const fetchBook = async () => {
      if (
        !isbn ||
        isbn.trim() === "" ||
        isbn === "undefined" ||
        isbn === ":isbn"
      ) {
        console.error("ISBN invalide ou manquant:", isbn);
        setError(`ISBN invalide: "${isbn}". Vérifiez l'URL.`);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        console.log("Tentative de récupération du livre avec ISBN:", isbn);
        const response = await booksApi.searchByISBN(isbn);
        console.log("Réponse reçue:", response.data);
        setBook(response.data);
      } catch (error: any) {
        console.error("Erreur lors de la récupération du livre:", error);
        setError(
          error.response?.data?.message ||
            `Erreur lors du chargement du livre (ISBN: ${isbn})`
        );
        setBook(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [isbn, location.pathname]);

  if (error) {
    return (
      <div className="details-livre error">
        <h1>Erreur de chargement</h1>
        <p>{error}</p>
        <div className="error-actions">
          <button onClick={() => navigate("/")}>Retour à l'accueil</button>
          <button onClick={() => window.location.reload()}>Réessayer</button>
        </div>
        <div
          className="debug-info"
          style={{
            marginTop: "20px",
            padding: "10px",
            background: "#f0f0f0",
            fontSize: "12px",
            fontFamily: "monospace",
          }}
        >
          <strong>Informations de debug :</strong>
          <br />
          URL: {location.pathname}
          <br />
          ISBN reçu: "{isbn}"
          <br />
          Pattern attendu: /books/:isbn
          <br />
          Exemple valide: /books/9780451524935
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="details-livre loading">
        <p>Chargement du livre...</p>
        <p>ISBN: {isbn}</p>
        <div
          className="debug-info"
          style={{
            marginTop: "20px",
            padding: "10px",
            background: "#f0f0f0",
            fontSize: "12px",
            fontFamily: "monospace",
          }}
        >
          <strong>Debug:</strong> Chargement en cours pour ISBN "{isbn}"
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="details-livre not-found">
        <h1>Livre non trouvé</h1>
        <p>Aucun livre trouvé pour l'ISBN: {isbn}</p>
        <button onClick={() => navigate("/")}>Retour à l'accueil</button>
      </div>
    );
  }

  const coverUrl = getCoverUrl(book);

  return (
    <div className="details-livre">
      <h1>{book.title}</h1>
      <p>
        <strong>Auteur(s):</strong> {booksApi.utils.formatAuthors(book.authors)}
      </p>
      {book.publishYear && (
        <p>
          <strong>Année de publication:</strong> {book.publishYear}
        </p>
      )}
      {book.pageCount && (
        <p>
          <strong>Nombre de pages:</strong> {book.pageCount}
        </p>
      )}
      {book.subjects && book.subjects.length > 0 && (
        <p>
          <strong>Sujets:</strong>{" "}
          {booksApi.utils.formatSubjects(book.subjects)}
        </p>
      )}

      <img
        className="cover-image"
        src={coverUrl}
        alt={`Couverture de ${book.title}`}
      />

      {book.description && (
        <>
          <h2>Description</h2>
          <p>{book.description}</p>
        </>
      )}

      <h2>Ajouter à ma bibliothèque</h2>
      <div>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => setRating(star)}
            style={{
              cursor: "pointer",
              fontSize: "2rem",
              color: star <= rating ? "#FFD700" : "#ccc",
            }}
            role="button"
            aria-label={`Note ${star} étoile${star > 1 ? "s" : ""}`}
            tabIndex={0}
          >
            ★
          </span>
        ))}
      </div>

      <h2>Commentez le livre</h2>
      <textarea placeholder="Votre commentaire..." rows={4}></textarea>
      <button>Envoyer</button>
    </div>
  );
}
