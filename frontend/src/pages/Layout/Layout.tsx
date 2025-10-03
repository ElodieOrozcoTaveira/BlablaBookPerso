import { Outlet } from 'react-router-dom';
import SearchBar from '../../components/common/SearchBar/SearchBar';
import Footer from '../../components/layout/Footer/Footer';
import Header from '../../components/layout/Header/Header';

const Layout = () => {
  return (
    <div className="app">
      <Header />
      <SearchBar />
      <main className="main-content">
        {/* Outlet rend le composant de la route actuelle */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
