import { create } from 'zustand';
import type { Guild, GuildMember, GuildBuilding } from '../../shared/types';

interface GuildState {
  currentGuild: Guild | null;
  members: GuildMember[];
  buildings: {
    dreamTower: GuildBuilding | null;
    researchHall: GuildBuilding | null;
  };
  isLoading: boolean;
  error: string | null;
  setGuild: (guild: Guild | null) => void;
  updateGuild: (updates: Partial<Guild>) => void;
  setMembers: (members: GuildMember[]) => void;
  addMember: (member: GuildMember) => void;
  removeMember: (playerId: string) => void;
  updateMember: (playerId: string, updates: Partial<GuildMember>) => void;
  setBuildings: (buildings: {
    dreamTower: GuildBuilding | null;
    researchHall: GuildBuilding | null;
  }) => void;
  upgradeBuilding: (buildingType: 'dream_tower' | 'research_hall') => void;
  updateBuildingExp: (
    buildingType: 'dream_tower' | 'research_hall',
    exp: number
  ) => void;
  leaveGuild: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useGuildStore = create<GuildState>((set, get) => ({
  currentGuild: null,
  members: [],
  buildings: {
    dreamTower: null,
    researchHall: null,
  },
  isLoading: false,
  error: null,

  setGuild: (guild) => {
    if (guild) {
      set({
        currentGuild: guild,
        members: guild.members,
        buildings: {
          dreamTower: guild.dreamTower,
          researchHall: guild.researchHall,
        },
      });
    } else {
      set({
        currentGuild: null,
        members: [],
        buildings: { dreamTower: null, researchHall: null },
      });
    }
  },

  updateGuild: (updates) => {
    const { currentGuild } = get();
    if (currentGuild) {
      set({
        currentGuild: { ...currentGuild, ...updates },
      });
    }
  },

  setMembers: (members) => set({ members }),

  addMember: (member) => {
    set((state) => ({
      members: [...state.members, member],
      currentGuild: state.currentGuild
        ? {
            ...state.currentGuild,
            members: [...state.currentGuild.members, member],
            memberCount: state.currentGuild.memberCount + 1,
          }
        : null,
    }));
  },

  removeMember: (playerId) => {
    set((state) => ({
      members: state.members.filter((m) => m.playerId !== playerId),
      currentGuild: state.currentGuild
        ? {
            ...state.currentGuild,
            members: state.currentGuild.members.filter(
              (m) => m.playerId !== playerId
            ),
            memberCount: state.currentGuild.memberCount - 1,
          }
        : null,
    }));
  },

  updateMember: (playerId, updates) => {
    set((state) => ({
      members: state.members.map((m) =>
        m.playerId === playerId ? { ...m, ...updates } : m
      ),
      currentGuild: state.currentGuild
        ? {
            ...state.currentGuild,
            members: state.currentGuild.members.map((m) =>
              m.playerId === playerId ? { ...m, ...updates } : m
            ),
          }
        : null,
    }));
  },

  setBuildings: (buildings) => set({ buildings }),

  upgradeBuilding: (buildingType) => {
    const key = buildingType === 'dream_tower' ? 'dreamTower' : 'researchHall';
    set((state) => {
      const building = state.buildings[key];
      if (!building) return state;
      const newBuilding: GuildBuilding = {
        ...building,
        level: building.level + 1,
        exp: 0,
        maxExp: building.maxExp * 1.5,
        effectValue: building.effectValue * 1.2,
      };
      return {
        buildings: {
          ...state.buildings,
          [key]: newBuilding,
        },
        currentGuild: state.currentGuild
          ? {
              ...state.currentGuild,
              [key]: newBuilding,
            }
          : null,
      };
    });
  },

  updateBuildingExp: (buildingType, exp) => {
    const key = buildingType === 'dream_tower' ? 'dreamTower' : 'researchHall';
    set((state) => {
      const building = state.buildings[key];
      if (!building) return state;
      const newBuilding: GuildBuilding = {
        ...building,
        exp: Math.min(building.exp + exp, building.maxExp),
      };
      return {
        buildings: {
          ...state.buildings,
          [key]: newBuilding,
        },
        currentGuild: state.currentGuild
          ? {
              ...state.currentGuild,
              [key]: newBuilding,
            }
          : null,
      };
    });
  },

  leaveGuild: () => {
    set({
      currentGuild: null,
      members: [],
      buildings: { dreamTower: null, researchHall: null },
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),
}));
