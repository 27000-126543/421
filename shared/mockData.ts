import type {
  Player, Weaver, SceneElement, Dream, MarketItem, Guild,
  WeeklyReport, BattleSkill, Rarity, AffixType
} from './types';

const generateId = () => Math.random().toString(36).substring(2, 15);

const weaverNames = [
  '梦语者·艾琳', '星织者·卡洛斯', '深渊编织者·莫娜',
  '时光裁缝·菲尼克斯', '幻境画师·莉莉丝', '梦魇铸造师·德拉科',
  '记忆织网者·索菲亚', '潜意识园丁·奥利弗', '虚空绣师·维多利亚',
  '以太纺者·加百列'
];

const dreamThemes = [
  '记忆花园', '恐惧深渊', '星辰之海', '时光回廊',
  '欲望迷宫', '遗忘废墟', '永恒梦境', '混沌漩涡',
  '水晶幻境', '血色黄昏'
];

const sceneElements: SceneElement[] = [
  {
    id: 'elem-1', name: '记忆之花', category: 'plant',
    stabilityModifier: 5, experienceModifier: 8,
    affixBonus: { lucid: 2, precognition: 0, nightmare: 0, stable: 1, chaotic: 0 },
    icon: '🌸'
  },
  {
    id: 'elem-2', name: '遗忘藤蔓', category: 'plant',
    stabilityModifier: -3, experienceModifier: 6,
    affixBonus: { lucid: 0, precognition: 1.5, nightmare: 1, stable: 0, chaotic: 2 },
    icon: '🌿'
  },
  {
    id: 'elem-3', name: '水晶城堡', category: 'architecture',
    stabilityModifier: 10, experienceModifier: 5,
    affixBonus: { lucid: 3, precognition: 0, nightmare: 0, stable: 4, chaotic: 0 },
    icon: '🏰'
  },
  {
    id: 'elem-4', name: '深渊塔楼', category: 'architecture',
    stabilityModifier: -8, experienceModifier: 12,
    affixBonus: { lucid: 0, precognition: 0, nightmare: 5, stable: 0, chaotic: 3 },
    icon: '🗼'
  },
  {
    id: 'elem-5', name: '梦境精灵', category: 'creature',
    stabilityModifier: 3, experienceModifier: 10,
    affixBonus: { lucid: 1, precognition: 2.5, nightmare: 0, stable: 1, chaotic: 0 },
    icon: '🧚'
  },
  {
    id: 'elem-6', name: '梦魇巨兽', category: 'creature',
    stabilityModifier: -10, experienceModifier: 15,
    affixBonus: { lucid: 0, precognition: 0, nightmare: 8, stable: 0, chaotic: 5 },
    icon: '🐉'
  },
  {
    id: 'elem-7', name: '永恒星辰', category: 'weather',
    stabilityModifier: 8, experienceModifier: 8,
    affixBonus: { lucid: 4, precognition: 3, nightmare: 0, stable: 2, chaotic: 0 },
    icon: '✨'
  },
  {
    id: 'elem-8', name: '血色迷雾', category: 'weather',
    stabilityModifier: -12, experienceModifier: 10,
    affixBonus: { lucid: 0, precognition: 1, nightmare: 10, stable: 0, chaotic: 6 },
    icon: '🌫️'
  },
  {
    id: 'elem-9', name: '时光倒流', category: 'time',
    stabilityModifier: 0, experienceModifier: 20,
    affixBonus: { lucid: 2, precognition: 8, nightmare: 2, stable: 0, chaotic: 3 },
    icon: '⏳'
  },
  {
    id: 'elem-10', name: '永恒瞬间', category: 'time',
    stabilityModifier: 15, experienceModifier: 0,
    affixBonus: { lucid: 6, precognition: 2, nightmare: 0, stable: 5, chaotic: 0 },
    icon: '⌛'
  },
  {
    id: 'elem-11', name: '月光草坪', category: 'plant',
    stabilityModifier: 6, experienceModifier: 7,
    affixBonus: { lucid: 2, precognition: 1, nightmare: 0, stable: 3, chaotic: 0 },
    icon: '🌙'
  },
  {
    id: 'elem-12', name: '熔岩洞窟', category: 'architecture',
    stabilityModifier: -15, experienceModifier: 18,
    affixBonus: { lucid: 0, precognition: 0, nightmare: 12, stable: 0, chaotic: 8 },
    icon: '🌋'
  }
];

const battleSkills: BattleSkill[] = [
  {
    id: 'skill-1', name: '清醒一击', description: '打断对方能量回复，造成15点伤害',
    cooldown: 8, currentCooldown: 0, energyCost: 20, effectValue: 15, icon: '⚡'
  },
  {
    id: 'skill-2', name: '梦魇侵蚀', description: '降低对方梦境稳定性，持续减少能量',
    cooldown: 12, currentCooldown: 0, energyCost: 25, effectValue: 8, icon: '🌑'
  },
  {
    id: 'skill-3', name: '预知之盾', description: '生成护盾，抵挡下次技能伤害',
    cooldown: 15, currentCooldown: 0, energyCost: 30, effectValue: 25, icon: '🛡️'
  },
  {
    id: 'skill-4', name: '记忆涟漪', description: '快速回复自身能量',
    cooldown: 10, currentCooldown: 0, energyCost: 0, effectValue: 20, icon: '💫'
  }
];

