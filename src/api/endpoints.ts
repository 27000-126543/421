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
    getProfile: (playerId: string) => apiClient.get<{
      player: Player;
      weavers: any[];
      dreams: any[];
      notifications: Notification[];
      guild: any;
      stats: any;
    }>(`/player/${playerId}`),
    updateProfile: (data: { playerId: string; nickname?: string; avatar?: string }) =>
      apiClient.patch<Player>('/player/profile', data),
    getNotifications: (playerId: string) => apiClient.get<{
      notifications: Notification[];
      unreadCount: number;
    }>(`/player/${playerId}/notifications`),
    markNotificationRead: (playerId: string, notificationId: string) =>
      apiClient.patch<Notification>(`/player/${playerId}/notifications/${notificationId}/read`),
    markAllNotificationsRead: (playerId: string) =>
      apiClient.patch<{ updated: boolean; unreadCount: number }>(`/player/${playerId}/notifications/read-all`),
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
    startMatching: (data: { playerId: string; dreamId: string }) =>
      apiClient.post<MatchResult>('/arena/match', data),
    stopMatching: (matchId: string) => apiClient.delete<void>(`/arena/match/${matchId}`),
    getMatchStatus: (matchId: string) => apiClient.get<MatchResult>(`/arena/match/${matchId}/status`),
    getBattle: (battleId: string) => apiClient.get<Battle>(`/arena/battles/${battleId}`),
    useSkill: (battleId: string, data: { playerId: string; skillId: string }) =>
      apiClient.post<{ battle: Battle; logEntry: any }>(`/arena/battles/${battleId}/skill`, data),
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
      return apiClient.get<{ items: MarketItem[]; total: number; page: number; limit: number; totalPages: number }>(`/market/items?${query.toString()}`);
    },
    getItem: (id: string) => apiClient.get<MarketItem>(`/market/items/${id}`),
    publishItem: (data: {
      sellerId: string;
      type: string;
      itemName: string;
      itemRarity: string;
      price: number;
      itemData?: any;
    }) =>
      apiClient.post<{ item: MarketItem; priceSuggestion: PriceSuggestion }>('/market/items/publish', data),
    cancelItem: (id: string) =>
      apiClient.patch<MarketItem>(`/market/items/${id}/cancel`),
    buyItem: (id: string, data: { buyerId: string; playerId?: string }) =>
      apiClient.post<{
        transaction: Transaction;
        item: MarketItem;
        buyerRemainingCoins: number;
        sellerReceivedCoins: number;
        fee: number;
        announcement: any;
        serverEvent: any;
      }>(`/market/items/${id}/buy`, data),
    getPriceSuggestion: (data: { type: string; rarity: string; itemRarity?: string }) =>
      apiClient.post<PriceSuggestion>('/market/items/suggest-price', data),
    getTransactions: (params?: { page?: number; limit?: number; type?: string }) => {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      if (params?.type) query.append('type', params.type);
      return apiClient.get<{ transactions: Transaction[]; total: number; page: number; limit: number; totalPages: number }>(`/market/transactions?${query.toString()}`);
    },
    getMyItems: (playerId: string, params?: { page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      query.append('playerId', playerId);
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      return apiClient.get<{ items: MarketItem[]; total: number; page: number; limit: number; totalPages: number }>(`/market/items/my?${query.toString()}`);
    },
    getActiveEvents: () => apiClient.get<any[]>('/market/events/active'),
  },

  guild: {
    get: (guildId: string) => apiClient.get<Guild>(`/guild/${guildId}`),
    create: (data: { playerId: string; name: string; description?: string; avatar?: string }) =>
      apiClient.post<Guild>('/guild', data),
    update: (guildId: string, data: Partial<Guild>) =>
      apiClient.patch<Guild>(`/guild/${guildId}`, data),
    disband: (guildId: string) => apiClient.delete<void>(`/guild/${guildId}`),
    join: (guildId: string) => apiClient.post<Guild>(`/guild/${guildId}/join`),
    leave: (guildId: string) => apiClient.post<void>(`/guild/${guildId}/leave`),
    kickMember: (guildId: string, playerId: string) =>
      apiClient.delete<void>(`/guild/${guildId}/members/${playerId}`),
    upgradeBuilding: (
      buildingType: 'dream_tower' | 'research_hall',
      data: { guildId: string; playerId: string; materials?: number; coins?: number }
    ) => apiClient.post<any>(`/guild/building/${buildingType}/upgrade`, data),
    getMyGuild: (playerId?: string) => {
      const query = playerId ? `?playerId=${playerId}` : '';
      return apiClient.get<Guild>(`/guild/my${query}`);
    },
  },

  rankings: {
    get: (type: RankingType, params?: { limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.limit) query.append('limit', params.limit.toString());
      return apiClient.get<RankingEntry[]>(`/rankings/${type}?${query.toString()}`);
    },
    getFull: (type: RankingType, params?: { limit?: number }) => {
      const query = new URLSearchParams();
      query.append('type', type);
      if (params?.limit) query.append('limit', params.limit.toString());
      return apiClient.get<{ type: string; rankings: RankingEntry[]; updatedAt: string }>(`/rankings?${query.toString()}`);
    },
  },

  reports: {
    getWeekly: () => apiClient.get<WeeklyReport>('/reports/weekly'),
  },
};
