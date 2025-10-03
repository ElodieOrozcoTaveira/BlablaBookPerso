import Header from './components/layout/Header/Header';
import Home from './pages/Home/Home';
import './styles/App.scss';
import './styles/global.scss';
import './styles/App/App.scss';
import './styles/Global/global.scss';

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
