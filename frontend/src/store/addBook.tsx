import { create } from "zustand";
import type {Book} from '../Types/Books';
import { persist } from "zustand/middleware";

interface MyBookState{ //définit la forme du store zustand
    myBooks: Book[]; //tableau de livres
    addBook: (book:Book) => void;// fonction qui ajoute un livre au tableau
    removeBook: (book: Book) => void; //fonction qui supprime un livre au tableau 
}

export const useMyBooksStore = create<MyBookState>()(
    persist(//middleware qui permettra de sauvegardé les livres ajoutés dans le navigateur pour qu'ils restent sur la page lors d'un chargement de page.
        (set)=> ({ //crée le store zustand avec l'état inital et les actions
    myBooks: [],//état initial, la biblio est vide
    addBook: (book) => set ((state) => ({// la fonction set permet de mettre àjour l'état du store et state retourne le nouvel état. Ici, on ajoute le livre au tableau myBooks, et Zustand met à jour le store avec ce nouveau tableau
        myBooks: [...state.myBooks, book] // addbook: ajoute un livre à la biblio en créant un nouveau tableau avec le livre ajouté
    })),
    removeBook: (bookToRemove) => set((state) => ({
    myBooks: state.myBooks.filter(book => 
    (book.id || book.isbn) !== (bookToRemove.id || bookToRemove.isbn)
    )
})),
}),
    {
        name:"my-books-storage", // nom de la clé dans localstorage

    }   
    )
);