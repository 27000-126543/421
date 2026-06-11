import { create } from 'zustand';
import type { Dream, VisitorData, RandomEvent } from '../../shared/types';

interface DreamState {
  dreams: Dream[];
  currentDream: Dream | null;
  visitors: VisitorData[];
  randomEvents: RandomEvent[];
  isLoading: boolean;
  error: string | null;
  setDreams: (dreams: Dream[]) => void;
  setCurrentDream: (dream: Dream | null) => void;
  addDream: (dream: Dream) => void;
  updateDream: (id: string, updates: Partial<Dream>) => void;
  removeDream: (id: string) => void;
  setVisitors: (visitors: VisitorData[]) => void;
  addVisitor: (visitor: VisitorData) => void;
  updateVisitor: (id: string, updates: Partial<VisitorData>) => void;
  removeVisitor: (id: string) => void;
  setRandomEvents: (events: RandomEvent[]) => void;
  addRandomEvent: (event: RandomEvent) => void;
  updateRandomEvent: (id: string, updates: Partial<RandomEvent>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useDreamStore = create<DreamState>((set, get) => ({
  dreams: [],
  currentDream: null,
  visitors: [],
  randomEvents: [],
  isLoading: false,
  error: null,

  setDreams: (dreams) => set({ dreams }),

  setCurrentDream: (dream) => set({ currentDream: dream }),

  addDream: (dream) => {
    set((state) => ({
      dreams: [dream, ...state.dreams],
    }));
  },

  updateDream: (id, updates) => {
    set((state) => ({
      dreams: state.dreams.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
      currentDream:
        state.currentDream?.id === id
          ? { ...state.currentDream, ...updates }
          : state.currentDream,
    }));
  },

  removeDream: (id) => {
    set((state) => ({
      dreams: state.dreams.filter((d) => d.id !== id),
      currentDream: state.currentDream?.id === id ? null : state.currentDream,
    }));
  },

  setVisitors: (visitors) => set({ visitors }),

  addVisitor: (visitor) => {
    set((state) => ({
      visitors: [visitor, ...state.visitors],
    }));
  },

  updateVisitor: (id, updates) => {
    set((state) => ({
      visitors: state.visitors.map((v) =>
        v.id === id ? { ...v, ...updates } : v
      ),
    }));
  },

  removeVisitor: (id) => {
    set((state) => ({
      visitors: state.visitors.filter((v) => v.id !== id),
    }));
  },

  setRandomEvents: (events) => set({ randomEvents: events }),

  addRandomEvent: (event) => {
    set((state) => ({
      randomEvents: [event, ...state.randomEvents],
    }));
  },

  updateRandomEvent: (id, updates) => {
    set((state) => ({
      randomEvents: state.randomEvents.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    }));
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),
}));
