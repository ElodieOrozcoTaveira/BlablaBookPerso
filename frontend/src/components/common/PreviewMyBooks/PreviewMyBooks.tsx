import './_PreviewMysBooks.scss';


export default function PreviewMyBooks({books}) { //on utilise la props books pour pouvoir l'utiliser dans l'article
  const booksToShow = books.slice(0, 7); //la variable permet de récupérer les livre, et slice de lister les 7 premiers livres
  return (
    <>
      <div className="container-myBooks">
        <div className="container-myBooks__title">
            <h3 className="container-myBooks__h3">Mes Livres</h3>
            <button className="container-myBooks__btn">Tout voir</button>
        </div>
      
      <div className="container-articles">
        {booksToShow.map((book) => ( //map permet de générer dynamiquement une liste d'élements react à partir d'un tableau (books)
          <article key={book.id} className="article-book"> {/*key permet de donner une clé unique à chaque élement généré dans map. Sans cette clé, erreur dans la console, et react peut avoir des problèmes pour gérer les listes dynamiques */}
            <h4>{book.title}</h4>
            <p>{book.auteur}</p>       
          </article>
        ))}
      </div>
      </div>
    </>
  );
}
