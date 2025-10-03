import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { z } from 'zod';
import './CreateListModal.scss';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onCreateList: (name: string, description?: string) => Promise<boolean>;
}

// Validation Zod pour le nom de la liste
const listNameSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom de la liste est requis')
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .trim(),
  description: z
    .string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional(),
});

type ListFormData = z.infer<typeof listNameSchema>;

const CreateListModal: React.FC<CreateListModalProps> = ({
  isOpen,
  onClose,
  onCreateList,
}) => {
  const [formData, setFormData] = useState<ListFormData>({
    name: '',
    description: '',
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof ListFormData, string>>
  >({});
  const [isCreating, setIsCreating] = useState(false);

  // Fermer le modal en cliquant sur l'overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Fermer avec Escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Effacer l'erreur dès que l'utilisateur tape
    if (errors[name as keyof ListFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    try {
      listNameSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof ListFormData, string>> = {};
        error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            const fieldName = issue.path[0] as keyof ListFormData;
            newErrors[fieldName] = issue.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsCreating(true);

    try {
      const success = await onCreateList(
        formData.name,
        formData.description || undefined
      );

      if (success) {
        // Réinitialiser le formulaire et fermer le modal
        setFormData({ name: '', description: '' });
        setErrors({});
        onClose();
      }
    } catch (error) {
      console.error('Erreur lors de la création de la liste:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setFormData({ name: '', description: '' });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Créer une nouvelle liste</h2>
          <button
            className="modal-close-btn"
            onClick={handleClose}
            disabled={isCreating}
          >
            <IoClose />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Nom de la liste *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? 'error' : ''}
              placeholder="Ex: Mes favoris, À lire cet été..."
              disabled={isCreating}
              autoFocus
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (optionnel)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={errors.description ? 'error' : ''}
              placeholder="Décrivez votre liste..."
              disabled={isCreating}
              rows={3}
            />
            {errors.description && (
              <span className="error-message">{errors.description}</span>
            )}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleClose}
              disabled={isCreating}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-create"
              disabled={isCreating || !formData.name.trim()}
            >
              {isCreating ? 'Création...' : 'Créer la liste'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListModal;
