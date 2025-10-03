import React from 'react';
import {
  IoTrashOutline,
  IoBookmark,
  IoBook,
  IoCheckmarkCircle,
} from 'react-icons/io5';
import './BookCard.scss';

export interface Book {
  id_book: number;
  title: string;
  authors: string;
  cover_url?: string;
  isbn?: string;
  publication_year?: number;
  description?: string;
  reading_status: 'to_read' | 'reading' | 'read' | 'abandoned';
  added_at: string;
  started_at?: string;
  finished_at?: string;
}

interface BookCardProps {
  book: Book;
  // Actions optionnelles
  // eslint-disable-next-line no-unused-vars
  onRemove?: (bookId: number, bookTitle: string) => void;
  onStatusChange?: (
    // eslint-disable-next-line no-unused-vars
    bookId: number,
    // eslint-disable-next-line no-unused-vars
    newStatus: Book['reading_status'],
    // eslint-disable-next-line no-unused-vars
    bookTitle: string
  ) => void;
  // eslint-disable-next-line no-unused-vars
  onClick?: (book: Book) => void;
  // Options d'affichage
  showRemoveButton?: boolean;
  showStatusSelector?: boolean;
  showDescription?: boolean;
  isClickable?: boolean;
  // Props pour la suppression
  isRemoving?: boolean;
}

const BookCard: React.FC<BookCardProps> = ({
  book,
  onRemove,
  onStatusChange,
  onClick,
  showRemoveButton = true,
  showStatusSelector = true,
  showDescription = true,
  isClickable = false,
  isRemoving = false,
}) => {
  const getStatusIcon = (status: Book['reading_status']) => {
    switch (status) {
      case 'read':
        return <IoCheckmarkCircle className="status-icon status-icon--read" />;
      case 'reading':
        return <IoBook className="status-icon status-icon--reading" />;
      case 'to_read':
        return <IoBookmark className="status-icon status-icon--to-read" />;
      case 'abandoned':
        return (
          <IoTrashOutline className="status-icon status-icon--abandoned" />
        );
      default:
        return null;
    }
  };

  const handleCardClick = () => {
    if (isClickable && onClick) {
      onClick(book);
    }
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(book.id_book, book.title);
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    if (onStatusChange) {
      onStatusChange(
        book.id_book,
        e.target.value as Book['reading_status'],
        book.title
      );
    }
  };

  return (
    <div
      className={`book-card book-card--${book.reading_status} ${
        isClickable ? 'book-card--clickable' : ''
      }`}
      onClick={handleCardClick}
    >
      <div className="book-cover">
        <img
          src={book.cover_url || '/placeholder-book.png'}
          alt={book.title}
          onError={(e) => {
            e.currentTarget.src = '/placeholder-book.png';
          }}
        />
        {showRemoveButton && onRemove && (
          <div className="book-overlay">
            <button
              className="remove-btn"
              onClick={handleRemoveClick}
              disabled={isRemoving}
              title={`Retirer "${book.title}"`}
            >
              <IoTrashOutline />
            </button>
          </div>
        )}
      </div>

      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-authors">{book.authors}</p>
        {book.publication_year && (
          <p className="book-year">({book.publication_year})</p>
        )}

        {showStatusSelector && onStatusChange && (
          <div className="book-status">
            {getStatusIcon(book.reading_status)}
            <select
              value={book.reading_status}
              onChange={handleStatusChange}
              className="status-select"
              onClick={(e) => e.stopPropagation()}
            >
              <option value="to_read">À lire</option>
              <option value="reading">En cours</option>
              <option value="read">Lu</option>
              <option value="abandoned">Abandonné</option>
            </select>
          </div>
        )}

        {showDescription && book.description && (
          <p className="book-description">{book.description}</p>
        )}
      </div>
    </div>
  );
};

export default BookCard;
