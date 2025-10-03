import React, { useState } from "react";
import axios from "axios";
import './_SearchBar.scss';
import { useNavigate } from "react-router-dom";
import type { Book } from "../../../Types/Books";


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

    if (value.trim().length > 0) { //si l'input nest pas vide
      setLoading(true);//on indique que la recherche est en cours (chargement...)
      try {
        const response = await axios.get(
          `http://localhost:3000/api/openlibrary/search/books?query=${encodeURIComponent(value)}`
        );//on fait une requete à l'api avec le texte recherché
        setResults(response.data.data || []); // si la requete réussit, on met à jour les résultats avec le tableau reçu
      } catch (error) {
        setResults([]);//si la requete échoue on vide les résultats
      }
      setLoading(false);//on indique que la recheche est terminée
    } else {
      setResults([]);//sinon on vide les résultats
    }
  };

  
  const navigate = useNavigate();//permet la navigation sur la page du livre

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
        
      </div>

      {showResults && (
        <div className="results">
          {loading ? (
            <div className="results__empty">Chargement...</div>
          ) : results.length > 0 ? (
            results.map((book) => (
              <div
                key={book.id}
                onClick={() =>{
                  if (onSelect) onSelect(book);
                navigate(`/books/${book.id}`);
                }}
                className="results__item"
              >
                <img src={String(book.cover_url || "")} alt={book.title} className="results__cover" />
                <div className="results__title">{book.title}</div>
                <div className="results__meta">
                  {book.authors}
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