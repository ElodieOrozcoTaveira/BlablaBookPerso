import React, { useState } from "react";
import { IoBook } from "react-icons/io5";
import './_SearchBar.scss';


//définition de la structure de l'objet Book. Avec cette interface, TS vérifie que les objets utilisés respectent bien la structure donnée.
interface Book {
  id: string;
  title: string;
  description: string;
  auteur: string,
  nb_page: number;
  date_publication: number;
}

// Dix livres statiques (le front n'étant pas encore connecté à l'API)
export const staticBooks: Book[] = [
  {
    id: '1',
    title: 'Le Petit Prince',
    description: "Un conte poétique et philosophique sur l'amitié et l'amour",
    auteur:" Antoine de Saint Exupéry",
    nb_page: 96,
    date_publication: 1943,
  },
  {

    id: "2",
    title: "1984",
    description: "Un roman dystopique sur la surveillance totalitaire",
    auteur:" Georges Orwell",
    nb_page: 328,
    date_publication: 1949,
  },
  {
    id: '3',
    title: "L'Étranger",
    description: "L'histoire d'un homme confronté à l'absurdité de l'existence",
    auteur:" Albert Camus",
    nb_page: 123,
    date_publication: 1942,
  },
  {
    id: '4',
    title: 'Pride and Prejudice',
    description: "Une histoire d'amour dans l'Angleterre du 19ème siècle",
    auteur:" Jane Austen",
    nb_page: 432,
    date_publication: 1813,
  },
  {
    id: '5',
    title: 'To Kill a Mockingbird',
    description: "Un récit sur l'injustice raciale dans le Sud américain",
    auteur:" Harper Lee",
    nb_page: 376,
    date_publication: 1960,
  },
  {
    id: "6",
    title: "Le Comte de Monte-Cristo",
    description:"Une épopée de vengeance et de justice dans la France du 19ème siècle",
    auteur:" Alexandre Dumas",
    nb_page: 1276,
    date_publication: 1844,
  },
  {
    id: "7",
    title: "Les Misérables",
    description:"L'histoire de Jean Valjean et de la société française du 19ème siècle",
    auteur:" Victor Hugo",
    nb_page: 1463,
    date_publication: 1862,
  },
  {
    id: '8',
    title: "Harry Potter à l'école des sorciers",
    description: "Les aventures d'un jeune sorcier dans une école de magie",
    auteur:" JK Rowling",
    nb_page: 309,
    date_publication: 1997,
  },
  {
    id: "9",
    title: "Le Seigneur des Anneaux",
    description:"Une quête épique dans la Terre du Milieu pour détruire l'Anneau unique",
    auteur:" JRR Tolkien",
    nb_page: 1216,
    date_publication: 1954,
  },
  {

    id: "10",
    title: "Cent ans de solitude",
    description:"L'histoire de la famille Buendía à travers plusieurs générations",
    auteur:" Gabriel Garcia Marquez",
    nb_page: 417,
    date_publication: 1967,
  },
];

// Props SearchBarProps que le composant SearchBar peut recevoir
interface SearchBarProps {
  books?: Book[]; // books est un tableau de livre optionnel?. Cest à dire qu'il n'est pas obligatoire lors de l'utilisation du composant. 
  setBooks?: (books: Book[]) => void;// setBooks est la fonction qui permet de mettre à jour la liste des livres, mais elle reste optionnel à l'utilisation du composant
  onSelect?: (book: Book) => void; //fonction optionnelle qui s'exécute quand est livre est sélectionné
}

const SearchBar: React.FC<SearchBarProps> = ({ //syntaxe react fonctionnelle et on indique que les props doivent respecter l'interface SearchBarprops
  books = staticBooks,// si la props books nest pas fournie, on utilise par défaut le tableau staticBooks
  onSelect,//fonction qui s'exécute quand un livre est sélectionné
  setBooks,//fonction qui permettre de mettre à jour la liste des livres 
}) => {
  //type TS qui indique que cest un composant fonctionnel React
  const [searchQuery, setSearchQuery] = useState(''); // searchQuery est la variable qui contient le texte tapé par l'utilisateur. setSearchQuery est la fonction qui permet de modifier ce texte
  const [showResults, setShowResults] = useState(false); // showResults est un booléen qui détermine si on affiche ou pas les résultats. setShowResults est une fonction pour montrer/cacher les résultats. useState false initialise à false (resultat caché)

  const searchBooks = (query: string): Book[] => {
    // query: string reçoit le texte de recherche
    if (!query.trim()) return []; //si la recherche est vide, alors retourne un tableau vide

    const lowercaseQuery = query.toLowerCase(); // convertit la query en minusculue pour une recherche insensible à la casse
    return books.filter(
      (
        book //filtre le tableau des livres
      ) =>
        book.title.toLowerCase().includes(lowercaseQuery) || //vérifie si le titre contient le texte recherché
        book.description.toLowerCase().includes(lowercaseQuery) // vérifie si la description contient le texte recherché
    );
  };

  //gestion de la saisie
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //évènement TS quand on tape dans un input
    const value = e.target.value; //récupère le texte tapé dans l'input
    setSearchQuery(value); //met à jour l'état avec le nouveau texte
    setShowResults(value.trim().length > 0); // montre le résultat que s'il y a du texte
  };

  const handleBookSelect = (book: Book) => {
    //quand je clique un livre dans les résultats de la recherche, cette fonction s'exécute
    setSearchQuery(book.title); //remplit la barre de recherche avec le titre du livre
    setShowResults(false); //cache la liste des résultats
    //par exmple, je clique sur un livre, la barre de recherche affiche le livre et la liste disparait
    if (onSelect) onSelect(book); //callback optionnel si besoin
  };

  const results = searchBooks(searchQuery); //à chaque fois que searchQuery change, cette ligne recalcule les résultats. Results contient le tableau des livres qui correspondent à la recherche actuelle

  /*En gros:je tape un texte dans la barre de recherche, handleInputChange met à jour searchQuery. 
    SearchQuery change, les résultats se recalculent automatiquement. Les nouveaux résults s'affichent à l'écran. Les nouveaux résults s'affichent à l'écran. Je clique sur le livre, handleBookSelect remplit la barre de recherche et cache les résultats 
  */

  return (
    <div className="container">
      <div className="searchbar">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="Rechercher un livre..."
          className="searchbar__input"
        />
        <button className="searchbar-btn" type="button">
          <IoBook size={24} /> {/* logo importé de react icon */}
        </button>
      </div>

      {showResults && (
        <div className="results">
          {results.length > 0 ? (
            results.map((book) => (
              <div
                key={book.id}
                onClick={() => handleBookSelect(book)}
                className="results__item"
              >
                <div className="results__title">{book.title}</div>
                <div className="results__description">{book.description}</div>
                <div className="results__meta">
                  {book.nb_page} pages • {book.date_publication}
                </div>
              </div>
            ))
          ) : (
            <div className="results__empty">Aucun livre trouvé</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
