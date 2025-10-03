import React from 'react';
import Modal from '../../ui/Modal/Modal'; // Ajuste le chemin selon ta structure
import './DeleteBookModal.scss';

interface DeleteBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  bookTitle: string;
  listName: string;
}

const DeleteBookModal: React.FC<DeleteBookModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  bookTitle,
  listName,
}) => {
  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Retirer le livre">
      <div className="delete-book-modal">
        <div className="delete-book-modal__warning">
          <div className="warning-icon">📖</div>
          <h3>Retirer "{bookTitle}" ?</h3>
        </div>

        <div className="delete-book-modal__content">
          <p>Cette action retirera le livre :</p>
          <ul>
            <li>
              <strong>"{bookTitle}"</strong>
            </li>
            <li>De la liste "{listName}"</li>
          </ul>
          <p className="info-text">
            Le livre ne sera pas supprimé de votre collection générale,
            seulement de cette liste.
          </p>
        </div>

        <div className="delete-book-modal__buttons">
          <button
            className="btn btn--secondary"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Annuler
          </button>
          <button
            className="btn btn--danger"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Suppression...' : 'Oui, retirer'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteBookModal;
