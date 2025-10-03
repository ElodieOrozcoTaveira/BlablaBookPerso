import './MonProfil.scss';
import z from 'zod';

// Création du schéma de Validation Zod (règle de validation pour chaque champ du profil)
const profilSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis').min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(1,'Le prénom est requis').min(2, 'Le prénom doit contenir au minimum 2 caractères'),
  pseudo: z.string().min(1, 'Le pseudo est requis').min(4, 'Le pseudo doit contenir au minimum 4 caractères'),
  email: z.string().min(1,"L'email est requis").email("L'email n'est pas valide"),
  motDePasse: z.string().min(1, 'Le mot de passe est requis').min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  image: z.string().url("L'image doit être une URL valide"),
});
//création du type basé sur le schéma pour bénéficier de l'autocomplétion et vérification de type
type ProfilFormData = z.infer<typeof profilSchema>; //z.infer génère automatiquement un type à partir du schema

interface UserProfile {
  nom: string;
  prenom: string;
  pseudo: string;
  email: string;
  motDePasse: string;
  image: string;
}

type MonProfilProps = {
  user?: UserProfile;
};

const compteFake: UserProfile = {
  nom: "Wayne",
  prenom: "Bruce",
  pseudo: "JeSuisBatman",
  email: "batman@gothamcity.com",
  motDePasse: "********",
  image: "https://picsum.photos/200/200", // URL valide pour la validation
};

export default function MonProfil({ user = compteFake }: MonProfilProps) {
  // Validation Zod
  const result = profilSchema.safeParse(user);

  return (
    <>
      <h1 className="MonProfil">Mon Profil</h1>
      {!result.success && ( //vérifie si la validation a échoué. Si oui elle affiche la div avec comme titre 'Erreur de validation'
        <div className="profil-error">
          <h2>Erreur de validation du profil :</h2>
          <ul>
            {Object.values(result.error.format()).map((err, idx) =>//parcourt toutes les erreurs retournées par zod. Si il y a une erreur cela affiche dans la page pour informer l'utilisateur.
              err && typeof err === 'object' && 'message' in err ? (
                <li key={idx}>{err.message}</li>
              ) : null
            )}{/*Ce bloc de code sert à afficher dynamiquement les messages d'erreur de validation du profil pour que l'utilisateur sache l'erreur*/}
          </ul>
        </div>
      )}
      <img src={user.image} alt="imagedeprofil" className="image_profile" />
      <section className="container-informations">
        <div className="informations_profil">
          <label htmlFor="Nom du profil">Nom du profil</label>
          <input type="text" value={user.nom} readOnly />
        </div>
        <div className="informations_profil">
          <label htmlFor="Prénom du profil">Prénom</label>
          <input type="text" value={user.prenom} readOnly />
        </div>
        <div className="informations_profil">
          <label htmlFor="Pseudo">Pseudo</label>
          <input type="text" value={user.pseudo} readOnly />
        </div>
        <div className="informations_profil">
          <label htmlFor="email">Email</label>
          <input type="email" value={user.email} readOnly />
        </div>
        <div className="informations_profil">
          <label htmlFor="mot de passe">Mot de Passe</label>
          <input type="text" value={user.motDePasse} readOnly />
        </div>
        <div className="btn">
          <button className="btn__retour">Retour</button>
          <button className="btn__confirmer">Confirmer</button>
        </div>
      </section>
    </>
  );
}