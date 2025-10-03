
import './Genre.scss';

interface Genre {
  id: string;
  icon: string;
  title: string;
  description: string;
  examples: string;
  stats: {
    books: number;
    popularity: number;
  };
}

const genresData: Genre[] = [
  {
    id: 'fantasy',
    icon: '🐉',
    title: 'Fantasy',
    description: 'Plongez dans des mondes magiques peuplés de créatures fantastiques, de sorciers et d\'aventures épiques. La fantasy vous transporte dans des univers où l\'impossible devient réalité.',
    examples: 'Exemples : Le Seigneur des Anneaux, Harry Potter, Game of Thrones',
    stats: {books: 120,popularity: 89 }
  },
  {
    id: 'science-fiction',
    icon: '🚀',
    title: 'Science-Fiction',
    description: 'Explorez le futur, l\'espace et les technologies avancées. La science-fiction questionne notre rapport au progrès et imagine des sociétés futures fascinantes ou inquiétantes.',
    examples: 'Exemples : Dune, Foundation, Blade Runner',
    stats: { books:121,  popularity: 76 }
  },
  {
    id: 'romance',
    icon: '💕',
    title: 'Romance',
    description: 'Vivez des histoires d\'amour passionnées et touchantes. La romance explore les relations humaines, les émotions intenses et les chemins parfois compliqués vers le bonheur.',
    examples: 'Exemples : Orgueil et Préjugés, Me Before You, The Notebook',
    stats: {  books:122, popularity: 92 }
  },
  {
    id: 'thriller',
    icon: '🔍',
    title: 'Thriller',
    description: 'Frissons garantis avec des histoires palpitantes pleines de suspense. Les thrillers vous tiennent en haleine avec leurs rebondissements inattendus et leur tension constante.',
    examples: 'Exemples : Gone Girl, The Girl with the Dragon Tattoo, Da Vinci Code',
    stats: { books:123, popularity: 85 }
  },
  {
    id: 'biography',
    icon: '👤',
    title: 'Biographie',
    description: 'Découvrez la vie de personnages marquants de l\'histoire. Les biographies nous inspirent à travers les parcours exceptionnels de femmes et d\'hommes qui ont marqué leur époque.',
    examples: 'Exemples : Steve Jobs, Michelle Obama, Nelson Mandela',
    stats: { books:124, popularity: 67 }
  },
  {
    id: 'mystery',
    icon: '🕵️',
    title: 'Mystère',
    description: 'Résolvez des énigmes captivantes aux côtés de détectives brillants. Les romans policiers stimulent votre esprit déductif tout en vous divertissant avec des intrigues complexes.',
    examples: 'Exemples : Sherlock Holmes, Agatha Christie, Louise Penny',
    stats: { books:125, popularity: 78 }
  },
  {
    id: 'historical',
    icon: '🏛️',
    title: 'Historique',
    description: 'Voyagez dans le temps et revivez les grandes époques de l\'humanité. La fiction historique combine divertissement et apprentissage pour une expérience de lecture enrichissante.',
    examples: 'Exemples : All Quiet on the Western Front, The Pillars of the Earth',
    stats: { books:126, popularity: 71 }
  },
  {
    id: 'horror',
    icon: '👻',
    title: 'Horreur',
    description: 'Pour les amateurs de sensations fortes ! L\'horreur explore nos peurs les plus profondes et nous fait frissonner avec des histoires qui défient notre imagination.',
    examples: 'Exemples : Stephen King, H.P. Lovecraft, The Exorcist',
    stats: { books:127,popularity: 63 }
  }
];

interface GenreCardProps {
  genre: Genre;
  onClick: (genre: Genre) => void;
  index: number;
}

const Genre: React.FC<GenreCardProps> = ({ genre, onClick, index }) => {
  return (
    <div 
      className={`genre-card genre-card--${index}`}
      onClick={() => onClick(genre)}
    >
      <section className="container-article">
      <article className="genre-card__article">
      <h3 className="genre-card__title">{genre.title}{genre.icon}</h3>
      <p className="genre-card__description">{genre.description}</p>
      <p className="genre-card__examples">{genre.examples}</p>
      <div className="genre-card__stats">
        <div className="genre-card__stat">
          <span className="genre-card__stat-number">{genre.stats.books}</span>
        </div>
        <div className="genre-card__stat">
          <span className="genre-card__stat-number">{genre.stats.popularity}%</span>
          <span className="genre-card__stat-label">  Popularité</span>
        </div>
      </div>
      </article>
      </section>
    </div>
  );
};

// Composant principal à utiliser dans le router
const GenrePage: React.FC = () => {
  // Action au clic sur une carte (exemple : navigation, affichage, etc.)
  const handleGenreClick = (genre: Genre) => {
    // Par exemple, tu peux afficher une alerte ou naviguer
    alert(`Genre sélectionné : ${genre.title}`);
    // Ou utiliser useNavigate pour changer de page
  };

  return (
    <div className="book-genres__container">
      <div className="book-genres__cards">
        {genresData.map((genre, idx) => (
          <Genre
            key={genre.id}
            genre={genre}
            onClick={handleGenreClick}
            index={idx}
          />
        ))}
      </div>
    </div>
  );
};

export default GenrePage;