import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useToastStore } from '../../store/toastStore';
import './Register.scss';

// Validation simple avec Zod
const registerSchema = z
  .object({
    firstname: z
      .string()
      .min(1, 'Le prénom est requis')
      .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
      .trim(),

    lastname: z
      .string()
      .min(1, 'Le nom est requis')
      .max(50, 'Le nom ne peut pas dépasser 50 caractères')
      .trim(),

    username: z
      .string()
      .min(3, "Le nom d'utilisateur doit faire au moins 3 caractères")
      .max(30, "Le nom d'utilisateur ne peut pas dépasser 30 caractères")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, _ et -"
      )
      .trim(),

    email: z
      .email('Email invalide')
      .max(100, "L'email ne peut pas dépasser 100 caractères")
      .toLowerCase()
      .trim(),

    password: z
      .string()
      .min(8, 'Le mot de passe doit faire au moins 8 caractères')
      .max(72, 'Le mot de passe ne peut pas dépasser 72 caractères')
      .regex(
        /(?=.*[a-z])/,
        'Le mot de passe doit contenir au moins une minuscule'
      )
      .regex(
        /(?=.*[A-Z])/,
        'Le mot de passe doit contenir au moins une majuscule'
      )
      .regex(/(?=.*\d)/, 'Le mot de passe doit contenir au moins un chiffre')
      .regex(
        /(?=.*[@$!%*?&])/,
        'Le mot de passe doit contenir au moins un caractère spécial (@$!%*?&)'
      ),

    confirmPassword: z
      .string()
      .min(1, 'La confirmation du mot de passe est requise'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterFormData>({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterFormData, string>>
  >({});

  const { success, error: showError } = useToastStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof RegisterFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    try {
      registerSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof RegisterFormData, string>> = {};
        error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            const fieldName = issue.path[0] as keyof RegisterFormData;
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

    try {
      const response = await axios.post(
        '/api/users/register',
        {
          firstname: formData.firstname,
          lastname: formData.lastname,
          username: formData.username,
          email: formData.email,
          password: formData.password,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        success(
          'Compte créé avec succès ! Vous pouvez maintenant vous connecter.'
        );
        navigate('/login');
      }
    } catch (error: any) {
      console.error('Erreur inscription:', error);
      if (error.response?.data?.message) {
        showError('Erreur: ' + error.response.data.message);
      } else {
        showError('Erreur de connexion. Veuillez réessayer.');
      }
    }
  };

  return (
    <div className="register">
      <div className="register__container">
        <div className="register__header">
          <h1>Créer un compte</h1>
          <p>Rejoignez BlaBlaBook et découvrez votre prochaine lecture</p>
        </div>

        <form className="register__form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstname">Prénom</label>
              <input
                type="text"
                id="firstname"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                className={errors.firstname ? 'error' : ''}
                placeholder="Votre prénom"
              />
              {errors.firstname && (
                <span className="error-message">{errors.firstname}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastname">Nom</label>
              <input
                type="text"
                id="lastname"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                className={errors.lastname ? 'error' : ''}
                placeholder="Votre nom"
              />
              {errors.lastname && (
                <span className="error-message">{errors.lastname}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? 'error' : ''}
              placeholder="Choisissez un nom d'utilisateur"
            />
            {errors.username && (
              <span className="error-message">{errors.username}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="votre@email.com"
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Créez un mot de passe sécurisé"
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
              placeholder="Confirmez votre mot de passe"
            />
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          <button type="submit" className="register__button">
            Créer mon compte
          </button>
        </form>

        <div className="register__footer">
          <p>
            Déjà un compte ?
            <Link to="/login" className="register__link">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