const rarityColors: Record<Rarity, string> = {
  common: '#9CA3AF',
  rare: '#3B82F6',
  epic: '#9B5DE5',
  legendary: '#FFD166'
};

const affixInfo: Record<AffixType, { name: string; description: string; color: string }> = {
  lucid: { name: '清醒', description: '玩家在梦境中保持清醒意识，探索收益+20%', color: '#4ECDC4' },
  precognition: { name: '预知', description: '可预见随机事件，提前3秒获得提示', color: '#FFD166' },
  nightmare: { name: '梦魇', description: '高风险高回报，噩梦事件概率+50%但奖励翻倍', color: '#EF476F' },
  stable: { name: '稳固', description: '梦境稳定性+30，不易崩溃', color: '#06D6A0' },
  chaotic: { name: '混沌', description: '随机事件频率翻倍，体验评分上限+50', color: '#9B5DE5' }
};

function createMockPlayer(id: string, nickname: string): Player {
  return {
    id,
    nickname,
    avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${id}`,
    level: Math.floor(Math.random() * 50) + 1,
    exp: Math.floor(Math.random() * 10000),
    coins: Math.floor(Math.random() * 100000) + 1000,
    dreamFragments: Math.floor(Math.random() * 500),
    arenaPoints: Math.floor(Math.random() * 2000) + 1000,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  };
}

function createMockWeaver(playerId: string, index: number): Weaver {
  const rarities: Rarity[] = ['common', 'common', 'rare', 'rare', 'epic', 'legendary'];
  const rarity = rarities[Math.floor(Math.random() * rarities.length)];
  
  return {
    id: `weaver-${generateId()}`,
    playerId,
    name: weaverNames[index % weaverNames.length],
    rarity,
    level: Math.floor(Math.random() * 30) + 1,
    exp: Math.floor(Math.random() * 5000),
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=weaver-${index}`,
    skills: [
      {
        id: `skill-${generateId()}`,
        name: ['梦境编织', '稳定之手', '词缀感应'][Math.floor(Math.random() * 3)],
        description: '提升梦境属性',
        type: ['stability', 'experience', 'affix_chance'][Math.floor(Math.random() * 3)] as 'stability' | 'experience' | 'affix_chance',
        value: Math.floor(Math.random() * 10) + 5
      }
    ]
  };
}

function createMockDream(ownerId: string, ownerName: string, index: number): Dream {
  const weaverCount = Math.floor(Math.random() * 3) + 1;
  const elementCount = Math.floor(Math.random() * 5) + 3;
  
  const selectedElements = [...sceneElements]
    .sort(() => Math.random() - 0.5)
    .slice(0, elementCount);
  
  const baseStability = selectedElements.reduce((sum, e) => sum + e.stabilityModifier, 50);
  const baseScore = selectedElements.reduce((sum, e) => sum + e.experienceModifier, 30);
  
  const affixTypes: AffixType[] = ['lucid', 'precognition', 'nightmare', 'stable', 'chaotic'];
  const triggeredAffixes = affixTypes.filter(() => Math.random() < 0.15);
  
  return {
    id: `dream-${generateId()}`,
    ownerId,
    name: `${dreamThemes[index % dreamThemes.length]}·${['秘境', '幻境', '梦境', '奇境'][Math.floor(Math.random() * 4)]}`,
    description: `这是由${ownerName}编织的神秘梦境，充满了未知与惊喜...`,
    theme: dreamThemes[index % dreamThemes.length],
    weaverIds: Array(weaverCount).fill(null).map(() => `weaver-${generateId()}`),
    elementIds: selectedElements.map(e => e.id),
    stability: Math.max(0, Math.min(100, baseStability + Math.floor(Math.random() * 20) - 10)),
    experienceScore: Math.max(0, Math.min(100, baseScore + Math.floor(Math.random() * 20))),
    affixes: triggeredAffixes,
    complexity: weaverCount * 10 + elementCount * 5 + Math.floor(Math.random() * 20),
    isPublic: Math.random() > 0.3,
    visitorCount: Math.floor(Math.random() * 1000),
    favoriteCount: Math.floor(Math.random() * 500),
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
  };
}

