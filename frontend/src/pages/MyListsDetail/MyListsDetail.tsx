import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  IoArrowBack,
  IoTrashOutline,
  IoBookmark,
  IoBook,
  IoCheckmarkCircle,
} from 'react-icons/io5';
import { useListDetailStore } from '../../store/listDetailStore';
import { useToastStore } from '../../store/toastStore';
import DeleteBookModal from '../../components/ui/Modal/DeleteBookModal';
import './MyListsDetail.scss';

const ListDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const listId = parseInt(id || '0');

  const {
    currentList,
    isLoading,
    error,
    fetchListDetail,
    removeBookFromList,
    updateBookStatus,
    clearCurrentList,
  } = useListDetailStore();

  const { success, error: showError } = useToastStore();

  // États pour le modal de suppression
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [isDeletingBook, setIsDeletingBook] = useState(false);

  useEffect(() => {
    if (listId > 0) {
      fetchListDetail(listId);
    }

    return () => clearCurrentList();
  }, [listId, fetchListDetail, clearCurrentList]);

  // ➡️ Clic sur bouton supprimer
  const handleRemoveBookClick = (bookId: number, bookTitle: string) => {
    setBookToDelete({ id: bookId, title: bookTitle });
    setIsDeleteModalOpen(true);
  };

  // ➡️ Confirmer la suppression
  const confirmRemoveBook = async () => {
    if (!bookToDelete) return;

    setIsDeletingBook(true);

    const removed = await removeBookFromList(bookToDelete.id);

    if (removed) {
      success(`"${bookToDelete.title}" retiré de la liste`);
      setIsDeleteModalOpen(false);
      setBookToDelete(null);
    } else {
      showError('Erreur lors de la suppression');
    }

    setIsDeletingBook(false);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setBookToDelete(null);
  };

  const handleStatusChange = async (
    bookId: number,
    newStatus: string,
    bookTitle: string
  ) => {
    const updated = await updateBookStatus(bookId, newStatus as any);
    if (updated) {
      const statusText =
        {
          to_read: 'À lire',
          reading: 'En cours',
          read: 'Lu',
          abandoned: 'Abandonné',
        }[newStatus] || newStatus;

      success(`"${bookTitle}" marqué comme ${statusText}`);
    } else {
      showError('Erreur lors de la mise à jour');
    }
  };

  const getStatusIcon = (status: string) => {
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

  if (isLoading) {
    return (
      <div className="list-detail">
        <div className="list-detail__header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <IoArrowBack /> Retour
          </button>
        </div>
        <div className="loading-message">Chargement de la liste...</div>
      </div>
    );
  }

  if (error || !currentList) {
    return (
      <div className="list-detail">
        <div className="list-detail__header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <IoArrowBack /> Retour
          </button>
        </div>
        <div className="error-message">{error || 'Liste non trouvée'}</div>
      </div>
    );
  }

  return (
    <div className="list-detail">
      <div className="list-detail__header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <IoArrowBack /> Retour aux listes
        </button>

        <div className="list-info">
          <h1 className="list-title">{currentList.name}</h1>
          {currentList.description && (
            <p className="list-description">{currentList.description}</p>
          )}

          <div className="list-stats">
            <div className="stat">
              <span className="stat-number">{currentList.total_books}</span>
              <span className="stat-label">Livres total</span>
            </div>
            <div className="stat">
              <span className="stat-number">{currentList.books_read}</span>
              <span className="stat-label">Lus</span>
            </div>
            <div className="stat">
              <span className="stat-number">{currentList.books_reading}</span>
              <span className="stat-label">En cours</span>
            </div>
            <div className="stat">
              <span className="stat-number">{currentList.books_to_read}</span>
              <span className="stat-label">À lire</span>
            </div>
          </div>
        </div>
      </div>

      <div className="list-detail__content">
        {currentList.books.length === 0 ? (
          <div className="empty-list">
            <p>Cette liste ne contient aucun livre pour le moment.</p>
            <button className="add-books-btn">Ajouter des livres</button>
          </div>
        ) : (
          <div className="books-grid">
            {currentList.books.map((book) => (
              <div
                key={book.id_book}
                className={`book-card book-card--${book.reading_status}`}
              >
                <div className="book-cover">
                  <img
                    src={book.cover_url || '/placeholder-book.png'}
                    alt={book.title}
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-book.png';
                    }}
                  />
                  <div className="book-overlay">
                    <button
                      className="remove-btn"
                      onClick={() =>
                        handleRemoveBookClick(book.id_book, book.title)
                      }
                      title={`Retirer "${book.title}" de la liste`}
                    >
                      <IoTrashOutline />
                    </button>
                  </div>
                </div>

                <div className="book-info">
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-authors">{book.authors}</p>
                  {book.publication_year && (
                    <p className="book-year">({book.publication_year})</p>
                  )}

                  <div className="book-status">
                    {getStatusIcon(book.reading_status)}
                    <select
                      value={book.reading_status}
                      onChange={(e) =>
                        handleStatusChange(
                          book.id_book,
                          e.target.value,
                          book.title
                        )
                      }
                      className="status-select"
                    >
                      <option value="to_read">À lire</option>
                      <option value="reading">En cours</option>
                      <option value="read">Lu</option>
                      <option value="abandoned">Abandonné</option>
                    </select>
                  </div>

                  {book.description && (
                    <p className="book-description">{book.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ Modal de suppression de livre */}
      <DeleteBookModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={confirmRemoveBook}
        isDeleting={isDeletingBook}
        bookTitle={bookToDelete?.title || ''}
        listName={currentList.name}
      />
    </div>
  );
};

export default ListDetail;
