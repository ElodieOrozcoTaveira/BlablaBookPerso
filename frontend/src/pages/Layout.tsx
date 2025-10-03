//import des composants
import Header from "../components/layout/Header/Header";
import Footer from "../components/layout/Footer/Footer";
import SearchBar from "../components/common/SearchBar/SearchBar";
import LibraryNav from "../components/common/LibraryNav/LibraryNav";
//import d'Outlet qui permet de gérer dynamiquement les pages
import { Outlet } from "react-router-dom";
//import Hook
import { useState } from "react";




export default function Layout() {
      const [books, setBooks] = useState(staticBooks);
    
    return(
        <>
      <div className="app-container">
        <Header />
        <SearchBar setBooks={setBooks}/> {/*on passe la fonction au composant comme ça on pourra modifier la liste des livres affichés après une recherche ou requête à l'API OpenLibrary */}
        <main className="main-content">
          <LibraryNav/>
          <Outlet/>
        </main>
        <Footer/>
      </div>
    </>
    )
}