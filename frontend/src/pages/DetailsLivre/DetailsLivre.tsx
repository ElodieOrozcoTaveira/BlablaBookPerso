import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './DetailsLivre.scss';

export default function DetailsLivre() {
  const { isbn } = useParams();
  const [book, setBook] = useState<any>(null);
  const [rating, setRating] = useState<number>(0);

  useEffect(() => {
    const fetchBook = async () => {
      if (!isbn) return;

      try {
        const response = await axios.get(
          `http://localhost:3000/api/books/isbn/${isbn}/excerpts`
        );
        setBook(response.data.data);
      } catch (error) {
        console.error('Erreur lors de la récupération du livre :', error);
        setBook(null);
      }
    };

    fetchBook();
  }, [isbn]);

  if (!book) {
    return <p>Aucun livre trouvé.</p>;
  }

  return (
    <div className="details-livre">
      <h1>{book.title}</h1>
      <p><strong>Auteur(s):</strong> {book.authors}</p>

      {book.cover_url && (
        <img src={book.cover_url} alt={`Couverture de ${book.title}`} />
      )}

      <h2>Extraits</h2>
      {Array.isArray(book.excerpts) && book.excerpts.length > 0 ? (
        <ul>
          {book.excerpts.map((ex: any, idx: number) => (
            <li key={idx}>{ex.name}</li>
          ))}
        </ul>
      ) : (
        <p>Aucun extrait disponible.</p>
      )}

      <h2>Ajouter à ma bibliothèque</h2>
      <div>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => setRating(star)}
            style={{
              cursor: 'pointer',
              fontSize: '2rem',
              color: star <= rating ? '#FFD700' : '#ccc',
            }}
            role="button"
            aria-label={`Note ${star} étoile${star > 1 ? 's' : ''}`}
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
