import { create } from 'zustand';

interface ReadingList {
  id_library: number;
  name: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface MyListsState {
  // État
  lists: ReadingList[];
  isLoading: boolean;
  error: string | null;

  // Actions API (simulées)
  fetchMyLists: () => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  createList: (name: string, description?: string) => Promise<boolean>;
  // eslint-disable-next-line no-unused-vars
  deleteList: (listId: number) => Promise<boolean>;

  // Actions locales
  clearLists: () => void;
  // eslint-disable-next-line no-unused-vars
  setError: (error: string | null) => void;
}

// Données de démonstration
const initialLists: ReadingList[] = [
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

export const useMyListsStore = create<MyListsState>((set, get) => ({
  // État initial
  lists: [],
  isLoading: false,
  error: null,

  // 📚 RÉCUPÉRER MES LISTES (simulation)
  fetchMyLists: async () => {
    set({ isLoading: true, error: null });

    // Simulation d'un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 800));

    set({
      lists: initialLists,
      isLoading: false,
      error: null,
    });
  },

  // ➕ CRÉER UNE NOUVELLE LISTE (simulation)
  createList: async (name: string, description?: string): Promise<boolean> => {
    set({ isLoading: true, error: null });

    // Simulation d'un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Générer un nouvel ID
    const currentLists = get().lists;
    const maxId = Math.max(...currentLists.map((list) => list.id_library), 0);

    const newList: ReadingList = {
      id_library: maxId + 1,
      name,
      description: description || '',
      is_public: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    set((state) => ({
      lists: [...state.lists, newList],
      isLoading: false,
      error: null,
    }));

    return true;
  },

  // ❌ SUPPRIMER UNE LISTE (simulation)
  deleteList: async (listId: number): Promise<boolean> => {
    set({ isLoading: true, error: null });

    // Simulation d'un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 300));

    set((state) => ({
      lists: state.lists.filter((list) => list.id_library !== listId),
      isLoading: false,
      error: null,
    }));

    return true;
  },

  // 🧹 ACTIONS LOCALES
  clearLists: () => set({ lists: [], error: null }),

  setError: (error: string | null) => set({ error }),
}));
