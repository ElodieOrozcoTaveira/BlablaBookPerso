import { Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import MonProfil from './pages/MonProfil/MonProfil';
import GenrePage from './pages/Genre/Genre';
import NotFound from './pages/NotFound/NotFound'; // Nouveau composant
import MaBiblio from './pages/MaBiblio/MaBiblio';
import MesBiblios from './pages/MesComptes/MesComptes';
import DetailsLivre from './pages/DetailsLivre/DetailsLivre';
import Privacy from './pages/RGPD/RGPD';
import CGV from './pages/CGV/CGU/CGVU';
import Mentions from './pages/MentionsLegales/Mentions';
import Support from './pages/Support/Support';
import FAQ from './pages/FAQ/FAQ';
import About from './pages/APropos/Apropos';
import Contact from './pages/Contact/Contact';
import MyLists from './pages/MyLists/MyLists';
import MyListsDetail from './pages/MyListsDetail/MyListsDetail';
import MyBooks from './pages/MyBooks/MyBooks';
import PopularBooks from './pages/LivresPopulaires/LivresPopulaires';

function App() {
  return (
    <Routes>
      {/* Route parent avec Layout */}
      <Route path="/" element={<Layout />}>
        {/* Routes enfants - s'affichent dans <Outlet /> */}
        <Route index element={<Home />} />
        <Route path="books/:isbn" element={<DetailsLivre />} />

        {/* Routes utilisateur connecté */}
        <Route path="library" element={<MaBiblio />} />
        <Route path="genre" element={<GenrePage />} />

        <Route path="profile" element={<MonProfil />} />

        {/*Routes de la NavBar dans Ma Bibliothèque */}
        {/* la route Tout voir => route Library */}
        
        <Route path="my-lists" element={<MyLists />} />
        <Route path="MesLivres" element={<MyBooks />} />
        <Route
          path="my-lists"
          element={<div>Mes listes (à implémenter)</div>}
        />
        <Route path='/popular-books' element= {<PopularBooks/>} />
        <Route path="mylists/:id" element={<div>Liste :id</div>} />
        <Route path="/liste/:id" element={<MyListsDetail />} />
        <Route path="mylibraries" element={<MesBiblios />} />

        {/* Routes d'authentification */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Route 404 - Nouvelle page stylée */}
        <Route path="*" element={<NotFound />} />

        {/* Routes Footer */}
        <Route path="privacy" element={<Privacy />} />
        <Route path="CGV-CGU" element={<CGV />} />
        <Route path="Mentions-Legales" element={<Mentions />} />
        <Route path="Support" element={<Support />} />
        <Route path="FAQ" element={<FAQ />} />
        <Route path="About" element={<About />} />
        <Route path="Contact" element={<Contact />} />
      </Route>
    </Routes>
  );
}

export default App;
