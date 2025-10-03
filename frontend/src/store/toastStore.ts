// src/store/toastStore.ts
import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  // eslint-disable-next-line no-unused-vars
  addToast: (toast: Omit<Toast, 'id'>) => string;
  // eslint-disable-next-line no-unused-vars
  removeToast: (id: string) => void;
  // eslint-disable-next-line no-unused-vars
  success: (message: string, duration?: number) => string;
  // eslint-disable-next-line no-unused-vars
  error: (message: string, duration?: number) => string;
  // eslint-disable-next-line no-unused-vars
  warning: (message: string, duration?: number) => string;
  // eslint-disable-next-line no-unused-vars
  info: (message: string, duration?: number) => string;
}

let toastIdCounter = 0;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${toastIdCounter++}`;
    const newToast: Toast = {
      id,
      duration: 4000,
      ...toast,
    };

    console.log('🍞 Toast créé:', id, 'durée:', newToast.duration);

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto-remove après la durée spécifiée
    if (newToast.duration && newToast.duration > 0) {
      console.log(
        '⏰ setTimeout configuré pour:',
        id,
        'dans',
        newToast.duration,
        'ms'
      );

      setTimeout(() => {
        console.log('⏰ setTimeout exécuté pour:', id);
        set((state) => {
          console.log('🗑️ Suppression du toast:', id);
          console.log(
            'Toasts avant:',
            state.toasts.map((t) => t.id)
          );
          const newToasts = state.toasts.filter((t) => t.id !== id);
          console.log(
            'Toasts après:',
            newToasts.map((t) => t.id)
          );
          return { toasts: newToasts };
        });
      }, newToast.duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  success: (message, duration = 4000) => {
    return get().addToast({ message, type: 'success', duration });
  },

  error: (message, duration = 4000) => {
    return get().addToast({ message, type: 'error', duration });
  },

  warning: (message, duration = 4000) => {
    return get().addToast({ message, type: 'warning', duration });
  },

  info: (message, duration = 4000) => {
    return get().addToast({ message, type: 'info', duration });
  },
}));
