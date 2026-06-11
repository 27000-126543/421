import { create } from 'zustand';
import type { Player, Notification } from '../../shared/types';

interface PlayerState {
  currentPlayer: Player | null;
  isLoggedIn: boolean;
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  login: (player: Player) => void;
  logout: () => void;
  updatePlayer: (updates: Partial<Player>) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentPlayer: null,
  isLoggedIn: false,
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  login: (player) => {
    set({
      currentPlayer: player,
      isLoggedIn: true,
      error: null,
    });
  },

  logout: () => {
    set({
      currentPlayer: null,
      isLoggedIn: false,
      notifications: [],
      unreadCount: 0,
    });
  },

  updatePlayer: (updates) => {
    const { currentPlayer } = get();
    if (currentPlayer) {
      set({
        currentPlayer: { ...currentPlayer, ...updates },
      });
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1,
    }));
  },

  markNotificationRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: state.unreadCount > 0 ? state.unreadCount - 1 : 0,
    }));
  },

  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),
}));
