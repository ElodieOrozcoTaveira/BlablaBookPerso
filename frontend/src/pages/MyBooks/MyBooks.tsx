import './MyBooks.scss';
import { useNavigate } from 'react-router-dom';
import { IoTrashOutline } from "react-icons/io5"; //icone de la poubelle
import { GiWhiteBook } from "react-icons/gi";//icone livre
import { useMyBooksStore } from '../../store/addBook';
import NavBar from '@/components/common/NavBar/NavBar';
import ToggleRead from '@/components/common/ToggleRead/ToggleRead';


interface MyBooksProps{
  max?: number,
}

export default function MyBooks({max}: MyBooksProps) {
  const navigate = useNavigate(); //permet de pouvoir naviguer sur la page id du livre
  const myBooks = useMyBooksStore((state) => state.myBooks);
  const booksToShow = max ? myBooks.slice(0, max) : myBooks; // reprend la props max, qui va permettre de ne faire apparaitre sur la page library, que 7 livres. Les reste des livres sera visible sur la page MesLivres
  
//fonction pour supprimer un livre de la bibliothèque
  const removeBook= useMyBooksStore((state) => state.removeBook);
  const toggleRead = useMyBooksStore((state) => state.toggleRead);
 

  return (
    <>
      <NavBar/>
    <div className="mybooks-grid">
      <div className="mybooks-grid__item mybooks-grid__header">
        Mes Livres <GiWhiteBook/>
      </div>
      {booksToShow.length === 0 ? (
        <div className="mybooks-grid__empty">Votre bibliothèque est vide.</div>
      ) : (
        booksToShow.map(book => (
          <div className="mybooks-grid__item" 
              key={book.id || book.open_library_key}
              tabIndex={0}
              role='button'
              >
            <img src={String(book.cover_url ||"")} // adapte selon ta structure
             alt={book.title} 
             className="book-cover"
             onClick={() => navigate(`/books/${book.id || book.open_library_key}`)}
            />
            <div className="book-info">
              <h3 className="book-title">{book.title}</h3>
              <p className="book-author">{book.authors || book.authors}</p>
            </div>
            {removeBook && (
              <button
                className="delete-book-btn"
                onClick={() => removeBook(book)}
                title="Supprimer"
              >
                <IoTrashOutline />
              </button>
            )}
            <ToggleRead
              read={Boolean(book.read)}
             onToggle={() => toggleRead(book.id)}
/>
          </div>
        ))
      )}
    </div>
    </>
  );
}