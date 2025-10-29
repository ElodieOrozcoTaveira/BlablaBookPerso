import { Outlet } from "react-router-dom";
import BookSearch from "../../components/ui/BookSearch/BookSearch";
import Footer from "../../components/layout/Footer/Footer";
import Header from "../../components/layout/Header/Header";

const Layout = () => {
  return (
    <div className="app">
      <Header />
      <BookSearch />
      <main className="main-content">
        {/* Outlet rend le composant de la route actuelle */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
