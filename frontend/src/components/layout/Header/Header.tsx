// src/components/layout/Header/Header.tsx
import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import './Header.scss';
import logo from '@/assets/blablaNoBg-logo.png';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const { user, isLoading, logout, checkAuth } = useAuthStore();
  const isConnected = !!user;

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async (): Promise<void> => {
    await logout();
    closeMenu();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__logo">
          <Link to="/">
            <img src={logo} alt="BlaBlaBook logo" />
          </Link>
        </div>

        <button
          className="header__burger"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`header__nav ${isMenuOpen ? 'header__nav--open' : ''}`}>
          <ul>
            <li>
              <NavLink
                to="/"
                onClick={closeMenu}
                className={({ isActive }) =>
                  isActive ? 'nav-link nav-link--active' : 'nav-link'
                }
              >
                Accueil
              </NavLink>
            </li>

            {isConnected && (
              <>
                <li>
                  <NavLink
                    to="/library"
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      isActive ? 'nav-link nav-link--active' : 'nav-link'
                    }
                  >
                    Mon Espace
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/profile"
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      isActive ? 'nav-link nav-link--active' : 'nav-link'
                    }
                  >
                    Mon Profil
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div className="header__auth">
          {isLoading ? (
            <span>Chargement...</span>
          ) : isConnected && user ? (
            <>
              <span className="welcome-user">Bonjour {user.username} !</span>
              <button onClick={handleLogout} className="btn btn-logout">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-login">
                Connexion
              </Link>
              <Link to="/register" className="btn-register">
                Inscription
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
