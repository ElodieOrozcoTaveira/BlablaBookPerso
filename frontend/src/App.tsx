import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header/Header';
import Footer from './components/layout/Footer/Footer';
import Home from './pages/Home/Home';
import SearchBar from './components/common/SearchBar/SearchBar';
import Login from './pages/Login/Login';
import Register from './pages/Resgister/Register';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <SearchBar />
        <main className="main-content">
          <Routes>
            {/* Route d'accueil */}
            <Route path="/" element={<Home />} />

            {/* Route découverte */}
            <Route
              path="/books/:id"
              element={<div>Détail livre (à créer)</div>}
            />

            {/* Routes utilisateur connecté - À implémenter par Elodie */}
            <Route
              path="/library"
              element={<div>Bibliothèque (à implémenter)</div>}
            />
            <Route
              path="/my-books"
              element={<div>Mes livres (à implémenter)</div>}
            />
            <Route
              path="/my-lists"
              element={<div>Mes listes (à implémenter)</div>}
            />

            {/* Routes d'authentification */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Route 404 */}
            <Route path="*" element={<div>Page non trouvée</div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;