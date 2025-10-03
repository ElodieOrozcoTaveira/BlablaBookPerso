import './MyBooks.scss';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoTrashOutline } from "react-icons/io5"; //icone de la poubelle
import { GiWhiteBook } from "react-icons/gi";//icone livre



const initialBooks = [
  {
    id: 1,
    title: 'Le Petit Prince',
    author: 'Antoine de Saint-Exupéry',
    cover: 'https://picsum.photos/200/300?random=1',
    rating: 4.8,
  },
  {
    id: 2,
    title: '1984',
    author: 'George Orwell',
    cover: 'https://picsum.photos/200/300?random=2',
    rating: 4.6,
  },
  {
    id: 3,
    title: 'Dune',
    author: 'Frank Herbert',
    cover: 'https://picsum.photos/200/300?random=3',
    rating: 4.7,
  },
  {
    id: 5,
    title: "Harry Potter à l'école des sorciers",
    author: 'J.K. Rowling',
    cover: 'https://picsum.photos/200/300?random=5',
    rating: 4.9,
  },
  {
    id: 6,
    title: "L'Étranger",
    author: 'Albert Camus',
    cover: 'https://picsum.photos/200/300?random=6',
    rating: 4.3,
  },
  {
    id: 7,
    title: 'Le Seigneur des Anneaux',
    author: 'J.R.R. Tolkien',
    cover: 'https://picsum.photos/200/300?random=7',
    rating: 4.9,
  },
  {
    id: 8,
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    cover: 'https://picsum.photos/200/300?random=8',
    rating: 4.8,
  },
];

export default function MyBooks() {
  const navigate = useNavigate(); //permet de pouvoir naviguer sur la page id du livre
  const [books, setBooks] = useState(initialBooks);//l'état est initalisé à partir de la la liste plus haut

 
  const handleDeleteBook = (id: number) => {
    setBooks(books.filter(book => book.id !== id));
  };

  return (
    <div className="mybooks-grid">
      <div className="mybooks-grid__item mybooks-grid__header">
        Mes Livres <GiWhiteBook/>
      </div>
      {books.map(book => (
        <div className="mybooks-grid__item" 
            key={book.id}
            tabIndex={0}
            role='button'
            >
          <img src={book.cover}
           alt={book.title} 
           className="book-cover"
           onClick={() => navigate(`/books/${book.id}`)}
          />
          <div className="book-info">
            <h3 className="book-title">{book.title}</h3>
            <p className="book-author">{book.author}</p>
            <p className="book-rating">Note : {book.rating}</p>
          </div>
          <button
            className="delete-book-btn"
            onClick={() => handleDeleteBook(book.id)}
            title="Supprimer"
          >
            <IoTrashOutline />
          </button>
        </div>
      ))}
    </div>
  );
}