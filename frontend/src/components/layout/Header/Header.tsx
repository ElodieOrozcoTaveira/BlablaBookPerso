import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom'; // Import NavLink
import './Header.scss';
import logo from '../../../assets/blablaNoBg-logo.png';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const toggleMenu = (): void => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = (): void => {
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header__container">
        {/* Logo - reste un Link car ce n'est pas vraiment de la navigation */}
        <div className="header__logo">
          <Link to="/">
            <img src={logo} alt="BlaBlaBook logo" />
          </Link>
        </div>

        {/* Bouton burger pour mobile */}
        <button
          className="header__burger"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation principale avec NavLink */}
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
            <li>
              <NavLink
                to="/library"
                onClick={closeMenu}
                className={({ isActive }) =>
                  isActive ? 'nav-link nav-link--active' : 'nav-link'
                }
              >
                Ma Bibliothèque
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/genre"
                onClick={closeMenu}
                className={({ isActive }) =>
                  isActive ? 'nav-link nav-link--active' : 'nav-link'
                }
              >
                Genre
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
          </ul>
        </nav>

        {/* Boutons d'authentification - restent des Link car ce sont des actions */}
        <div className="header__auth">
          <Link to="/login" className="btn-login">
            Connexion
          </Link>
          <Link to="/register" className="btn-register">
            Inscription
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
