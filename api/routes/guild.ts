import { Router, type Request, type Response } from 'express'
import { getDb, saveDb } from '../db/index.js'
import type { GuildBuilding } from '../../shared/types.js'

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

router.post('/building/:type/upgrade', async (req: Request, res: Response): Promise<void> => {
  const { type } = req.params;
  const { guildId, playerId } = req.body;
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

  const building: GuildBuilding = buildingType === 'dream_tower' ? guild.dreamTower : guild.researchHall;
  const upgradeCost = building.level * 100;

  if (player.dreamFragments < upgradeCost) {
    res.status(400).json({
      success: false,
      error: 'Insufficient dream fragments'
    });
    return;
  }

  player.dreamFragments -= upgradeCost;
  building.exp += 500;

  if (building.exp >= building.maxExp) {
    building.level++;
    building.exp = 0;
    building.maxExp = Math.floor(building.maxExp * 1.5);
    building.effectValue += 5;
  }

  const member = guild.members.find(m => m.playerId === playerId);
  if (member) {
    member.contribution += upgradeCost;
  }
  guild.totalContribution += upgradeCost;

  await saveDb();

  res.status(200).json({
    success: true,
    data: {
      building,
      remainingFragments: player.dreamFragments,
      contributionGained: upgradeCost,
      leveledUp: building.exp === 0
    }
  });
})

export default router
