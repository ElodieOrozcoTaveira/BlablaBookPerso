import { create } from 'zustand';

interface Book {
  id_book: number;
  title: string;
  authors: string;
  cover_url?: string;
  isbn?: string;
  publication_year?: number;
  description?: string;
  reading_status: 'to_read' | 'reading' | 'read' | 'abandoned';
  added_at: string;
  started_at?: string;
  finished_at?: string;
}

interface ListDetail {
  id_library: number;
  name: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  books: Book[];
  total_books: number;
  books_read: number;
  books_reading: number;
  books_to_read: number;
}

interface ListDetailState {
  // État
  currentList: ListDetail | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  // eslint-disable-next-line no-unused-vars
  fetchListDetail: (listId: number) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  removeBookFromList: (bookId: number) => Promise<boolean>;
  updateBookStatus: (
    // eslint-disable-next-line no-unused-vars
    bookId: number,
    // eslint-disable-next-line no-unused-vars
    status: Book['reading_status']
  ) => Promise<boolean>;
  // eslint-disable-next-line no-unused-vars
  addBookToList: (listId: number, book: any) => Promise<boolean>;
  // eslint-disable-next-line no-unused-vars
  addBookToExistingList: (listId: number, book: any) => Promise<boolean>;
  clearCurrentList: () => void;
}

// Données de démonstration - livres par liste
const mockBooksData: Record<number, Book[]> = {
  1: [
    // Mes coups de cœur
    {
      id_book: 1,
      title: "L'Étranger",
      authors: 'Albert Camus',
      cover_url: 'https://picsum.photos/200/300?random=1',
      publication_year: 1942,
      description: "Un chef-d'œuvre de la littérature française",
      reading_status: 'read',
      added_at: '2024-01-16T10:00:00Z',
      finished_at: '2024-01-20T15:30:00Z',
    },
    {
      id_book: 2,
      title: 'Le Petit Prince',
      authors: 'Antoine de Saint-Exupéry',
      cover_url: 'https://picsum.photos/200/300?random=2',
      publication_year: 1943,
      description: 'Une fable poétique et philosophique',
      reading_status: 'read',
      added_at: '2024-01-18T14:00:00Z',
      finished_at: '2024-01-22T12:00:00Z',
    },
    {
      id_book: 3,
      title: 'Madame Bovary',
      authors: 'Gustave Flaubert',
      cover_url: 'https://picsum.photos/200/300?random=3',
      publication_year: 1857,
      description: 'Un classique du réalisme français',
      reading_status: 'reading',
      added_at: '2024-01-25T09:00:00Z',
      started_at: '2024-01-26T08:00:00Z',
    },
  ],
  2: [
    // Classiques à lire
    {
      id_book: 4,
      title: 'Les Misérables',
      authors: 'Victor Hugo',
      cover_url: 'https://picsum.photos/200/300?random=4',
      publication_year: 1862,
      description: "L'épopée de Jean Valjean",
      reading_status: 'to_read',
      added_at: '2024-02-02T11:00:00Z',
    },
    {
      id_book: 5,
      title: 'Crime et Châtiment',
      authors: 'Fiodor Dostoïevski',
      cover_url: 'https://picsum.photos/200/300?random=5',
      publication_year: 1866,
      description: "Un thriller psychologique avant l'heure",
      reading_status: 'to_read',
      added_at: '2024-02-03T16:00:00Z',
    },
    {
      id_book: 6,
      title: '1984',
      authors: 'George Orwell',
      cover_url: 'https://picsum.photos/200/300?random=6',
      publication_year: 1949,
      description: 'Dystopie totalitaire prophétique',
      reading_status: 'reading',
      added_at: '2024-02-05T13:00:00Z',
      started_at: '2024-02-06T19:00:00Z',
    },
  ],
  3: [
    // Science-Fiction moderne
    {
      id_book: 7,
      title: 'Klara et le Soleil',
      authors: 'Kazuo Ishiguro',
      cover_url: 'https://picsum.photos/200/300?random=7',
      publication_year: 2021,
      description: 'IA et humanité par un maître du genre',
      reading_status: 'read',
      added_at: '2024-02-11T10:00:00Z',
      finished_at: '2024-02-15T20:00:00Z',
    },
    {
      id_book: 8,
      title: 'Le Problème à trois corps',
      authors: 'Liu Cixin',
      cover_url: 'https://picsum.photos/200/300?random=8',
      publication_year: 2006,
      description: 'Science-fiction chinoise révolutionnaire',
      reading_status: 'to_read',
      added_at: '2024-02-12T14:00:00Z',
    },
  ],
  4: [
    // Romans d'été
    {
      id_book: 9,
      title: "L'Été où tout a changé",
      authors: 'Jenny Han',
      cover_url: 'https://picsum.photos/200/300?random=9',
      publication_year: 2009,
      description: 'Romance estivale touchante',
      reading_status: 'read',
      added_at: '2024-03-06T15:00:00Z',
      finished_at: '2024-03-08T22:00:00Z',
    },
  ],
  5: [
    // Fantasy épique
    {
      id_book: 10,
      title: 'Le Nom du vent',
      authors: 'Patrick Rothfuss',
      cover_url: 'https://picsum.photos/200/300?random=10',
      publication_year: 2007,
      description: 'Premier tome de la Chronique du Tueur de Roi',
      reading_status: 'abandoned',
      added_at: '2024-03-13T12:00:00Z',
      started_at: '2024-03-14T10:00:00Z',
    },
    {
      id_book: 11,
      title: "L'Assassin royal",
      authors: 'Robin Hobb',
      cover_url: 'https://picsum.photos/200/300?random=11',
      publication_year: 1995,
      description: 'Fantasy française de qualité',
      reading_status: 'reading',
      added_at: '2024-03-14T16:00:00Z',
      started_at: '2024-03-15T08:00:00Z',
    },
  ],
};

