import './MyBooks.scss';
import { useNavigate } from 'react-router-dom';
import { IoTrashOutline } from 'react-icons/io5'; // icône poubelle
import { GiWhiteBook } from 'react-icons/gi'; // icône livre
import { useMyBooksStore } from '@/store/addBook';
import NavBar from '@/components/common/NavBar/NavBar';
import ToggleRead from '@/components/common/ToggleRead/ToggleRead';

interface MyBooksProps {
  max?: number;
}

export default function MyBooks({ max }: MyBooksProps) {
  const navigate = useNavigate();
  const myBooks = useMyBooksStore((state) => state.myBooks);
  const booksToShow = max ? myBooks.slice(0, max) : myBooks;

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
          <div className="mybooks-grid__empty">Votre bibliothèque est vide.</div>
        ) : (
          booksToShow.map((book) => (
            <div
              className="mybooks-grid__item"
              key={book.id || book.open_library_key}
              tabIndex={0}
              role="button"
              onClick={() =>
                navigate(`/books/${book.isbn || book.open_library_key}`)
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  navigate(`/books/${book.isbn || book.open_library_key}`);
                }
              }}
            >
              <img
                src={String(book.cover_url || '/placeholder-book.png')}
                alt={book.title}
                className="book-cover"
              />
              <div className="book-info">
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">{book.authors || 'Auteur inconnu'}</p>
              </div>
              {removeBook && (
                <button
                  className="delete-book-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeBook(book);
                  }}
                  title="Supprimer"
                  aria-label={`Supprimer le livre ${book.title}`}
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
          ))
        )}
      </div>
    </>
  );
}