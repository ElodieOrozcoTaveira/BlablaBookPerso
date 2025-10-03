import { useNavigate } from 'react-router-dom';
import './MyLists.scss';
import { IoTrashOutline } from "react-icons/io5";
import { CiViewList } from "react-icons/ci";

import { useState } from 'react';

const initialLists = [
  { 
    id: 1, 
    name: "Mes coups de cœur", 
    owner: "Elodie", 
    cover: "https://picsum.photos/200/300?random=1" 
  },
  { 
    id: 2, 
    name: "Classiques à lire", 
    owner: "Elodie",
    cover: "https://picsum.photos/200/300?random=2" 
  },
  { 
    id: 3, 
    name: "Saga Harry Potter", 
    owner: "Elodie",
    cover: "https://picsum.photos/200/300?random=3" 
  },
  { 
    id: 4, 
    name: "Science-Fiction moderne", 
    owner: "Elodie",
    cover: "https://picsum.photos/200/300?random=4" 
  },
  { 
    id: 5, 
    name: "Romans d'été", 
    owner: "Elodie",
    cover: "https://picsum.photos/200/300?random=5" 
  },
  { 
    id: 6, 
    name: "Fantasy épique", 
    owner: "Elodie",
    cover: "https://picsum.photos/200/300?random=6" 
  },
  { 
    id: 7, 
    name: "Thrillers psychologiques", 
    owner: "Elodie",
    cover: "https://picsum.photos/200/300?random=7" 
  },
  
];

export default function MyLists() {
  const navigate = useNavigate();//permet de changer de page et d'arriver sur la page de la liste

  const [lists, setLists]= useState(initialLists);

  const handleDeleteBook = (id: number) => {
    setLists(lists.filter(list => list.id !== id));
  };


  
  return (
    <div className="lists-grid">
      <div className="lists-grid__item lists-grid__header">
        Mes Listes <CiViewList />

      </div>
      {lists.map(list => (
        <div
          className="lists-grid__item"
          key={list.id}
          onClick={() => navigate(`/liste/${list.id}`)}
          tabIndex={0}
          role="button"
        >
          <img className='list-cover' src={list.cover} alt={list.name} />
          <h2 className='list-name'>{list.name}</h2>
          <span className="list-owner">par {list.owner}</span>
          <button
            className="delete-book-btn"
            onClick={() => handleDeleteBook(list.id)}
            title="Supprimer"
          >
            <IoTrashOutline />
            </button>
        </div>
        
      ))}
    </div>
  );
}