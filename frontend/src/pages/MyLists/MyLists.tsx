import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import './MyLists.scss';
import { IoTrashOutline, IoAddCircleOutline } from 'react-icons/io5';
import { CiViewList } from 'react-icons/ci';
import { useMyListsStore } from '../../store/myListsStore'; 
import { useToastStore } from '../../store/toastStore';
import CreateListModal from '../../components/ui/Modal/CreateListModal';
import DeleteListModal from '../../components/ui/Modal/DeleteListModal';
import NavBar from '@/components/common/NavBar/NavBar';




export default function MyLists() {
  const navigate = useNavigate();

  // Zustand store pour les listes
  const { lists, isLoading, error, fetchMyLists, deleteList, createList } = useMyListsStore();

  // Toast pour notifications
  const { success, error: showError } = useToastStore();

  // États pour modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<{ id: number; name: string } | null>(null);
  const [isDeletingList, setIsDeletingList] = useState(false);

  useEffect(() => {
    fetchMyLists();
  }, [fetchMyLists]);

  const handleCreateList = async (name: string, description?: string): Promise<boolean> => {
    const created = await createList(name, description);
    if (created) {
      success(`Liste "${name}" créée avec succès`);
      return true;
    } else {
      showError('Erreur lors de la création de la liste');
      return false;
    }
  };

  const handleDeleteList = (e: React.MouseEvent, listId: number, listName: string) => {
    e.stopPropagation();
    setListToDelete({ id: listId, name: listName });
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteList = async () => {
    if (!listToDelete) return;
    setIsDeletingList(true);
    const deleted = await deleteList(listToDelete.id);
    if (deleted) {
      success(`Liste "${listToDelete.name}" supprimée avec succès`);
      setIsDeleteModalOpen(false);
      setListToDelete(null);
    } else {
      showError('Erreur lors de la suppression de la liste');
    }
    setIsDeletingList(false);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setListToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="my-lists-grid">
        <div className="my-lists-grid__header">
          Mes Listes <CiViewList />
        </div>
        <div className="loading-message">Chargement de vos listes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-lists-grid">
        <div className="my-lists-grid__header">
          Mes Listes <CiViewList />
        </div>
        <div className="error-message">
          Erreur : {error}
          <button onClick={() => fetchMyLists()}>Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <>
    <NavBar/>
      <div className="my-lists-grid">
        <div className="my-lists-grid__header">
          Mes Listes <CiViewList />
        </div>

        {lists.length === 0 ? (
          <div className="my-lists-grid__empty-state">
            <p>Vous n'avez pas encore créé de listes.</p>
            <button
              className="my-lists-grid__create-btn"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <IoAddCircleOutline /> Créer ma première liste
            </button>
          </div>
        ) : (
          <>
            <div
              className="my-lists-grid__item my-lists-grid__create-new-list"
              onClick={() => setIsCreateModalOpen(true)}
              tabIndex={0}
              role="button"
            >
              <IoAddCircleOutline size={48} />
              <h2 className="my-lists-grid__item-name">Créer une liste</h2>
              <span className="my-lists-grid__item-description">
                Ajoutez une nouvelle liste de lecture
              </span>
            </div>

            {lists.map((list) => (
              <div
                className="my-lists-grid__item"
                key={list.id_library}
                onClick={() => navigate(`/liste/${list.id_library}`)}
                tabIndex={0}
                role="button"
              >
                <img
                  className="my-lists-grid__item-cover"
                  src={`https://picsum.photos/200/300?random=${list.id_library}`}
                  alt={list.name}
                />

                <h2 className="my-lists-grid__item-name">{list.name}</h2>

                {list.description && (
                  <p className="my-lists-grid__item-description">{list.description}</p>
                )}

                <span className="my-lists-grid__item-visibility">
                  {list.is_public ? 'Publique' : 'Privée'}
                </span>

                <button
                  className="my-lists-grid__item-delete"
                  onClick={(e) => handleDeleteList(e, list.id_library, list.name)}
                  title={`Supprimer la liste "${list.name}"`}
                >
                  <IoTrashOutline />
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      <CreateListModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateList={handleCreateList}
      />

      <DeleteListModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={confirmDeleteList}
        isDeleting={isDeletingList}
        listName={listToDelete?.name || ''}
      />
    </>
  );
}
