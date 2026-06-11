import { Router, type Request, type Response } from 'express'
import { getDb, saveDb, generateId } from '../db/index.js'
import { calculateDream } from '../utils/dreamCalculator.js'
import type { Weaver, Dream } from '../../shared/types.js'
import { weaverNames } from '../../shared/mockData.js'

const router = Router()

router.get('/weavers', async (req: Request, res: Response): Promise<void> => {
  const { playerId } = req.query;
  const db = await getDb();
  
  let weavers = db.data.weavers;
  if (playerId) {
    weavers = weavers.filter(w => w.playerId === playerId);
  }

  res.status(200).json({
    success: true,
    data: weavers
  });
})

router.post('/weavers/recruit', async (req: Request, res: Response): Promise<void> => {
  const { playerId } = req.body;
  const db = await getDb();

  const player = db.data.players.find(p => p.id === playerId);
  if (!player) {
    res.status(404).json({
      success: false,
      error: 'Player not found'
    });
    return;
  }

  const recruitCost = 500;
  if (player.coins < recruitCost) {
    res.status(400).json({
      success: false,
      error: 'Insufficient coins'
    });
    return;
  }

  const rarities = ['common', 'common', 'common', 'rare', 'rare', 'epic', 'legendary'] as const;
  const rarity = rarities[Math.floor(Math.random() * rarities.length)];
  const existingWeavers = db.data.weavers.filter(w => w.playerId === playerId);
  
  const newWeaver: Weaver = {
    id: `weaver-${generateId()}`,
    playerId,
    name: weaverNames[Math.floor(Math.random() * weaverNames.length)],
    rarity,
    level: 1,
    exp: 0,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${generateId()}`,
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

  player.coins -= recruitCost;
  db.data.weavers.push(newWeaver);
  await saveDb();

  res.status(200).json({
    success: true,
    data: {
      weaver: newWeaver,
      remainingCoins: player.coins
    }
  });
})

router.get('/elements', async (req: Request, res: Response): Promise<void> => {
  const db = await getDb();

  res.status(200).json({
    success: true,
    data: db.data.sceneElements
  });
})

router.post('/calculate', async (req: Request, res: Response): Promise<void> => {
  const { weaverIds, elementIds } = req.body;
  const db = await getDb();

  const weavers = db.data.weavers.filter(w => weaverIds.includes(w.id));
  const elements = db.data.sceneElements.filter(e => elementIds.includes(e.id));

  if (weavers.length === 0) {
    res.status(400).json({
      success: false,
      error: 'No valid weavers selected'
    });
    return;
  }

  const result = calculateDream(weavers, elements);

  res.status(200).json({
    success: true,
    data: result
  });
})

router.post('/weave', async (req: Request, res: Response): Promise<void> => {
  const { playerId, name, description, theme, weaverIds, elementIds, isPublic } = req.body;
  const db = await getDb();

  const player = db.data.players.find(p => p.id === playerId);
  if (!player) {
    res.status(404).json({
      success: false,
      error: 'Player not found'
    });
    return;
  }

  const weavers = db.data.weavers.filter(w => weaverIds.includes(w.id));
  const elements = db.data.sceneElements.filter(e => elementIds.includes(e.id));

  if (weavers.length === 0) {
    res.status(400).json({
      success: false,
      error: 'No valid weavers selected'
    });
    return;
  }

  const weaveCost = 100 + weavers.length * 50 + elements.length * 20;
  if (player.dreamFragments < weaveCost) {
    res.status(400).json({
      success: false,
      error: 'Insufficient dream fragments'
    });
    return;
  }

  const calculation = calculateDream(weavers, elements);

  const newDream: Dream = {
    id: `dream-${generateId()}`,
    ownerId: playerId,
    name: name || `${theme}·梦境`,
    description: description || '一个神秘的梦境...',
    theme: theme || '未知',
    weaverIds,
    elementIds,
    stability: calculation.stability,
    experienceScore: calculation.experienceScore,
    affixes: calculation.triggeredAffixes,
    complexity: calculation.complexity,
    isPublic: isPublic !== false,
    visitorCount: 0,
    favoriteCount: 0,
    createdAt: new Date().toISOString()
  };

  player.dreamFragments -= weaveCost;
  player.exp += calculation.experienceScore * 10;
  db.data.dreams.push(newDream);
  await saveDb();

  res.status(200).json({
    success: true,
    data: {
      dream: newDream,
      calculation,
      remainingFragments: player.dreamFragments,
      expGained: calculation.experienceScore * 10
    }
  });
})

export default router
