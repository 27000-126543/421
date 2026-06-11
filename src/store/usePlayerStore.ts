import { create } from 'zustand';
import type { Player, Notification } from '../../shared/types';
import { endpoints } from '../api/endpoints';

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
  fetchProfile: (playerId: string) => Promise<void>;
  fetchNotifications: (playerId: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (playerId: string, id: string) => Promise<void>;
  markAllNotificationsRead: (playerId: string) => Promise<void>;
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

  fetchProfile: async (playerId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await endpoints.player.getProfile(playerId);
      set({
        currentPlayer: data.player,
        notifications: data.notifications || [],
        unreadCount: (data.notifications || []).filter((n: Notification) => !n.isRead).length,
        isLoading: false,
        isLoggedIn: true,
      });
    } catch (err: any) {
      set({
        error: err?.data?.error || err.message || '获取资料失败',
        isLoading: false,
      });
    }
  },

  fetchNotifications: async (playerId: string) => {
    try {
      const data = await endpoints.player.getNotifications(playerId);
      set({
        notifications: data.notifications || [],
        unreadCount: data.unreadCount || 0,
      });
    } catch (err: any) {
      set({ error: err?.data?.error || err.message });
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1,
    }));
  },

  markNotificationRead: async (playerId: string, id: string) => {
    try {
      await endpoints.player.markNotificationRead(playerId, id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: state.unreadCount > 0 ? state.unreadCount - 1 : 0,
      }));
    } catch (err: any) {
      set({ error: err?.data?.error || err.message });
    }
  },

  markAllNotificationsRead: async (playerId: string) => {
    try {
      await endpoints.player.markAllNotificationsRead(playerId);
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (err: any) {
      set({ error: err?.data?.error || err.message });
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),
}));
