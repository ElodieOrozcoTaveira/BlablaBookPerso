import { Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import MesBibliothèques from './pages/MesBibliothèques/MesBibliothèques';
import MonProfil from './pages/MonProfil/MonProfil';
import GenrePage from './pages/Genre/Genre';
import NotFound from './pages/NotFound/NotFound'; // Nouveau composant

function App() {
  return (
    <Routes>
      {/* Route parent avec Layout */}
      <Route path="/" element={<Layout />}>
        {/* Routes enfants - s'affichent dans <Outlet /> */}
        <Route index element={<Home />} />
        <Route path="books/:id" element={<div>Détail livre (à créer)</div>} />

        {/* Routes utilisateur connecté */}
        <Route path="library" element={<MesBibliothèques />} />
        <Route path="genre" element={<GenrePage />} />

        <Route path="profile" element={<MonProfil />} />

        <Route
          path="my-books"
          element={<div>Mes livres (à implémenter)</div>}
        />
        <Route
          path="my-lists"
          element={<div>Mes listes (à implémenter)</div>}
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
