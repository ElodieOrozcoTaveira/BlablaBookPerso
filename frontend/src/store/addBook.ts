import { create } from "zustand";
import type { Book } from "../Types/Books";
import { persist } from "zustand/middleware";
import { booksApi } from "../api/booksApi";

interface MyBookState {
  //définit la forme du store zustand
  myBooks: Book[]; //tableau de livres
  // eslint-disable-next-line no-unused-vars
  addBook: (book: Book) => void; // fonction qui ajoute un livre au tableau
  // eslint-disable-next-line no-unused-vars
  removeBook: (book: Book) => void; //fonction qui supprime un livre du tableau LOCAL seulement (pas de la BDD)
  // eslint-disable-next-line no-unused-vars
  toggleRead: (id: string) => void; //fonction pour changer le statut lu/à lire
  // Nouvelle fonction pour charger depuis l'API
  loadBooksFromAPI: () => Promise<void>;
}

export const useMyBooksStore = create<MyBookState>()(
  persist(
    //middleware qui permettra de sauvegardé les livres ajoutés dans le navigateur pour qu'ils restent sur la page lors d'un chargement de page.
    (set) => ({
      //crée le store zustand avec l'état inital et les actions
      myBooks: [],
      addBook: (book) => {
        console.log("📚 Ajout du livre au store local:", book);
        set((state) => {
          const newBook = {
            ...book,
            id:
              book.id ||
              book.isbn ||
              book.open_library_key ||
              Date.now().toString(),
          };
          const newBooks = [...state.myBooks, newBook];
          console.log("📊 Nouveau state myBooks:", newBooks);
          console.log("📈 Nombre total de livres:", newBooks.length);
          return { myBooks: newBooks };
        });
      },

      removeBook: (book) => {
        console.log("🗑️ Suppression locale du livre:", book.title);
        console.log(
          "ℹ️ Note: Le livre reste en base de données et reviendra au prochain chargement"
        );

        // Suppression locale uniquement - le livre reste en BDD
        set((state) => ({
          myBooks: state.myBooks.filter((b) => b.id !== book.id),
        }));
      },
      toggleRead: (id) =>
        set((state) => ({
          myBooks: state.myBooks.map((b) =>
            b.id === id ? { ...b, read: !b.read } : b
          ),
        })),

      // Charger les livres depuis l'API
      loadBooksFromAPI: async () => {
        try {
          console.log("🔄 Chargement des livres depuis l'API...");
          const response = await booksApi.getUserLibrary();
          console.log("✅ Réponse de l'API getUserLibrary:", response);
          console.log("📊 Données reçues:", response.data);
          console.log("📈 Nombre de livres reçus:", response.data?.length || 0);

          if (!response.data || response.data.length === 0) {
            console.log("📭 Aucun livre trouvé dans l'API");
            return;
          }

          // Mapper les données de l'API au format Book
          const mappedBooks: Book[] = response.data.map((apiBook: any) => {
            console.log("🔄 Mapping livre:", apiBook);
            return {
              id: apiBook.id?.toString() || apiBook.openLibraryId,
              title: apiBook.title,
              authors: apiBook.authors || "Auteur inconnu",
              cover_url:
                apiBook.cover_url ||
                apiBook.coverUrl ||
                "/book-placeholder.svg",
              publication_year:
                apiBook.publication_year || apiBook.publishYear || 2024,
              isbn: apiBook.isbn || apiBook.isbn13 || "",
              description: apiBook.description,
              open_library_key:
                apiBook.open_library_key || apiBook.openLibraryId,
              read: apiBook.read || false,
            };
          });

          console.log("📚 Livres mappés:", mappedBooks);

          // Remplacer complètement les livres par ceux de l'API
          set({ myBooks: mappedBooks });
          console.log("✅ Store mis à jour avec", mappedBooks.length, "livres");
        } catch (error: any) {
          console.error("❌ Erreur lors du chargement des livres:", error);
          console.error(
            "🔍 Détails de l'erreur:",
            error.response?.data || error.message
          );

          // Si l'erreur est 401 (non authentifié), ne pas essayer de charger
          if (error.response?.status === 401) {
            console.log(
              "🔐 Utilisateur non authentifié - pas de chargement depuis l'API"
            );
            return;
          }

          // En cas d'autre erreur, garder les livres locaux
        }
      },
    }),
    { name: "my-books-storage" }
  )
);
