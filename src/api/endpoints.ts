import { apiClient } from './client';
import type {
  Player,
  Dream,
  Battle,
  MarketItem,
  Transaction,
  Guild,
  Notification,
  VisitorData,
  RandomEvent,
  MatchResult,
  PriceSuggestion,
  RankingEntry,
  RankingType,
  WeeklyReport,
} from '../../shared/types';

export const endpoints = {
  auth: {
    login: (data: { address: string; signature: string }) =>
      apiClient.post<{ player: Player; token: string }>('/auth/login', data, {
        requireAuth: false,
      }),
    register: (data: { address: string; signature: string; nickname: string }) =>
      apiClient.post<{ player: Player; token: string }>('/auth/register', data, {
        requireAuth: false,
      }),
    logout: () => apiClient.post<void>('/auth/logout'),
    getCurrentUser: () => apiClient.get<Player>('/auth/me'),
  },

  player: {
    getProfile: (playerId: string) => apiClient.get<Player>(`/players/${playerId}`),
    updateProfile: (data: Partial<Player>) =>
      apiClient.patch<Player>('/players/profile', data),
    getNotifications: () => apiClient.get<Notification[]>('/players/notifications'),
    markNotificationRead: (id: string) =>
      apiClient.patch<void>(`/players/notifications/${id}/read`),
    markAllNotificationsRead: () =>
      apiClient.patch<void>('/players/notifications/read-all'),
  },

  dreams: {
    list: (params?: { page?: number; limit?: number; isPublic?: boolean }) => {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      if (params?.isPublic !== undefined)
        query.append('isPublic', params.isPublic.toString());
      return apiClient.get<Dream[]>(`/dreams?${query.toString()}`);
    },
    get: (id: string) => apiClient.get<Dream>(`/dreams/${id}`),
    create: (data: Omit<Dream, 'id' | 'createdAt'>) =>
      apiClient.post<Dream>('/dreams', data),
    update: (id: string, data: Partial<Dream>) =>
      apiClient.patch<Dream>(`/dreams/${id}`, data),
    delete: (id: string) => apiClient.delete<void>(`/dreams/${id}`),
    getVisitors: (dreamId: string) =>
      apiClient.get<VisitorData[]>(`/dreams/${dreamId}/visitors`),
    getRandomEvents: (dreamId: string) =>
      apiClient.get<RandomEvent[]>(`/dreams/${dreamId}/events`),
    resolveEvent: (eventId: string, data: { choice: string }) =>
      apiClient.post<RandomEvent>(`/dreams/events/${eventId}/resolve`, data),
  },

  arena: {
    startMatching: (data: { dreamId: string }) =>
      apiClient.post<MatchResult>('/arena/match', data),
    stopMatching: () => apiClient.delete<void>('/arena/match'),
    getMatchStatus: () => apiClient.get<MatchResult>('/arena/match/status'),
    getBattle: (battleId: string) => apiClient.get<Battle>(`/arena/battles/${battleId}`),
    useSkill: (battleId: string, data: { skillId: string; targetPlayerId: string }) =>
      apiClient.post<Battle>(`/arena/battles/${battleId}/skill`, data),
    surrender: (battleId: string) =>
      apiClient.post<Battle>(`/arena/battles/${battleId}/surrender`),
    getHistory: (params?: { page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      return apiClient.get<Battle[]>(`/arena/history?${query.toString()}`);
    },
  },

  market: {
    listItems: (params?: {
      page?: number;
      limit?: number;
      type?: string;
      rarity?: string;
      sortBy?: string;
    }) => {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      if (params?.type) query.append('type', params.type);
      if (params?.rarity) query.append('rarity', params.rarity);
      if (params?.sortBy) query.append('sortBy', params.sortBy);
      return apiClient.get<MarketItem[]>(`/market/items?${query.toString()}`);
    },
    getItem: (id: string) => apiClient.get<MarketItem>(`/market/items/${id}`),
    createItem: (data: Omit<MarketItem, 'id' | 'createdAt' | 'status'>) =>
      apiClient.post<MarketItem>('/market/items', data),
    cancelItem: (id: string) =>
      apiClient.patch<MarketItem>(`/market/items/${id}/cancel`),
    buyItem: (id: string) =>
      apiClient.post<{ transaction: Transaction; item: MarketItem }>(
        `/market/items/${id}/buy`
      ),
    getPriceSuggestion: (data: { type: string; rarity: string }) =>
      apiClient.post<PriceSuggestion>('/market/price-suggestion', data),
    getTransactions: (params?: { page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      return apiClient.get<Transaction[]>(`/market/transactions?${query.toString()}`);
    },
  },

  guild: {
    get: (guildId: string) => apiClient.get<Guild>(`/guilds/${guildId}`),
    create: (data: { name: string; description: string; avatar: string }) =>
      apiClient.post<Guild>('/guilds', data),
    update: (guildId: string, data: Partial<Guild>) =>
      apiClient.patch<Guild>(`/guilds/${guildId}`, data),
    disband: (guildId: string) => apiClient.delete<void>(`/guilds/${guildId}`),
    join: (guildId: string) => apiClient.post<Guild>(`/guilds/${guildId}/join`),
    leave: (guildId: string) => apiClient.post<void>(`/guilds/${guildId}/leave`),
    kickMember: (guildId: string, playerId: string) =>
      apiClient.delete<void>(`/guilds/${guildId}/members/${playerId}`),
    upgradeBuilding: (
      guildId: string,
      data: { buildingType: 'dream_tower' | 'research_hall' }
    ) => apiClient.post<Guild>(`/guilds/${guildId}/upgrade`, data),
    getMyGuild: () => apiClient.get<Guild>('/guilds/my'),
  },

  rankings: {
    get: (type: RankingType, params?: { limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.limit) query.append('limit', params.limit.toString());
      return apiClient.get<RankingEntry[]>(`/rankings/${type}?${query.toString()}`);
    },
  },

  reports: {
    getWeekly: () => apiClient.get<WeeklyReport>('/reports/weekly'),
  },
};
