import './MesLivres.scss';
import { IoTrashOutline } from "react-icons/io5"; //icone de la poubelle
import { useMyBooksStore } from "@/store/addBook";

export default function MesLivres() {
    const myBooks= useMyBooksStore((state)=> state.myBooks);
  
//fonction pour supprimer un livre de la bibliothèque
  const removeBook= useMyBooksStore((state) => state.removeBook);
    return(
        <>
        <div className="mesLivres-grid">
            <h2 className="mesLivres-h2">Mes Livres</h2>
            {myBooks.length === 0 ? (
                <h3>Votre Bibliothèque est vide</h3>
            ) : (
                <div className="mesLivres-container">
                {myBooks.map((book) => (
                    <article className="mesLivres-list" key={book.id || book.isbn || book.open_library_key}>
                    <div>
                        <img className='mesLivres-cover' src={String(book.cover_url || '/placeholder-book.png')} alt={book.title} />
                        <div className="mesLivres-title">{book.title}</div>
                        <div className="mesLivres-authors">{book.authors}</div>
                         {removeBook && (
                        <button
                            className="mesLivres-trash"
                            onClick={() => removeBook(book)}
                            title="Supprimer"
                        >
                            <IoTrashOutline />
                        </button>
                        )}
                    </div>
                </article>    
                ))}
            </div>
            )}    
        </div>        
        </>
    )
}