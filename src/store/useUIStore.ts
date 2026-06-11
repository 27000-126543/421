import { create } from 'zustand';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  content?: string;
  duration?: number;
}

interface Modal {
  id: string;
  type: string;
  props?: Record<string, unknown>;
}

interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  modals: Modal[];
  toasts: Toast[];
  isGlobalLoading: boolean;
  currentPage: string;
  init: () => void;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openModal: (type: string, props?: Record<string, unknown>) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  showToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  setGlobalLoading: (loading: boolean) => void;
  setCurrentPage: (page: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useUIStore = create<UIState>((set, get) => ({
  theme: 'dark',
  sidebarOpen: true,
  modals: [],
  toasts: [],
  isGlobalLoading: false,
  currentPage: 'home',

  init: () => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      set({ theme: savedTheme });
    }
    const savedSidebar = localStorage.getItem('sidebarOpen');
    if (savedSidebar !== null) {
      set({ sidebarOpen: savedSidebar === 'true' });
    }
  },

  toggleTheme: () => {
    set((state) => ({
      theme: state.theme === 'dark' ? 'light' : 'dark',
    }));
  },

  setTheme: (theme) => set({ theme }),

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  openModal: (type, props) => {
    const id = generateId();
    set((state) => ({
      modals: [...state.modals, { id, type, props }],
    }));
    return id;
  },

  closeModal: (id) => {
    set((state) => ({
      modals: state.modals.filter((m) => m.id !== id),
    }));
  },

  closeAllModals: () => set({ modals: [] }),

  showToast: (toast) => {
    const id = generateId();
    const duration = toast.duration ?? 3000;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearToasts: () => set({ toasts: [] }),

  setGlobalLoading: (loading) => set({ isGlobalLoading: loading }),

  setCurrentPage: (page) => set({ currentPage: page }),
}));
