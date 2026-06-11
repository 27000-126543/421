import { create } from 'zustand';
import type { Battle, MatchResult, BattleSkill } from '../../shared/types';

interface ArenaState {
  isMatching: boolean;
  matchResult: MatchResult | null;
  currentBattle: Battle | null;
  skillCooldowns: Record<string, number>;
  matchHistory: Battle[];
  isLoading: boolean;
  error: string | null;
  startMatching: () => void;
  stopMatching: () => void;
  setMatchResult: (result: MatchResult | null) => void;
  setCurrentBattle: (battle: Battle | null) => void;
  updateBattle: (updates: Partial<Battle>) => void;
  useSkill: (skillId: string, skill: BattleSkill) => void;
  updateSkillCooldown: (skillId: string, cooldown: number) => void;
  decrementCooldowns: () => void;
  addToMatchHistory: (battle: Battle) => void;
  reset: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useArenaStore = create<ArenaState>((set, get) => ({
  isMatching: false,
  matchResult: null,
  currentBattle: null,
  skillCooldowns: {},
  matchHistory: [],
  isLoading: false,
  error: null,

  startMatching: () => {
    set({
      isMatching: true,
      matchResult: null,
      error: null,
    });
  },

  stopMatching: () => {
    set({
      isMatching: false,
      matchResult: null,
    });
  },

  setMatchResult: (result) => set({ matchResult: result }),

  setCurrentBattle: (battle) => {
    const cooldowns: Record<string, number> = {};
    if (battle) {
      battle.player1Skills.forEach((skill) => {
        cooldowns[skill.id] = skill.currentCooldown;
      });
    }
    set({
      currentBattle: battle,
      skillCooldowns: cooldowns,
      isMatching: false,
    });
  },

  updateBattle: (updates) => {
    const { currentBattle } = get();
    if (currentBattle) {
      set({
        currentBattle: { ...currentBattle, ...updates },
      });
    }
  },

  useSkill: (skillId, skill) => {
    set((state) => ({
      skillCooldowns: {
        ...state.skillCooldowns,
        [skillId]: skill.cooldown,
      },
    }));
  },

  updateSkillCooldown: (skillId, cooldown) => {
    set((state) => ({
      skillCooldowns: {
        ...state.skillCooldowns,
        [skillId]: cooldown,
      },
    }));
  },

  decrementCooldowns: () => {
    set((state) => {
      const newCooldowns: Record<string, number> = {};
      Object.entries(state.skillCooldowns).forEach(([id, cd]) => {
        newCooldowns[id] = Math.max(0, cd - 1);
      });
      return { skillCooldowns: newCooldowns };
    });
  },

  addToMatchHistory: (battle) => {
    set((state) => ({
      matchHistory: [battle, ...state.matchHistory].slice(0, 20),
    }));
  },

  reset: () => {
    set({
      isMatching: false,
      matchResult: null,
      currentBattle: null,
      skillCooldowns: {},
      error: null,
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),
}));
