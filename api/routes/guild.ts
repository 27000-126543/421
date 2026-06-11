import { Router, type Request, type Response } from 'express'
import { getDb, saveDb, generateId } from '../db/index.js'
import type { GuildBuilding, GuildMember } from '../../shared/types.js'

const router = Router()

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { playerId, guildId } = req.query;
  const db = await getDb();

  if (guildId) {
    const guild = db.data.guilds.find(g => g.id === guildId);
    if (!guild) {
      res.status(404).json({
        success: false,
        error: 'Guild not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: guild
    });
    return;
  }

  if (playerId) {
    const player = db.data.players.find(p => p.id === playerId);
    if (!player) {
      res.status(404).json({
        success: false,
        error: 'Player not found'
      });
      return;
    }

    if (player.guildId) {
      const guild = db.data.guilds.find(g => g.id === player.guildId);
      res.status(200).json({
        success: true,
        data: guild || null
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: null
    });
    return;
  }

  const guilds = db.data.guilds.sort((a, b) => b.totalContribution - a.totalContribution);

  res.status(200).json({
    success: true,
    data: guilds
  });
})

router.get('/my', async (req: Request, res: Response): Promise<void> => {
  const { playerId } = req.query;
  const db = await getDb();

  const player = db.data.players.find(p => p.id === playerId);
  if (!player) {
    res.status(404).json({
      success: false,
      error: 'Player not found'
    });
    return;
  }

  if (!player.guildId) {
    res.status(200).json({
      success: true,
      data: null
    });
    return;
  }

  const guild = db.data.guilds.find(g => g.id === player.guildId);

  res.status(200).json({
    success: true,
    data: guild || null
  });
})

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const db = await getDb();

  const guild = db.data.guilds.find(g => g.id === id);
  if (!guild) {
    res.status(404).json({
      success: false,
      error: 'Guild not found'
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: guild
  });
})

router.post('/building/:type/upgrade', async (req: Request, res: Response): Promise<void> => {
  const { type } = req.params;
  const { guildId, playerId, materials = 0, coins = 0 } = req.body;
  const db = await getDb();

  const buildingType = type as 'dream_tower' | 'research_hall';
  if (buildingType !== 'dream_tower' && buildingType !== 'research_hall') {
    res.status(400).json({
      success: false,
      error: 'Invalid building type'
    });
    return;
  }

  const guild = db.data.guilds.find(g => g.id === guildId);
  if (!guild) {
    res.status(404).json({
      success: false,
      error: 'Guild not found'
    });
    return;
  }

  const player = db.data.players.find(p => p.id === playerId);
  if (!player) {
    res.status(404).json({
      success: false,
      error: 'Player not found'
    });
    return;
  }

  if (player.guildId !== guildId) {
    res.status(403).json({
      success: false,
      error: 'Not a member of this guild'
    });
    return;
  }

  const materialsNum = Number(materials);
  const coinsNum = Number(coins);

  if (materialsNum <= 0 && coinsNum <= 0) {
    res.status(400).json({
      success: false,
      error: 'Please contribute at least one resource'
    });
    return;
  }

  const playerMaterials = player.materials || 0;
  if (materialsNum > playerMaterials) {
    res.status(400).json({
      success: false,
      error: 'Insufficient materials'
    });
    return;
  }

  if (coinsNum > player.coins) {
    res.status(400).json({
      success: false,
      error: 'Insufficient coins'
    });
    return;
  }

  const building: GuildBuilding = buildingType === 'dream_tower' ? guild.dreamTower : guild.researchHall;
  const expGain = materialsNum * 10 + coinsNum * 0.5;
  const contributionGain = materialsNum * 5 + coinsNum;

  if (player.materials === undefined) player.materials = 0;
  player.materials -= materialsNum;
  player.coins -= coinsNum;

  const prevLevel = building.level;
  building.exp += Math.floor(expGain);

  let leveledUp = false;
  while (building.exp >= building.maxExp) {
    building.exp -= building.maxExp;
    building.level++;
    building.maxExp = Math.floor(building.maxExp * 1.5);
    building.effectValue += buildingType === 'dream_tower' ? 5 : 3;
    leveledUp = true;
  }

  if (!leveledUp && prevLevel !== building.level) {
    leveledUp = true;
  }

  const member = guild.members.find(m => m.playerId === playerId);
  if (member) {
    member.contribution += Math.floor(contributionGain);
  }
  guild.totalContribution += Math.floor(contributionGain);

  await saveDb();

  res.status(200).json({
    success: true,
    data: {
      building,
      remainingMaterials: player.materials,
      remainingCoins: player.coins,
      contributionGained: Math.floor(contributionGain),
      expGained: Math.floor(expGain),
      leveledUp,
      newLevel: building.level
    }
  });
})

