//app.tsx va servir de configuration de routes

import Footer from "./components/layout/Footer/Footer";
import Header from "./components/layout/Header/Header";
import SearchBar from "./components/common/SearchBar/SearchBar";
import Home from "./pages/Home/Home";
import "./styles/App/App.scss";
import "./styles/Global/global.scss";

function App() {
  return (
    <>
      <div className="app-container">
        <Header />
        <SearchBar />
        <main className="main-content">
          <Home />
        </main>
        <Footer />
      </div>
    </>
  );
}

export default App;
