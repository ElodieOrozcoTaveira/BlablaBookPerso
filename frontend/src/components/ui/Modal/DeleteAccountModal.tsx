import React, { useState } from 'react';
import Modal from './Modal';
import './DeleteAccountModal.scss';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  const [step, setStep] = useState(1);

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  const handleFirstConfirm = () => {
    setStep(2);
  };

  const handleFinalConfirm = () => {
    onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Supprimer le compte">
      <div className="delete-modal">
        {step === 1 && (
          <>
            <div className="delete-modal__warning">
              <div className="warning-icon">⚠️</div>
              <h3>Êtes-vous sûr de vouloir supprimer votre compte ?</h3>
            </div>

            <div className="delete-modal__content">
              <p>Cette action supprimera définitivement :</p>
              <ul>
                <li>Votre bibliothèque personnelle</li>
                <li>Vos listes de lecture</li>
                <li>Vos avis et notes</li>
                <li>Toutes vos données personnelles</li>
              </ul>

              <p className="warning-text">
                <strong>Cette action ne peut pas être annulée.</strong>
              </p>
            </div>

            <div className="delete-modal__buttons">
              <button className="btn btn--secondary" onClick={handleClose}>
                Annuler
              </button>
              <button className="btn btn--danger" onClick={handleFirstConfirm}>
                Oui, je veux supprimer
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="delete-modal__final">
              <div className="warning-icon">🚨</div>
              <h3>Confirmation finale</h3>
              <p>
                Vous allez définitivement supprimer votre compte.
                <br />
                <strong>Êtes-vous absolument certain ?</strong>
              </p>
            </div>

            <div className="delete-modal__buttons">
              <button
                className="btn btn--secondary"
                onClick={() => setStep(1)}
                disabled={isDeleting}
              >
                Non, retour
              </button>
              <button
                className="btn btn--danger"
                onClick={handleFinalConfirm}
                disabled={isDeleting}
              >
                {isDeleting
                  ? 'Suppression...'
                  : 'Oui, supprimer définitivement'}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default DeleteAccountModal;