router.post('/:id/upgrade', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { playerId, buildingType, materials = 0, coins = 0 } = req.body;

  const buildingTypeParam = buildingType as 'dream_tower' | 'research_hall';
  if (buildingTypeParam !== 'dream_tower' && buildingTypeParam !== 'research_hall') {
    res.status(400).json({
      success: false,
      error: 'Invalid building type'
    });
    return;
  }

  const db = await getDb();
  const guild = db.data.guilds.find(g => g.id === id);
  if (!guild) {
    res.status(404).json({
      success: false,
      error: 'Guild not found'
    });
    return;
  }

  const player = db.data.players.find(p => p.id === playerId);
  if (!player) {
    res.status(404).json({
      success: false,
      error: 'Player not found'
    });
    return;
  }

  if (player.guildId !== id) {
    res.status(403).json({
      success: false,
      error: 'Not a member of this guild'
    });
    return;
  }

  const materialsNum = Number(materials);
  const coinsNum = Number(coins);

  if (materialsNum <= 0 && coinsNum <= 0) {
    res.status(400).json({
      success: false,
      error: 'Please contribute at least one resource'
    });
    return;
  }

  const playerMaterials = player.materials || 0;
  if (materialsNum > playerMaterials) {
    res.status(400).json({
      success: false,
      error: 'Insufficient materials'
    });
    return;
  }

  if (coinsNum > player.coins) {
    res.status(400).json({
      success: false,
      error: 'Insufficient coins'
    });
    return;
  }

  const building: GuildBuilding = buildingTypeParam === 'dream_tower' ? guild.dreamTower : guild.researchHall;
  const expGain = materialsNum * 10 + coinsNum * 0.5;
  const contributionGain = materialsNum * 5 + coinsNum;

  if (player.materials === undefined) player.materials = 0;
  player.materials -= materialsNum;
  player.coins -= coinsNum;

  building.exp += Math.floor(expGain);

  let leveledUp = false;
  while (building.exp >= building.maxExp) {
    building.exp -= building.maxExp;
    building.level++;
    building.maxExp = Math.floor(building.maxExp * 1.5);
    building.effectValue += buildingTypeParam === 'dream_tower' ? 5 : 3;
    leveledUp = true;
  }

  const member = guild.members.find(m => m.playerId === playerId);
  if (member) {
    member.contribution += Math.floor(contributionGain);
  }
  guild.totalContribution += Math.floor(contributionGain);

  await saveDb();

  res.status(200).json({
    success: true,
    data: guild
  });
})

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { playerId, name, description, avatar } = req.body;
  const db = await getDb();

  const player = db.data.players.find(p => p.id === playerId);
  if (!player) {
    res.status(404).json({
      success: false,
      error: 'Player not found'
    });
    return;
  }

  if (player.guildId) {
    res.status(400).json({
      success: false,
      error: 'Already in a guild'
    });
    return;
  }

  const creationCost = 1000;
  if (player.coins < creationCost) {
    res.status(400).json({
      success: false,
      error: 'Insufficient coins to create a guild'
    });
    return;
  }

  const guildId = `guild-${generateId()}`;
  const now = new Date().toISOString();

  const member: GuildMember = {
    guildId,
    playerId,
    playerName: player.nickname,
    playerAvatar: player.avatar,
    position: 'leader',
    contribution: 0,
    joinedAt: now
  };

  const newGuild = {
    id: guildId,
    name,
    leaderId: playerId,
    leaderName: player.nickname,
    avatar: avatar || '🏰',
    description: description || '',
    members: [member],
    dreamTower: {
      guildId,
      buildingType: 'dream_tower' as const,
      level: 1,
      exp: 0,
      maxExp: 1000,
      effect: '梦境稳定性提升',
      effectValue: 5
    },
    researchHall: {
      guildId,
      buildingType: 'research_hall' as const,
      level: 1,
      exp: 0,
      maxExp: 1000,
      effect: '稀有词缀概率提升',
      effectValue: 3
    },
    totalContribution: 0,
    memberCount: 1,
    maxMembers: 50,
    createdAt: now,
    level: 1
  };

  player.coins -= creationCost;
  player.guildId = guildId;
  player.guildPosition = 'leader';

  db.data.guilds.push(newGuild);
  await saveDb();

  res.status(200).json({
    success: true,
    data: newGuild
  });
})

export default router
