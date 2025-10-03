import { useState } from 'react';
import logo from '../../assets/blablabookLogo/blablaNoBg-logo.svg';
import './Header.scss';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__logo">
          <a href="/">
            <img src={logo} alt="BlaBlaBook logo" />
          </a>
        </div>

        <button className="header__burger" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`header__nav ${isMenuOpen ? 'header__nav--open' : ''}`}>
          <ul>
            <li>
              <a href="/" onClick={() => setIsMenuOpen(false)}>
                Accueil
              </a>
            </li>
            <li>
              <a href="/library" onClick={() => setIsMenuOpen(false)}>
                Ma Bibliothèque
              </a>
            </li>
            <li>
              <a href="/genre" onClick={() => setIsMenuOpen(false)}>
                Genre
              </a>
            </li>
            <li>
              <a href="/profile" onClick={() => setIsMenuOpen(false)}>
                Mon Profil
              </a>
            </li>
          </ul>
        </nav>

        <div className="header__auth">
          <button className="btn-login">Connexion</button>
          <button className="btn-register">Inscription</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
