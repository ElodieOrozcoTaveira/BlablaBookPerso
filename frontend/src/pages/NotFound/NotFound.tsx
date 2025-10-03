// NotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.scss';

const NotFound: React.FC = () => {
  return (
    <div className="not-found">
      <div className="not-found__container">
        <div className="not-found__icon">📚</div>

        <h1 className="not-found__code">404</h1>
        <h2 className="not-found__title">Chapitre introuvable !</h2>

        <p className="not-found__message">
          Désolé, cette page n'existe pas ou a été déplacée.
        </p>

        <div className="not-found__actions">
          <Link to="/" className="not-found__btn not-found__btn--primary">
            Retour à l'accueil
          </Link>
          <Link to="/library" className="not-found__btn">
            Ma bibliothèque
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
