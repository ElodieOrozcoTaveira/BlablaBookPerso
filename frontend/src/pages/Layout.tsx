import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header/Header';
import Footer from '../components/layout/Footer/Footer';

const Layout = () => {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {/* Outlet rend le composant de la route actuelle */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
