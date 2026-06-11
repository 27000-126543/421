import { create } from 'zustand';
import type { MarketItem, Transaction } from '../../shared/types';
import { endpoints } from '../api/endpoints';

interface CartItem {
  item: MarketItem;
  quantity: number;
}

interface MarketState {
  items: MarketItem[];
  totalItems: number;
  cart: CartItem[];
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  activeEvents: any[];
  fetchItems: (params?: any) => Promise<void>;
  setItems: (items: MarketItem[]) => void;
  addItem: (item: MarketItem) => void;
  updateItem: (id: string, updates: Partial<MarketItem>) => void;
  removeItem: (id: string) => void;
  addToCart: (item: MarketItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  buyItem: (itemId: string, buyerId: string) => Promise<any>;
  publishItem: (data: any) => Promise<any>;
  getPriceSuggestion: (type: string, rarity: string) => Promise<any>;
  fetchTransactions: (params?: any) => Promise<void>;
  fetchActiveEvents: () => Promise<void>;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  items: [],
  totalItems: 0,
  cart: [],
  transactions: [],
  isLoading: false,
  error: null,
  activeEvents: [],

  fetchItems: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const data = await endpoints.market.listItems(params);
      set({
        items: data.items || [],
        totalItems: data.total || 0,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err?.data?.error || err.message || '获取商品列表失败',
        isLoading: false,
      });
    }
  },

  setItems: (items) => set({ items }),

  addItem: (item) => {
    set((state) => ({
      items: [item, ...state.items],
    }));
  },

  updateItem: (id, updates) => {
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, ...updates } : i
      ),
    }));
  },

  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    }));
  },

  addToCart: (item) => {
    set((state) => {
      const existing = state.cart.find((c) => c.item.id === item.id);
      if (existing) {
        return {
          cart: state.cart.map((c) =>
            c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
          ),
        };
      }
      return {
        cart: [...state.cart, { item, quantity: 1 }],
      };
    });
  },

  removeFromCart: (itemId) => {
    set((state) => ({
      cart: state.cart.filter((c) => c.item.id !== itemId),
    }));
  },

  updateCartQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(itemId);
      return;
    }
    set((state) => ({
      cart: state.cart.map((c) =>
        c.item.id === itemId ? { ...c, quantity } : c
      ),
    }));
  },

  clearCart: () => set({ cart: [] }),

  getCartTotal: () => {
    const { cart } = get();
    return cart.reduce((total, c) => total + c.item.price * c.quantity, 0);
  },

  buyItem: async (itemId: string, buyerId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await endpoints.market.buyItem(itemId, { buyerId });
      if (data.item) {
        get().updateItem(itemId, data.item);
      }
      if (data.transaction) {
        get().addTransaction(data.transaction);
      }
      set({
        isLoading: false,
      });
      return data;
    } catch (err: any) {
      set({
        error: err?.data?.error || err.message || '购买失败',
        isLoading: false,
      });
      throw err;
    }
  },

  publishItem: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await endpoints.market.publishItem(data);
      if (result.item) {
        get().addItem(result.item);
      }
      set({ isLoading: false });
      return result;
    } catch (err: any) {
      set({
        error: err?.data?.error || err.message || '发布失败',
        isLoading: false,
      });
      throw err;
    }
  },

  getPriceSuggestion: async (type: string, rarity: string) => {
    try {
      return await endpoints.market.getPriceSuggestion({ type, rarity });
    } catch (err: any) {
      set({ error: err?.data?.error || err.message });
      return null;
    }
  },

  fetchTransactions: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const data = await endpoints.market.getTransactions(params);
      set({
        transactions: data.transactions || [],
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err?.data?.error || err.message || '获取交易记录失败',
        isLoading: false,
      });
    }
  },

  fetchActiveEvents: async () => {
    try {
      const events = await endpoints.market.getActiveEvents();
      set({ activeEvents: events || [] });
    } catch (err: any) {
      set({ error: err?.data?.error || err.message });
    }
  },

  setTransactions: (transactions) => set({ transactions }),

  addTransaction: (transaction) => {
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    }));
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),
}));
