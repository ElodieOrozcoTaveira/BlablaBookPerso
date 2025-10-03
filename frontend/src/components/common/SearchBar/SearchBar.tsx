import React, { useState } from "react";
import axios from "axios";
import { IoBook } from "react-icons/io5";
import './_SearchBar.scss';

interface Book {
  id: string;
  title: string;
  description: string;
  auteur: string;
  nb_page: number;
  date_publication: number;
}

interface SearchBarProps { // définit les props attendues par le composant SearchBar
  onSelect?: (book: Book) => void;//onSelect est une fonction qui prend l'objet book en arguement, et ne retourne rien (void). Au vu du ?, la fonction est optionelle, cest à dire que le composant peut être utiliser sans la fournir
}

const SearchBar: React.FC<SearchBarProps> = ({ onSelect }) => {//Searchbar est un composant qui prend éventuellement une prop onSelect
  const [searchQuery, setSearchQuery] = useState('');//état qui contient le texte tapé par l'utilisateur dans la barre de recherche, et set la fonction pour modifier l'état
  const [showResults, setShowResults] = useState(false);//état booléen qui indique si la liste des résultats doit être affichée, set la fonction pour modifier
  const [results, setResults] = useState<Book[]>([]);//état qui contient les livres trouvés par la recherche, set fonction pour modifier
  const [loading, setLoading] = useState(false);// état booléen qui indique si la recherche est en cours ( ce qui affiche chargement), set fonction pour modifier

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => { //-handleInputChange fonction appelé chaque fois que l'utilisateur    tape dans l'input. 
    
    const value = e.target.value;//    -e.target.value recupère le texte actuel de l'input
    setSearchQuery(value);//fonction qui met à jour létat de la value
    setShowResults(value.trim().length > 0);//fonction qui affiche la liste des résultats si l'input nest pas vide en enlevant les espaces (trim)

    if (value.trim().length > 0) {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:3000/api/openlibrary/search/books?query=${encodeURIComponent(value)}`
        );
        setResults(response.data.data || []); // adapte selon la structure de ta réponse API
      } catch (error) {
        setResults([]);
      }
      setLoading(false);
    } else {
      setResults([]);
    }
  };

  const handleBookSelect = (book: Book) => {
    setSearchQuery(book.title);
    setShowResults(false);
    if (onSelect) onSelect(book);
  };

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
          <IoBook size={24} />
        </button>
      </div>

      {showResults && (
        <div className="results">
          {loading ? (
            <div className="results__empty">Chargement...</div>
          ) : results.length > 0 ? (
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