import { useState } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import './Login.scss';

// ═══════════════════════════════════════════════════════════════════════════════
// 1. VALIDATION AVEC ZOD
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Schéma de validation pour le formulaire de connexion
 * Zod v4 - Nouvelle syntaxe simplifiée
 */
const loginSchema = z.object({
  email: z
    .email("Format d'email invalide") // Zod v4: z.email() directement
    .min(1, "L'email est requis"), // Vérifie que le champ n'est pas vide

  password: z
    .string()
    .min(1, 'Le mot de passe est requis') // Vérifie que le champ n'est pas vide
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères'), // Minimum 8 caractères
});

/**
 * Type TypeScript généré automatiquement depuis le schéma Zod
 * Équivaut à: { email: string; password: string; }
 */
type LoginFormData = z.infer<typeof loginSchema>;

// ═══════════════════════════════════════════════════════════════════════════════
// 2. COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

const Login: React.FC = () => {
  // ─────────────────────────────────────────────────────────────────────────────
  // 2.1 ÉTATS DU COMPOSANT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * État des données du formulaire
   * Stocke les valeurs saisies par l'utilisateur
   */
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  /**
   * État des erreurs de validation
   * Stocke les messages d'erreur pour chaque champ
   * Partial<> permet d'avoir des propriétés optionnelles
   */
  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
  >({});

  /**
   * État de chargement (pour désactiver le bouton pendant la soumission)
   */
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // ─────────────────────────────────────────────────────────────────────────────
  // 2.2 GESTION DES ÉVÉNEMENTS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Gère les changements dans les champs de saisie
   * @param e - Événement du changement d'input
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    // Met à jour les données du formulaire
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Efface l'erreur dès que l'utilisateur recommence à taper
    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  /**
   * Valide le formulaire avec Zod
   * @returns true si valide, false sinon
   */
  const validateForm = (): boolean => {
    try {
      // Tente de valider les données avec le schéma
      loginSchema.parse(formData);
      setErrors({}); // Pas d'erreurs
      return true;
    } catch (error) {
      // Si validation échoue, extraire les erreurs
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof LoginFormData, string>> = {};

        // Pour chaque erreur trouvée par Zod
        error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            const fieldName = issue.path[0] as keyof LoginFormData;
            newErrors[fieldName] = issue.message;
          }
        });

        setErrors(newErrors);
      }
      return false;
    }
  };

  /**
   * Gère la soumission du formulaire
   * @param e - Événement de soumission du formulaire
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault(); // Empêche le rechargement de la page

    // Valide les données avant envoi
    if (!validateForm()) {
      return;
    }

    setIsLoading(true); // Active l'état de chargement

    try {
      // TODO: Remplacer par l'appel API réel
      console.log('Données de connexion:', formData);

      // Simulation d'une requête API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert('Connexion simulée réussie !');

      // TODO: Rediriger l'utilisateur après connexion
      // navigate('/dashboard');
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      alert('Erreur lors de la connexion');
    } finally {
      setIsLoading(false); // Désactive l'état de chargement
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 2.3 RENDU DU COMPOSANT
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="login">
      <div className="login__container">
        {/* En-tête du formulaire */}
        <div className="login__header">
          <h1>Connexion</h1>
          <p>Connectez-vous pour accéder à votre bibliothèque</p>
        </div>

        {/* Formulaire de connexion */}
        <form className="login__form" onSubmit={handleSubmit} noValidate>
          {/* Champ Email */}
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="votre@email.com"
              disabled={isLoading}
              autoComplete="email"
            />
            {errors.email && (
              <span className="error-message" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          {/* Champ Mot de passe */}
          <div className="form-group">
            <label htmlFor="password">Mot de passe *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Votre mot de passe"
              disabled={isLoading}
              autoComplete="current-password"
            />
            {errors.password && (
              <span className="error-message" role="alert">
                {errors.password}
              </span>
            )}
          </div>

          {/* Bouton de soumission */}
          <button type="submit" className="login__button" disabled={isLoading}>
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        {/* Pied de page avec lien vers inscription */}
        <div className="login__footer">
          <p>
            Pas encore de compte ?{' '}
            <Link to="/register" className="login__link">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
