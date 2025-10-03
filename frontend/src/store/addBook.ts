import { create } from 'zustand';
import type { Book } from '../Types/Books';
import { persist } from 'zustand/middleware';

interface MyBookState {
  //définit la forme du store zustand
  myBooks: Book[]; //tableau de livres
  // eslint-disable-next-line no-unused-vars
  addBook: (book: Book) => void; // fonction qui ajoute un livre au tableau
  // eslint-disable-next-line no-unused-vars
  removeBook: (book: Book) => void; //fonction qui supprime un livre au tableau
  // eslint-disable-next-line no-unused-vars
  toggleRead: (id: string) => void; //fonction pour changer le statut lu/à lire
}

export const useMyBooksStore = create<MyBookState>()(
  persist(
    //middleware qui permettra de sauvegardé les livres ajoutés dans le navigateur pour qu'ils restent sur la page lors d'un chargement de page.
    (set) => ({
      //crée le store zustand avec l'état inital et les actions
      myBooks: [],
      addBook: (book) =>
        set((state) => ({
          myBooks: [
            ...state.myBooks,
            {
              ...book,
              id:
                book.id ||
                book.isbn ||
                book.open_library_key ||
                Date.now().toString(),
            },
          ],
        })),

      removeBook: (book) =>
        set((state) => ({
          myBooks: state.myBooks.filter((b) => b.id !== book.id),
        })),
      toggleRead: (id) =>
        set((state) => ({
          myBooks: state.myBooks.map((b) =>
            b.id === id ? { ...b, read: !b.read } : b
          ),
        })),
    }),
    { name: 'my-books-storage' }
  )
);
