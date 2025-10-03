import './MesLivres.scss';
import { useMyBooksStore } from '@/store/addBook';
import NavBar from '@/components/common/NavBar/NavBar';
import BookCard, { type Book } from '@/components/ui/BookCard/BookCard';
import { useToastStore } from '@/store/toastStore';

export default function MesLivres() {
  const myBooks = useMyBooksStore((state) => state.myBooks);
  const removeBook = useMyBooksStore((state) => state.removeBook);
  const { success, error: showError } = useToastStore();

  // Adapter tes données au format BookCard si nécessaire
  const adaptBookFormat = (book: any): Book => {
    return {
      id_book: book.id || book.isbn || book.open_library_key,
      title: book.title,
      authors: book.authors,
      cover_url: book.cover_url,
      isbn: book.isbn,
      publication_year: book.publication_year,
      description: book.description,
      reading_status: book.reading_status || 'to_read', // Statut par défaut
      added_at: book.added_at || new Date().toISOString(),
      started_at: book.started_at,
      finished_at: book.finished_at,
    };
  };

  const handleRemoveBook = (bookId: number | string, bookTitle: string) => {
    // Trouver le livre à supprimer
    const bookToRemove = myBooks.find(
      (book) => (book.id || book.isbn || book.open_library_key) === bookId
    );

    if (bookToRemove && removeBook) {
      removeBook(bookToRemove);
      success(`"${bookTitle}" supprimé de votre bibliothèque`);
    } else {
      showError('Erreur lors de la suppression du livre');
    }
  };

  const handleStatusChange = (
    bookId: number | string,
    newStatus: Book['reading_status'],
    bookTitle: string
  ) => {
    // Cette fonction pourrait être implémentée si ton store addBook supporte les changements de statut
    // Pour l'instant, on peut juste afficher un message
    const statusMap: Record<Book['reading_status'], string> = {
      to_read: 'À lire',
      reading: 'En cours',
      read: 'Lu',
      abandoned: 'Abandonné',
    };

    const statusText = statusMap[newStatus];
    success(`"${bookTitle}" marqué comme ${statusText}`);
  };

  const handleBookClick = (book: Book) => {
    // Navigation vers une page de détail du livre si tu en as une
    // Par exemple: navigate(`/livre/${book.id_book}`)
    console.log('Clic sur livre:', book.title);
  };

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
                key={book.id || book.isbn || book.open_library_key}
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