function createMockMarketItem(sellerId: string, sellerName: string, sellerAvatar: string, index: number): MarketItem {
  const types: ('blueprint' | 'guardian')[] = ['blueprint', 'guardian'];
  const type = types[index % 2];
  const rarities: Rarity[] = ['common', 'rare', 'epic', 'legendary'];
  const rarity = rarities[Math.floor(Math.random() * rarities.length)];
  
  const basePrice = { common: 100, rare: 500, epic: 2000, legendary: 10000 }[rarity];
  const price = basePrice + Math.floor(Math.random() * basePrice * 0.5);
  
  return {
    id: `market-${generateId()}`,
    sellerId,
    sellerName,
    sellerAvatar,
    type,
    itemId: `item-${generateId()}`,
    itemName: type === 'blueprint' 
      ? `${['古老', '神秘', '禁忌', '史诗'][Math.floor(Math.random() * 4)]}${['花园', '深渊', '星空', '时光'][Math.floor(Math.random() * 4)]}蓝图`
      : `${['梦境', '深渊', '星辰', '守护'][Math.floor(Math.random() * 4)]}守护者契约`,
    itemData: { rarity, description: '珍贵的梦境道具' },
    itemRarity: rarity,
    price,
    suggestedPriceRange: [Math.floor(price * 0.8), Math.floor(price * 1.2)],
    createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active'
  };
}

function createMockGuild(index: number): Guild {
  const guildNames = ['星辰编织者', '深渊守望者', '梦境旅团', '时光织工', '潜意识学派'];
  const leaderId = `player-leader-${index}`;
  
  return {
    id: `guild-${generateId()}`,
    name: guildNames[index % guildNames.length],
    leaderId,
    leaderName: `会长${index + 1}`,
    avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=guild-${index}`,
    description: '欢迎加入我们，共同探索梦境的奥秘！',
    members: [],
    dreamTower: {
      guildId: '',
      buildingType: 'dream_tower',
      level: Math.floor(Math.random() * 10) + 1,
      exp: Math.floor(Math.random() * 5000),
      maxExp: 10000,
      effect: '提升全体成员梦境编织成功率',
      effectValue: 5
    },
    researchHall: {
      guildId: '',
      buildingType: 'research_hall',
      level: Math.floor(Math.random() * 10) + 1,
      exp: Math.floor(Math.random() * 5000),
      maxExp: 10000,
      effect: '提升全体成员探索收益',
      effectValue: 10
    },
    totalContribution: Math.floor(Math.random() * 100000),
    memberCount: Math.floor(Math.random() * 50) + 5,
    maxMembers: 100,
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
  };
}

const mockPlayers: Player[] = [
  createMockPlayer('player-1', '梦境旅人'),
  createMockPlayer('player-2', '星辰编织者'),
  createMockPlayer('player-3', '深渊漫步者'),
  createMockPlayer('player-4', '时光守护者'),
  createMockPlayer('player-5', '幻境画师')
];

const mockWeavers: Weaver[] = [
  ...Array(5).fill(null).map((_, i) => createMockWeaver('player-1', i)),
  ...Array(3).fill(null).map((_, i) => createMockWeaver('player-2', i + 5))
];

const mockDreams: Dream[] = [
  ...Array(8).fill(null).map((_, i) => createMockDream(mockPlayers[i % mockPlayers.length].id, mockPlayers[i % mockPlayers.length].nickname, i))
];

const mockMarketItems: MarketItem[] = [
  ...Array(10).fill(null).map((_, i) => 
    createMockMarketItem(
      mockPlayers[i % mockPlayers.length].id,
      mockPlayers[i % mockPlayers.length].nickname,
      mockPlayers[i % mockPlayers.length].avatar,
      i
    )
  )
];

const mockGuilds: Guild[] = [
  ...Array(5).fill(null).map((_, i) => createMockGuild(i))
];

function generateWeeklyReport(): WeeklyReport {
  const dates = Array(7).fill(null).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return d.toISOString().split('T')[0];
  });
  
  return {
    weekStart: dates[0],
    weekEnd: dates[6],
    heatmap: {
      '记忆花园': 1250,
      '恐惧深渊': 980,
      '星辰之海': 1520,
      '时光回廊': 890,
      '欲望迷宫': 760,
      '遗忘废墟': 650,
      '永恒梦境': 1100,
      '混沌漩涡': 720
    },
    stabilityCurve: dates.map(date => ({
      date,
      avgStability: 55 + Math.floor(Math.random() * 30)
    })),
    priceTrend: dates.flatMap(date => [
      { date, avgPrice: 500 + Math.floor(Math.random() * 300), itemType: 'blueprint' },
      { date, avgPrice: 800 + Math.floor(Math.random() * 500), itemType: 'guardian' }
    ]),
    topDreams: mockDreams.slice(0, 5),
    totalTransactions: 1256,
    totalVolume: 2580000,
    activePlayers: 3842
  };
}

export {
  sceneElements,
  battleSkills,
  rarityColors,
  affixInfo,
  mockPlayers,
  mockWeavers,
  mockDreams,
  mockMarketItems,
  mockGuilds,
  generateWeeklyReport,
  generateId,
  createMockDream,
  createMockPlayer,
  weaverNames,
  dreamThemes
};
