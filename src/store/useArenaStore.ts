import { create } from 'zustand';
import type { Battle, MatchResult, BattleSkill } from '../../shared/types';
import { endpoints } from '../api/endpoints';

interface ArenaState {
  isMatching: boolean;
  matchId: string | null;
  matchResult: MatchResult | null;
  currentBattle: Battle | null;
  skillCooldowns: Record<string, number>;
  matchHistory: Battle[];
  isLoading: boolean;
  error: string | null;
  startMatching: (playerId: string, dreamId: string) => Promise<boolean>;
  stopMatching: () => Promise<void>;
  checkMatchStatus: () => Promise<MatchResult | null>;
  setMatchResult: (result: MatchResult | null) => void;
  setCurrentBattle: (battle: Battle | null) => void;
  updateBattle: (updates: Partial<Battle>) => void;
  useSkill: (battleId: string, playerId: string, skillId: string) => Promise<void>;
  fetchBattle: (battleId: string) => Promise<Battle | null>;
  updateSkillCooldown: (skillId: string, cooldown: number) => void;
  decrementCooldowns: () => void;
  addToMatchHistory: (battle: Battle) => void;
  reset: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useArenaStore = create<ArenaState>((set, get) => ({
  isMatching: false,
  matchId: null,
  matchResult: null,
  currentBattle: null,
  skillCooldowns: {},
  matchHistory: [],
  isLoading: false,
  error: null,

  startMatching: async (playerId: string, dreamId: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await endpoints.arena.startMatching({ playerId, dreamId });
      set({
        isMatching: result.status === 'matching',
        matchId: result.matchId,
        matchResult: result,
        isLoading: false,
      });
      return result.status === 'success';
    } catch (err: any) {
      set({
        error: err?.data?.error || err.message || '匹配失败',
        isLoading: false,
        isMatching: false,
      });
      return false;
    }
  },

  stopMatching: async () => {
    const { matchId } = get();
    if (matchId) {
      try {
        await endpoints.arena.stopMatching(matchId);
      } catch (e) {
        // ignore
      }
    }
    set({
      isMatching: false,
      matchId: null,
      matchResult: null,
    });
  },

  checkMatchStatus: async () => {
    const { matchId } = get();
    if (!matchId) return null;

    try {
      const result = await endpoints.arena.getMatchStatus(matchId);

      if (result.status === 'success') {
        set({
          isMatching: false,
          matchResult: result,
        });
      } else if (result.status === 'timeout') {
        set({
          isMatching: false,
          matchId: null,
        });
      }

      return result;
    } catch (err: any) {
      set({ error: err?.data?.error || err.message });
      return null;
    }
  },

  fetchBattle: async (battleId: string) => {
    try {
      const battle = await endpoints.arena.getBattle(battleId);
      set({ currentBattle: battle });
      return battle;
    } catch (err: any) {
      set({ error: err?.data?.error || err.message });
      return null;
    }
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

  useSkill: async (battleId: string, playerId: string, skillId: string) => {
    try {
      const result = await endpoints.arena.useSkill(battleId, { playerId, skillId });
      if (result?.battle) {
        set({ currentBattle: result.battle });
      }
    } catch (err: any) {
      set({ error: err?.data?.error || err.message });
    }
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
      matchId: null,
      matchResult: null,
      currentBattle: null,
      skillCooldowns: {},
      error: null,
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),
}));
