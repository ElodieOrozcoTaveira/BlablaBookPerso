import './Home.scss';
import { BiSolidBookAdd } from "react-icons/bi";
import ListCard from '../../components/common/ListCard/ListCard';
import SearchBar from '../../components/common/SearchBar/SearchBar';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import type { Book } from '../../Types/Books';
import { useMyBooksStore } from '@/store/addBook';
import { useAuthStore } from '@/store/authStore';
import HomeHeader from '@/components/common/HomeHeader/HomeHader';

//on reste sur une liste populaire statique car pour l'instant on a pas de requete pour les listes populaires
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

// Liste de termes pour obtenir des livres variés
const searchTerms = [
  'fiction', 'mystery', 'romance', 'fantasy', 'science', 
  'history', 'adventure', 'classic', 'novel', 'literature'
];

export default function Home() {
  const navigate = useNavigate();
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // État pour le carrousel
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const booksPerPage: number = 4; // Nombre de livres visibles à la fois

  // Fonctions de navigation avec typage
  const nextSlide = (): void => {
    setCurrentIndex((prevIndex: number) => 
      prevIndex + booksPerPage >= popularBooks.length ? 0 : prevIndex + booksPerPage
    );
  };

  const prevSlide = (): void => {
    setCurrentIndex((prevIndex: number) => 
      prevIndex === 0 ? Math.max(0, popularBooks.length - booksPerPage) : prevIndex - booksPerPage
    );
  };

  const goToSlide = (slideIndex: number): void => {
    setCurrentIndex(slideIndex * booksPerPage);
  };

  // Gestionnaire d'erreur d'image typé
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>): void => {
    e.currentTarget.src = '/placeholder-book.png';
  };

  // Gestionnaire de clic sur livre typé
  const handleBookClick = (isbn: string | undefined): void => {
    if (isbn && isbn !== "undefined") {
      navigate(`/books/${isbn}`);
    }else {
      alert("Ce livre n'a pas d'ISBN");
    }
  };

  //Redigire vers la page connexion quand pas connecté et on clique sur ajouter un livre
  const user = useAuthStore((state) => state.user);

const handleAddBook = (book : Book) => {
        if (!user) {
          navigate("/login");
          return;
        }
        addBook(book);
        navigate("/MesLivres");
      };


  useEffect(() => {
    const fetchRandomPopularBooks = async () => {
      try {
        // Sélectionne un terme de recherche aléatoire
        const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
        
        // Utilise le terme aléatoire au lieu de 'value'
        const response = await axios.get(
          `http://localhost:3000/api/openlibrary/search/books?query=${encodeURIComponent(randomTerm)}`
        );
        
        const allBooks = response.data.data || [];


        //Filtre les livres avec des titres de moins de 40 caractères pour une meilleure UI
        const filteredBooks: Book[]= allBooks.filter((book:Book) => 
          book.title && book.title.length < 40 &&
         book.authors && book.authors.length < 30
      );
      setPopularBooks(filteredBooks);
    
        

  
        // vérification qu'on a assez de livres filtrés
        if (filteredBooks.length===0){
          console.warn('Aucun livre avec titre -100 caractères');
          const shuffled: Book[]= allBooks.sort(()=> 0.5 - Math.random());
          const randomBooks: Book[]= shuffled.slice(0, 8);
          setPopularBooks(randomBooks);
          return;
          
        }

        // Mélange le tableau et prend 8 livres au hasard
        const shuffled = allBooks.sort(() => 0.5 - Math.random());
        const randomBooks = shuffled.slice(0, 16);

        setPopularBooks(randomBooks);
      } catch (error) {
        console.error('Erreur lors de la récupération des livres:', error);
        setPopularBooks([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRandomPopularBooks();
  }, []);
  
  const addBook = useMyBooksStore((state) => state.addBook);

  {/* appel API ajout de livre
  const addBookToLibrary = async (book: Book): Promise<void> => {
  try {
    const response = await axios.post('http://localhost:3000/api/library', {
      bookId: book.id, // ou book.isbn si c’est la clé unique
      // tu peux aussi ajouter d’autres infos si nécessaire
    });

    if (response.status === 200) {
      alert('Livre ajouté avec succès !');
      // Ici, tu peux mettre à jour l’état local, etc.
    } else {
      alert('Erreur lors de l’ajout du livre.');
    }
  } catch (error) {
    console.error('Erreur API ajout livre:', error);
    alert('Erreur lors de la communication avec le serveur.');
  }
};*/}

  return (
    <>
      <HomeHeader/>
      <SearchBar />

      <section className="home__section">
      <h2>Livres Populaires</h2>
      {loading ? (
        <div className="loading">Chargement des livres...</div>
      ) : (
        <div className="books-carousel">
          <button 
            className="carousel-btn carousel-btn--prev"
            onClick={prevSlide}
          
            disabled={currentIndex === 0}
            type="button"
            aria-label="Livres précédents"
          >
            &#8249;
          </button>
          
          <div className="books-carousel__container">
            <div 
              className="books-carousel__track"
              style={{
                transform: `translateX(-${(currentIndex * 100) / booksPerPage}%)`,
                transition: 'transform 0.3s ease-in-out'
              }}
            >
              {popularBooks
                .filter((book: Book) => book.isbn) // ← filtre ici !
              .map((book: Book, index: number) => (
                <div
                  key={book.id || book.open_library_key || `${book.title}-${index}`}
                  className="books-carousel__item"
                  onClick={() => navigate('/')}
                  style={{ cursor: "pointer" }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                    if ((e.key === 'Enter' || e.key === ' ') && book.isbn) {
                      handleBookClick(book.isbn);
                    }
                  }}
                >
                  <img
                    src={String(book.cover_url || "")}
                    alt={book.title || 'Couverture de livre'}
                    className="books-carousel__cover"
                    onError={handleImageError}
                    onClick={() => navigate('books/:isbn')}
                  />
                  <div className="book-carousel__title">
                    {book.title || 'Titre non disponible'}
                  </div>
                  <div className="book-carousel__authors">
                    {book.authors || 'Auteur inconnu'}
                  </div>
                  <div className="book-carousel__date">
                    {book.publication_year || ''}
                  </div>
                  <button
                    onClick={(e) => {
                     e.stopPropagation();
                     handleAddBook(book);
                    }}
                    className="add-btn"
                  >
                    <BiSolidBookAdd />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            className="carousel-btn carousel-btn--next"
            onClick={nextSlide}
            disabled={currentIndex + booksPerPage >= popularBooks.length}
            type="button"
            aria-label="Livres suivants"
          >
            &#8250;
          </button>
        </div>
      )}
      
      {/* Indicateurs de pagination */}
      {popularBooks.length > booksPerPage && (
        <div className="carousel-indicators">
          {Array.from({ length: Math.ceil(popularBooks.length / booksPerPage) }).map((_, index: number) => (
            <button
              key={index}
              className={`indicator ${index * booksPerPage === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              type="button"
              aria-label={`Aller à la page ${index + 1}`}
            />
          ))}
        </div>
      )}
      
      <div className="section-footer">
        <a href="/popular-books" className="see-all-link">
          Voir tout
        </a>
      </div>
    </section>
  );


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
    </>
  );
}