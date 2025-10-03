import axios from 'axios';
import './LivresPopulaires.scss';
import { useNavigate } from 'react-router-dom';
import type { Book } from '@/Types/Books'; // Adapte ce chemin selon ta structure
import { useAuthStore } from '../../store/authStore';
import { useMyBooksStore } from '../../store/addBook';
import { useState, useEffect } from 'react';
import { BiSolidBookAdd } from 'react-icons/bi';

const searchTerms = [
  'fiction',
  'mystery',
  'romance',
  'fantasy',
  'science',
  'history',
  'adventure',
  'classic',
  'novel',
  'literature',
];

export default function PopularBooks() {
  const navigate = useNavigate();
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const addBook = useMyBooksStore((state) => state.addBook);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchPopularBooks = async () => {
      setLoading(true);
      try {
        const randomTerm =
          searchTerms[Math.floor(Math.random() * searchTerms.length)];
        const response = await axios.get(
          `http://localhost:3000/api/openlibrary/search/books?query=${encodeURIComponent(
            randomTerm
          )}`
        );
        const allBooks: Book[] = response.data.data || [];
        const filteredBooks = allBooks.filter(
          (b) => b.title && b.title.length < 40
        );
        const shuffled = filteredBooks.sort(() => 0.5 - Math.random());
        const topBooks = shuffled.slice(0, 20);
        setPopularBooks(topBooks);
      } catch (error) {
        console.error('Erreur récupération livres populaires:', error);
        setPopularBooks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPopularBooks();
  }, []);

  const handleAddBook = (book: Book) => {
    if (!user) {
      navigate('/login');
      return;
    }
    addBook(book);
    navigate('/MesLivres');
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
            book.id?.toString() ||
            book.isbn ||
            book.open_library_key ||
            `book-${book.title}`
          }
          className="popular-books-grid__item"
          onClick={() => {
            if (book.isbn) {
              navigate(`/books/${book.isbn}`);
            } else {
              alert("Ce livre n'a pas d'ISBN.");
            }
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && book.isbn) {
              navigate(`/books/${book.isbn}`);
            }
          }}
          aria-label={`Voir les détails du livre ${book.title}`}
        >
          {book.cover_url ? (
            <img
              src={String(book.cover_url || '')}
              alt={book.title}
              onError={(e) => (e.currentTarget.src = '/placeholder-book.png')}
              className="popular-books-grid__cover"
            />
          ) : (
            <div className="popular-books-grid__no-cover">
              Pas de couverture
            </div>
          )}
          <div className="popular-books-grid__title">{book.title}</div>
          <div className="popular-books-grid__authors">
            {book.authors || 'Auteur inconnu'}
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
