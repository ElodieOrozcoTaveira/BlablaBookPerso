import React from "react";
import "./MonProfil.scss";
import { z } from "zod";
import { useAuthStore } from "../../store/authStore.ts";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToastStore } from "../../store/toastStore";
import DeleteAccountModal from "../../components/ui/Modal/DeleteAccountModal";
import axios from "axios";

// Schéma Zod aligné sur ton backend
const profilSchema = z.object({
  firstname: z
    .string()
    .min(1, "Le prénom est requis")
    .min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastname: z
    .string()
    .min(1, "Le nom est requis")
    .min(2, "Le nom doit contenir au minimum 2 caractères"),
  username: z
    .string()
    .min(1, "Le pseudo est requis")
    .min(4, "Le pseudo doit contenir au minimum 4 caractères"),
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("L'email n'est pas valide"),
  avatar_url: z
    .string()
    .url("L'image doit être une URL valide")
    .optional()
    .or(z.literal("")),
});

interface UserProfile {
  id_user: number;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  avatar_url?: string;
  created_at: string;
}

interface EditForm {
  firstname: string;
  lastname: string;
  username: string;
}

export default function MonProfil() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // États pour l'édition
  const [editForm, setEditForm] = useState<EditForm>({
    firstname: "",
    lastname: "",
    username: "",
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { success, error } = useToastStore();

  const fetchProfile = async () => {
    try {
      setIsLoading(true);

      const response = await axios.get("/api/users/profile", {
        withCredentials: true,
      });

      if (response.data.success) {
        const profileData = response.data.data;
        setUserProfile(profileData);
        setEditForm({
          firstname: profileData.firstname,
          lastname: profileData.lastname,
          username: profileData.username,
        });
      } else {
        setErrorMsg("Impossible de charger le profil");
      }
    } catch (err) {
      console.error("Erreur lors du chargement du profil:", err);
      setErrorMsg("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newForm = {
      ...editForm,
      [name]: value,
    };
    setEditForm(newForm);

    // Vérifier s'il y a des changements
    if (userProfile) {
      const hasChanged =
        newForm.firstname !== userProfile.firstname ||
        newForm.lastname !== userProfile.lastname ||
        newForm.username !== userProfile.username;
      setHasChanges(hasChanged);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && hasChanges && !isSaving) {
      handleSave();
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const response = await axios.put("/api/users/profile", editForm, {
        withCredentials: true,
      });

      if (response.data.success) {
        setUserProfile(response.data.data);
        setHasChanges(false);
        success("Profil mis à jour avec succès !");
      } else {
        error("Erreur lors de la mise à jour");
      }
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
      error("Erreur de connexion");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);

      const response = await axios.delete("/api/users/profile", {
        withCredentials: true,
      });

      if (response.data.success) {
        success("Compte supprimé avec succès");
        await logout();
        navigate("/");
      } else {
        error("Erreur lors de la suppression du compte");
      }
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      error("Erreur de connexion");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setIsLoading(false);
      navigate("/");
    }
  }, [user, navigate]);

  if (isLoading) {
    return <div>Chargement du profil...</div>;
  }

  if (errorMsg) {
    return <div>Erreur : {errorMsg}</div>;
  }

  if (!userProfile) {
    return <div>Aucun profil trouvé</div>;
  }

  const result = profilSchema.safeParse(userProfile);

  return (
    <>
      <h1 className="MonProfil">Mon Profil</h1>

      {!result.success && (
        <div className="profil-error">
          <h2>Erreur de validation du profil :</h2>
          <ul>
            {result.error.issues.map((issue, idx) => (
              <li key={idx}>{issue.message}</li>
            ))}
          </ul>
        </div>
      )}

      <img
        src={userProfile.avatar_url || "https://picsum.photos/200/200"}
        alt="Image de profil"
        className="image_profile"
      />

      <section className="container-informations">
        <div className="informations_profil">
          <label htmlFor="lastname">Nom</label>
          <input
            type="text"
            name="lastname"
            value={editForm.lastname}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="editable-field"
            placeholder="Cliquez pour modifier"
          />
        </div>

        <div className="informations_profil">
          <label htmlFor="firstname">Prénom</label>
          <input
            type="text"
            name="firstname"
            value={editForm.firstname}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="editable-field"
            placeholder="Cliquez pour modifier"
          />
        </div>

        <div className="informations_profil">
          <label htmlFor="username">Pseudo</label>
          <input
            type="text"
            name="username"
            value={editForm.username}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="editable-field"
            placeholder="Cliquez pour modifier"
          />
        </div>

        <div className="informations_profil">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            value={userProfile.email}
            readOnly={true}
            className="readonly-field"
            title="L'email ne peut pas être modifié pour des raisons de sécurité"
          />
        </div>

        <div className="btn-container">
          {hasChanges && (
            <div className="btn-save-container">
              <button
                className="btn__save"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Sauvegarde..." : "Enregistrer les modifications"}
              </button>
            </div>
          )}

          <button
            className="btn__delete"
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting}
          >
            Supprimer mon compte
          </button>
        </div>
      </section>
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        isDeleting={isDeleting}
      />
    </>
  );
}
