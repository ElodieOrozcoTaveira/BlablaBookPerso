import React from 'react';
import Modal from './Modal';
import './DeleteListModal.scss';

interface DeleteListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  listName: string;
}

const DeleteListModal: React.FC<DeleteListModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Supprimer la liste">
      <div className="delete-list-modal">
        <div className="delete-list-modal__warning">
          <div className="warning-icon">⚠️</div>
          <h3>Supprimer "{listName}" ?</h3>
        </div>

        <div className="delete-list-modal__content">
          <p>Cette action supprimera définitivement :</p>
          <ul>
            <li>La liste "{listName}"</li>
            <li>Tous les livres qu'elle contient</li>
            <li>Ses paramètres et sa description</li>
          </ul>
          <p className="warning-text">
            <strong>Cette action ne peut pas être annulée.</strong>
          </p>
        </div>

        <div className="delete-list-modal__buttons">
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
            {isDeleting ? 'Suppression...' : 'Oui, supprimer'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteListModal;
