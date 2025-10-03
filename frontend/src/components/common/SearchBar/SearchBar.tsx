import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Book } from "../../../types/Books";
import './_SearchBar.scss';

const SearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowResults(value.trim().length > 0);

    if (value.trim().length > 0) {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:3000/api/openlibrary/search/books?query=${encodeURIComponent(value)}`
        );
        setResults(response.data.data || []);
      } catch {
        setResults([]);
      }
      setLoading(false);
    } else {
      setResults([]);
    }
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
      </div>

      {showResults && (
        <div className="results">
          {loading ? (
            <div className="results__empty">Chargement...</div>
          ) : results.length > 0 ? (
            results.map((book) => (
              <div
                key={book.id}
                onClick={() => navigate(`/books/${book.id}`)}
                className="results__item"
              >
                <img src={`${book.cover_url}`} alt={book.title} className="results__cover" />
                <div className="results__title">{book.title}</div>
                <div className="results__meta">{book.authors}</div>
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
