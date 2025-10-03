import { Link } from "react-router-dom";
import './_LibraryNav.scss';

export default function LibraryNav() {
  return (
    <div className="container-libraryNav">
      <nav className="container-nav" aria-label="Navigation bibliothèque">
        <Link to="/mes-livres" className="container-nav__links">
          Mes Livres
        </Link> {/*les Link utilisent la propriété to pour la navigation interne avec react router dom*/}
        <Link to="/mes-listes" className="container-nav__links">
          Mes listes
        </Link>
        <Link to="/ma-bibliotheque" className="container-nav__links">
          Mes Bibliothèques
        </Link>
      </nav>
    </div>
  );
}
