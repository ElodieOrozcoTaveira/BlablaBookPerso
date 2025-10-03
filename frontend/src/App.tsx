import Header from './layout/Header/Header';
import Home from './pages/Home/Home';
import './styles/global.scss';

function App() {
  return (
    <>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Home />
        </main>
      </div>
    </>
  );
}

export default App;
