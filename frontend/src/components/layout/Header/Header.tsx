import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.scss';
import logo from '../../../assets/blablaNoBg-logo.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__logo">
          <Link to="/">
            <img src={logo} alt="BlaBlaBook logo" />
          </Link>
        </div>

        <button className="header__burger" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`header__nav ${isMenuOpen ? 'header__nav--open' : ''}`}>
          <ul>
            <li>
              <Link to="/" onClick={() => setIsMenuOpen(false)}>
                Accueil
              </Link>
            </li>
            <li>
              <Link to="/library" onClick={() => setIsMenuOpen(false)}>
                Ma Bibliothèque
              </Link>
            </li>
            <li>
              <Link to="/genre" onClick={() => setIsMenuOpen(false)}>
                Genre
              </Link>
            </li>
            <li>
              <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                Mon Profil
              </Link>
            </li>
          </ul>
        </nav>

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