import React, { useEffect, useState } from 'react';
import Modal from '../../ui/Modal/Modal';
import { useMyListsStore } from '../../../store/myListsStore';
import { useToastStore } from '../../../store/toastStore';
import { useListDetailStore } from '../../../store/listDetailStore';
import type { Book } from '../../../Types/Books';
import './AddToListModal.scss';

interface AddToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
}

const AddToListModal: React.FC<AddToListModalProps> = ({
  isOpen,
  onClose,
  book,
}) => {
  const { lists, fetchMyLists, addBookToList } = useMyListsStore();
  const { currentList, addBookToExistingList } = useListDetailStore();
  const { success, error: showError } = useToastStore();

  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Charger les listes si modal ouvert et vide
  useEffect(() => {
    if (isOpen && lists.length === 0) {
      fetchMyLists();
    }
  }, [isOpen, lists.length, fetchMyLists]);

  const handleAddToList = async () => {
    if (!selectedListId || !book) return;

    setIsAdding(true);

    try {
      // 1️⃣ Ajouter dans le store global des listes
      addBookToList(selectedListId, {
        id: Number(book.id) || Date.now(),
        title: book.title,
        author: book.authors || '',
      });

      // 2️⃣ Ajouter dans le store des détails si on est sur la bonne liste
      if (currentList && currentList.id_library === selectedListId) {
        const successAdd = await addBookToExistingList(selectedListId, {
          id_book: book.id || Date.now(),
          title: book.title,
          authors: book.authors || '',
          cover_url: book.cover_url,
          isbn: book.isbn,
          publication_year: book.publication_year,
          description: book.description,
          reading_status: 'to_read',
          added_at: new Date().toISOString(),
        });

        if (!successAdd) {
          showError('Ce livre est déjà dans la liste.');
          return;
        }
      }

      const selectedList = lists.find(
        (list) => list.id_library === selectedListId
      );

      success(`"${book.title}" ajouté à la liste "${selectedList?.name}"`);
      onClose();
      setSelectedListId(null);
    } catch {
      showError("Erreur lors de l'ajout à la liste");
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    if (!isAdding) {
      onClose();
      setSelectedListId(null);
    }
  };

  if (!book) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Ajouter à une liste">
      <div className="add-to-list-modal">
        {/* Aperçu du livre */}
        <div className="book-preview">
          <img
            src={book.cover_url || '/placeholder-book.png'}
            alt={book.title}
            className="book-preview__cover"
          />
          <div className="book-preview__info">
            <h3 className="book-title">{book.title}</h3>
            <p className="book-authors">{book.authors}</p>
            {book.publication_year && (
              <p className="book-year">({book.publication_year})</p>
            )}
          </div>
        </div>

        {/* Sélection de liste */}
        <div className="list-selection">
          <h4>Choisir une liste :</h4>

          {lists.length === 0 ? (
            <div className="no-lists">
              <p>Vous n'avez pas encore créé de listes.</p>
              <button
                className="create-list-btn"
                onClick={() => {
                  onClose();
                  // TODO : navigation vers création de liste
                }}
              >
                Créer ma première liste
              </button>
            </div>
          ) : (
            <div className="lists-grid">
              {lists.map((list) => (
                <div
                  key={list.id_library}
                  className={`list-option ${
                    selectedListId === list.id_library ? 'selected' : ''
                  }`}
                  onClick={() => setSelectedListId(list.id_library)}
                >
                  <div className="list-option__info">
                    <h5 className="list-name">{list.name}</h5>
                    {list.description && (
                      <p className="list-description">{list.description}</p>
                    )}
                    <span className="list-status">
                      {list.is_public ? 'Publique' : 'Privée'}
                    </span>
                  </div>
                  <div className="list-option__radio">
                    <input
                      type="radio"
                      name="selectedList"
                      value={list.id_library}
                      checked={selectedListId === list.id_library}
                      onChange={() => setSelectedListId(list.id_library)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="modal-actions">
          <button
            className="btn btn--secondary"
            onClick={handleClose}
            disabled={isAdding}
          >
            Annuler
          </button>

          {lists.length > 0 && (
            <button
              className="btn btn--primary"
              onClick={handleAddToList}
              disabled={!selectedListId || isAdding}
            >
              {isAdding ? 'Ajout...' : 'Ajouter à la liste'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AddToListModal;
