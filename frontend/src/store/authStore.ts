/* eslint-disable no-unused-vars */
// src/store/authStore.ts
import { create } from "zustand";
import axios from "axios"; // 👈 AJOUT D'AXIOS

interface User {
  id: number;
  email: string;
  username: string;
  firstname?: string; // 👈 AJOUT pour le Header
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,

  checkAuth: async (): Promise<void> => {
    set({ isLoading: true });
    try {
      const response = await axios.get("/api/auth/check-session", {
        withCredentials: true,
      });

      set({
        user:
          response.data.success && response.data.authenticated
            ? response.data.user
            : null,
        isLoading: false,
      });
    } catch (error) {
      console.error("Erreur vérification auth:", error);
      set({ user: null, isLoading: false });
    }
  },

  login: async (email: string, password: string): Promise<boolean> => {
    set({ isLoading: true });
    try {
      const response = await axios.post(
        "/api/auth/login",
        { email, password },
        { withCredentials: true }
      );

      set({
        user: response.data.success ? response.data.user : null,
        isLoading: false,
      });
      return response.data.success;
    } catch (error) {
      console.error("Erreur connexion:", error);
      set({ isLoading: false });
      return false;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await axios.post(
        "/api/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error("Erreur déconnexion:", error);
    } finally {
      set({ user: null });
    }
  },
}));
