import { Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import MonProfil from './pages/MonProfil/MonProfil';
import GenrePage from './pages/Genre/Genre';
import NotFound from './pages/NotFound/NotFound'; // Nouveau composant
import MaBiblio from './pages/MaBiblio/MaBiblio';
import MesBiblios from './pages/MesBiblios/MesBiblios';
import DetailsLivre from './pages/DetailsLivre/DetailsLivre';

function App() {
  return (
    <Routes>
      {/* Route parent avec Layout */}
      <Route path="/" element={<Layout />}>
        {/* Routes enfants - s'affichent dans <Outlet /> */}
        <Route index element={<Home />} />
        <Route path="books/:id" element={<DetailsLivre/>}/>

        {/* Routes utilisateur connecté */}
        <Route path="library" element={<MaBiblio/>} />
        <Route path="genre" element={<GenrePage />} />

        <Route path="profile" element={<MonProfil />} />

        {/*Routes de la NavBar dans Ma Bibliothèque */}
        {/* la route Tout voir => route Library */}
        <Route
          path="my-books"
          element={<div>Mes livres (à implémenter)</div>}
        />
        <Route
          path="my-lists"
          element={<div>Mes listes (à implémenter)</div>}
        />
        <Route
        path="mylists/:id"
        element={<div>Liste :id</div>}
        />
        <Route
        path="mylibraries"
        element={<MesBiblios/>}
        />


        {/* Routes d'authentification */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Route 404 - Nouvelle page stylée */}
        <Route path="*" element={<NotFound />} />
      </Route>

    </Routes>
  );
}

export default App;