function calculateStats(books: Book[]) {
  return {
    total_books: books.length,
    books_read: books.filter((b) => b.reading_status === 'read').length,
    books_reading: books.filter((b) => b.reading_status === 'reading').length,
    books_to_read: books.filter((b) => b.reading_status === 'to_read').length,
  };
}

export const useListDetailStore = create<ListDetailState>((set, get) => ({
  // État initial
  currentList: null,
  isLoading: false,
  error: null,

  // 📚 RÉCUPÉRER DÉTAILS D'UNE LISTE
  fetchListDetail: async (listId: number) => {
    set({ isLoading: true, error: null });

    // Simulation délai réseau
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Récupérer les infos de la liste depuis le store des listes
    const listsStore = (window as any).__LISTS_STORE_DATA || [];
    let listInfo = listsStore.find((list: any) => list.id_library === listId);

    if (!listInfo) {
      // Données par défaut si pas trouvé
      const defaultLists = [
        {
          id_library: 1,
          name: 'Mes coups de cœur',
          description: "Les livres qui m'ont marqué cette année",
          is_public: false,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
        {
          id_library: 2,
          name: 'Classiques à lire',
          description: 'Les grands classiques de la littérature',
          is_public: true,
          created_at: '2024-02-01T14:30:00Z',
          updated_at: '2024-02-01T14:30:00Z',
        },
        {
          id_library: 3,
          name: 'Science-Fiction moderne',
          description: 'Les dernières pépites du genre',
          is_public: false,
          created_at: '2024-02-10T09:15:00Z',
          updated_at: '2024-02-10T09:15:00Z',
        },
        {
          id_library: 4,
          name: "Romans d'été",
          description: 'Lectures légères pour les vacances',
          is_public: false,
          created_at: '2024-03-05T16:45:00Z',
          updated_at: '2024-03-05T16:45:00Z',
        },
        {
          id_library: 5,
          name: 'Fantasy épique',
          description: 'Aventures dans des mondes imaginaires',
          is_public: true,
          created_at: '2024-03-12T11:20:00Z',
          updated_at: '2024-03-12T11:20:00Z',
        },
      ];
      listInfo = defaultLists.find((list) => list.id_library === listId);

      if (!listInfo) {
        set({ error: 'Liste non trouvée', isLoading: false });
        return;
      }
    }

    const books = mockBooksData[listId] || [];
    const stats = calculateStats(books);

    const listDetail: ListDetail = {
      ...listInfo,
      books,
      ...stats,
    };

    set({
      currentList: listDetail,
      isLoading: false,
      error: null,
    });
  },

  // ❌ SUPPRIMER UN LIVRE DE LA LISTE
  removeBookFromList: async (bookId: number): Promise<boolean> => {
    const currentList = get().currentList;
    if (!currentList) return false;

    set({ isLoading: true, error: null });

    // Simulation délai réseau
    await new Promise((resolve) => setTimeout(resolve, 300));

    const updatedBooks = currentList.books.filter(
      (book) => book.id_book !== bookId
    );
    const stats = calculateStats(updatedBooks);

    set({
      currentList: {
        ...currentList,
        books: updatedBooks,
        ...stats,
      },
      isLoading: false,
      error: null,
    });

    return true;
  },

  // ✏️ METTRE À JOUR STATUT DE LECTURE
  updateBookStatus: async (
    bookId: number,
    status: Book['reading_status']
  ): Promise<boolean> => {
    const currentList = get().currentList;
    if (!currentList) return false;

    set({ isLoading: true, error: null });

    // Simulation délai réseau
    await new Promise((resolve) => setTimeout(resolve, 400));

    const updatedBooks = currentList.books.map((book) =>
      book.id_book === bookId
        ? {
            ...book,
            reading_status: status,
            started_at:
              status === 'reading' ? new Date().toISOString() : book.started_at,
            finished_at:
              status === 'read' ? new Date().toISOString() : undefined,
          }
        : book
    );

    const stats = calculateStats(updatedBooks);

    set({
      currentList: {
        ...currentList,
        books: updatedBooks,
        ...stats,
      },
      isLoading: false,
      error: null,
    });

    return true;
  },

  // ➕ AJOUTER UN LIVRE À UNE LISTE EXISTANTE (nouvelle fonction)
  addBookToExistingList: async (
    listId: number,
    book: any
  ): Promise<boolean> => {
    // Simulation délai réseau
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Convertir le book au format attendu
    const newBook: Book = {
      id_book: book.id || book.isbn || book.open_library_key || Date.now(),
      title: book.title || 'Titre non disponible',
      authors: book.authors || 'Auteur inconnu',
      cover_url: book.cover_url,
      isbn: book.isbn,
      publication_year: book.publication_year,
      description: book.description,
      reading_status: 'to_read',
      added_at: new Date().toISOString(),
    };

    // Ajouter le livre aux données mockées pour cette liste
    if (!mockBooksData[listId]) {
      mockBooksData[listId] = [];
    }

    // Vérifier si le livre n'existe pas déjà
    const existingBook = mockBooksData[listId].find(
      (b) =>
        b.id_book === newBook.id_book || (b.isbn && b.isbn === newBook.isbn)
    );

    if (existingBook) {
      return false; // Livre déjà dans la liste
    }

    mockBooksData[listId].push(newBook);

    // Mettre à jour la liste actuelle si c'est celle affichée
    const currentList = get().currentList;
    if (currentList && currentList.id_library === listId) {
      const updatedBooks = [...currentList.books, newBook];
      const stats = calculateStats(updatedBooks);

      set({
        currentList: {
          ...currentList,
          books: updatedBooks,
          ...stats,
        },
      });
    }

    return true;
  },

  // 🧹 NETTOYER
  clearCurrentList: () => set({ currentList: null, error: null }),

  // ➕ FONCTION GLOBALE pour ajouter un livre à n'importe quelle liste (pour le modal)
  addBookToList: async (listId: number, book: any): Promise<boolean> => {
    return get().addBookToExistingList(listId, book);
  },
}));
