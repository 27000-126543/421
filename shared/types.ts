export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type SceneCategory = 'plant' | 'architecture' | 'creature' | 'weather' | 'time';
export type AffixType = 'lucid' | 'precognition' | 'nightmare' | 'stable' | 'chaotic';
export type EventType = 'nightmare' | 'memory_fragment';
export type EventStatus = 'pending' | 'resolved' | 'failed';
export type BattleStatus = 'waiting' | 'fighting' | 'finished';
export type GuildPosition = 'member' | 'officer' | 'leader';
export type MarketItemType = 'blueprint' | 'guardian';
export type MarketItemStatus = 'active' | 'sold' | 'expired';
export type RankingType = 'favorite' | 'points' | 'contribution';

export interface Player {
  id: string;
  nickname: string;
  avatar: string;
  level: number;
  exp: number;
  experience?: number;
  maxExperience?: number;
  coins: number;
  dreamFragments: number;
  materials?: number;
  guildId?: string;
  guildPosition?: GuildPosition;
  arenaPoints: number;
  createdAt: string;
}

export interface WeaverSkill {
  id: string;
  name: string;
  description: string;
  type: 'stability' | 'experience' | 'affix_chance';
  value: number;
}

export interface Weaver {
  id: string;
  playerId: string;
  name: string;
  rarity: Rarity;
  skills: WeaverSkill[];
  level: number;
  exp: number;
  avatar: string;
}

export interface SceneElement {
  id: string;
  name: string;
  category: SceneCategory;
  stabilityModifier: number;
  experienceModifier: number;
  affixBonus: Record<AffixType, number>;
  icon: string;
}

export interface Dream {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  theme: string;
  weaverIds: string[];
  elementIds: string[];
  stability: number;
  experienceScore: number;
  affixes: AffixType[];
  complexity: number;
  isPublic: boolean;
  visitorCount: number;
  favoriteCount: number;
  favoritesCount?: number;
  rarity?: Rarity;
  createdAt: string;
}

export interface VisitorData {
  id: string;
  playerId: string;
  dreamId: string;
  playerName: string;
  playerAvatar: string;
  subconscious: number;
  emotion: number;
  energy: number;
  enterTime: string;
  exitTime?: string;
}

export interface RandomEvent {
  id: string;
  dreamId: string;
  type: EventType;
  status: EventStatus;
  description: string;
  result?: {
    success: boolean;
    reward?: {
      coins?: number;
      fragments?: number;
    };
  };
  triggeredAt: string;
}

export interface BattleSkill {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  currentCooldown: number;
  energyCost: number;
  effectValue: number;
  icon: string;
}

export interface Battle {
  id: string;
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  player1Avatar: string;
  player2Avatar: string;
  player1DreamId: string;
  player2DreamId: string;
  player1DreamName: string;
  player2DreamName: string;
  player1Energy: number;
  player2Energy: number;
  player1MaxEnergy: number;
  player2MaxEnergy: number;
  player1Skills: BattleSkill[];
  player2Skills: BattleSkill[];
  status: BattleStatus;
  winnerId?: string;
  startTime: string;
  endTime?: string;
  duration: number;
  battleLog: BattleLogEntry[];
}

export interface BattleLogEntry {
  id: string;
  timestamp: string;
  playerId: string;
  action: string;
  effect: number;
  message: string;
}

export interface MarketItem {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  type: MarketItemType;
  itemId: string;
  itemName: string;
  itemData: object;
  itemRarity: Rarity;
  price: number;
  suggestedPriceRange: [number, number];
  createdAt: string;
  status: MarketItemStatus;
}

export interface Transaction {
  id: string;
  itemId: string;
  buyerId: string;
  sellerId: string;
  price: number;
  createdAt: string;
}

export interface GuildBuilding {
  guildId: string;
  buildingType: 'dream_tower' | 'research_hall';
  level: number;
  exp: number;
  maxExp: number;
  effect: string;
  effectValue: number;
}

export interface GuildMember {
  guildId: string;
  playerId: string;
  playerName: string;
  playerAvatar: string;
  position: GuildPosition;
  contribution: number;
  joinedAt: string;
}

export interface Guild {
  id: string;
  name: string;
  leaderId: string;
  leaderName: string;
  avatar: string;
  description: string;
  members: GuildMember[];
  dreamTower: GuildBuilding;
  researchHall: GuildBuilding;
  totalContribution: number;
  memberCount: number;
  maxMembers: number;
  level?: number;
  createdAt: string;
}

export interface Favorite {
  playerId: string;
  dreamId: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  playerId: string;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface ServerEvent {
  id: string;
  type: string;
  name: string;
  description: string;
  effectValue: number;
  affectedDreamIds?: string[];
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  heatmap: Record<string, number>;
  stabilityCurve: { date: string; avgStability: number }[];
  priceTrend: { date: string; avgPrice: number; itemType: string }[];
  topDreams: Dream[];
  totalTransactions: number;
  totalVolume: number;
  activePlayers: number;
}

export interface DreamCalculationResult {
  stability: number;
  experienceScore: number;
  complexity: number;
  affixChances: Record<AffixType, number>;
  triggeredAffixes: AffixType[];
}

export interface PriceSuggestion {
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  suggestedRange: [number, number];
  recentSales: { price: number; date: string }[];
}

export interface RankingEntry {
  rank: number;
  playerId: string;
  playerName: string;
  playerAvatar: string;
  value: number;
  previousRank?: number;
}

export interface MatchResult {
  matchId: string;
  status: 'matching' | 'success' | 'failed' | 'timeout';
  battleId?: string;
  estimatedWaitTime?: number;
  matchedPlayer?: {
    id: string;
    name: string;
    avatar: string;
    level: number;
  };
}
