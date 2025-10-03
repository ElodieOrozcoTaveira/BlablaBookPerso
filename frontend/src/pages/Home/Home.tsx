import './Home.scss';
import BookCard from '../../components/common/BookCard/BookCard';
import ListCard from '../../components/common/ListCard/ListCard';
import SearchBar from '../../components/common/SearchBar/SearchBar';

const Home = () => {
  const myBooks = [
    {
      id: 1,
      title: 'Le Petit Prince',
      author: 'Antoine de Saint-Exupéry',
      cover: 'https://picsum.photos/200/300?random=1',
      rating: 4.8,
      genre: 'Classique',
    },
    {
      id: 2,
      title: '1984',
      author: 'George Orwell',
      cover: 'https://picsum.photos/200/300?random=2',
      rating: 4.6,
      genre: 'Dystopie',
    },
  ];

  const popularBooks = [
    {
      id: 3,
      title: "Harry Potter à l'école des sorciers",
      author: 'J.K. Rowling',
      cover: 'https://picsum.photos/200/300?random=3',
      rating: 4.9,
      genre: 'Fantasy',
    },
    {
      id: 4,
      title: 'Dune',
      author: 'Frank Herbert',
      cover: 'https://picsum.photos/200/300?random=4',
      rating: 4.7,
      genre: 'Science-Fiction',
    },
    {
      id: 5,
      title: "L'Étranger",
      author: 'Albert Camus',
      cover: 'https://picsum.photos/200/300?random=5',
      rating: 4.3,
      genre: 'Philosophie',
    },
    {
      id: 6,
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      cover: 'https://picsum.photos/200/300?random=6',
      rating: 4.5,
      genre: 'Romance',
    },
    {
      id: 10,
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      cover: 'https://picsum.photos/200/300?random=10',
      rating: 4.8,
      genre: 'Drame',
    },
    {
      id: 11,
      title: 'Le Seigneur des Anneaux',
      author: 'J.R.R. Tolkien',
      cover: 'https://picsum.photos/200/300?random=11',
      rating: 4.9,
      genre: 'Fantasy',
    },
  ];

  const popularLists = [
    {
      id: 1,
      title: 'Les Incontournables de la Fantasy',
      description:
        'Une sélection des meilleurs romans de fantasy pour débuter ou approfondir ce genre captivant.',
      bookCount: 15,
      username: 'MagicReader',
    },
    {
      id: 2,
      title: 'Classiques de la Littérature Française',
      description:
        'Les œuvres essentielles de la littérature française à lire absolument.',
      bookCount: 22,
      username: 'ProfDeLettres',
    },
    {
      id: 3,
      title: 'Science-Fiction Moderne',
      description:
        'Les dernières pépites de la SF contemporaine qui révolutionnent le genre.',
      bookCount: 12,
      username: 'SciFiAddict',
    },
  ];

  return (
    
    <div className="home">
      <section className="home__hero">
        <h1>Bienvenue sur BlaBlaBook</h1>
        <p>Découvrez, organisez et partagez vos lectures</p>
      </section>
      <SearchBar/>

      <section className="home__section">
        <h2>Mes Livres</h2>
        <div className="books-grid">
          {myBooks.map((book) => (
            <BookCard key={book.id} {...book} />
          ))}
        </div>
        <div className="section-footer">
          <a href="/my-books" className="see-all-link">
            Voir tout
          </a>
        </div>
      </section>

      <section className="home__section">
        <h2>Livres Populaires</h2>
        <div className="books-grid">
          {popularBooks.map((book) => (
            <BookCard key={book.id} {...book} />
          ))}
        </div>
        <div className="section-footer">
          <a href="/popular-books" className="see-all-link">
            Voir tout
          </a>
        </div>
      </section>

      <section className="home__section">
        <h2>Listes Populaires</h2>
        <div className="books-grid">
          {popularLists.map((list) => (
            <ListCard key={list.id} {...list} />
          ))}
        </div>
        <div className="section-footer">
          <a href="/popular-lists" className="see-all-link">
            Voir tout
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;
