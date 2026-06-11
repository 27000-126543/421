import { create } from 'zustand';
import type { MarketItem, Transaction } from '../../shared/types';

interface CartItem {
  item: MarketItem;
  quantity: number;
}

interface MarketState {
  items: MarketItem[];
  cart: CartItem[];
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  setItems: (items: MarketItem[]) => void;
  addItem: (item: MarketItem) => void;
  updateItem: (id: string, updates: Partial<MarketItem>) => void;
  removeItem: (id: string) => void;
  addToCart: (item: MarketItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  items: [],
  cart: [],
  transactions: [],
  isLoading: false,
  error: null,

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

  setTransactions: (transactions) => set({ transactions }),

  addTransaction: (transaction) => {
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    }));
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),
}));
