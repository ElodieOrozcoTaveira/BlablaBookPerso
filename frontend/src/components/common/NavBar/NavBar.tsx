import { Link } from "react-router-dom"
import './NavBar.scss';


export default function NavBar() {
    return(
        <>
        <section className="container-bibliothèque">
              <nav className="container-bibliothèque__nav">
                <Link to="/library" className="tout-voir">
                  Tout voir
                </Link>
                 <Link to="/MesLivres" className="mes-livres">
                  Mes Livres
                 </Link>
                  <Link to="/MesListes" className="mes-listes">
                  Mes Listes
                </Link>
                 <Link to="/mylibraries" className="mes-biblios">
                  Mes Bibliothèques
                 </Link>
              </nav>
            
        </section>
        </>

    )
}