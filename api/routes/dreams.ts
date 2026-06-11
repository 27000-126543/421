import { Router, type Request, type Response } from 'express'
import { getDb, saveDb, generateId } from '../db/index.js'
import type { VisitorData, RandomEvent, EventStatus } from '../../shared/types.js'

const router = Router()

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { ownerId, isPublic, sortBy, page = 1, limit = 20 } = req.query;
  const db = await getDb();

  let dreams = [...db.data.dreams];

  if (ownerId) {
    dreams = dreams.filter(d => d.ownerId === ownerId);
  }
  if (isPublic !== undefined) {
    dreams = dreams.filter(d => d.isPublic === (isPublic === 'true'));
  }

  if (sortBy === 'popular') {
    dreams.sort((a, b) => b.visitorCount - a.visitorCount);
  } else if (sortBy === 'recent') {
    dreams.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sortBy === 'favorite') {
    dreams.sort((a, b) => b.favoriteCount - a.favoriteCount);
  }

  const startIndex = (Number(page) - 1) * Number(limit);
  const paginatedDreams = dreams.slice(startIndex, startIndex + Number(limit));

  res.status(200).json({
    success: true,
    data: {
      dreams: paginatedDreams,
      total: dreams.length,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(dreams.length / Number(limit))
    }
  });
})

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const db = await getDb();

  const dream = db.data.dreams.find(d => d.id === id);
  if (!dream) {
    res.status(404).json({
      success: false,
      error: 'Dream not found'
    });
    return;
  }

  const weavers = db.data.weavers.filter(w => dream.weaverIds.includes(w.id));
  const elements = db.data.sceneElements.filter(e => dream.elementIds.includes(e.id));
  const owner = db.data.players.find(p => p.id === dream.ownerId);

  res.status(200).json({
    success: true,
    data: {
      dream,
      weavers,
      elements,
      owner: owner ? { id: owner.id, nickname: owner.nickname, avatar: owner.avatar } : null
    }
  });
})

router.post('/:id/enter', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { playerId } = req.body;
  const db = await getDb();

  const dream = db.data.dreams.find(d => d.id === id);
  if (!dream) {
    res.status(404).json({
      success: false,
      error: 'Dream not found'
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

  dream.visitorCount++;

  const visitorData: VisitorData = {
    id: `visitor-${generateId()}`,
    playerId,
    dreamId: id,
    playerName: player.nickname,
    playerAvatar: player.avatar,
    subconscious: 50 + Math.floor(Math.random() * 50),
    emotion: 50 + Math.floor(Math.random() * 50),
    energy: 100,
    enterTime: new Date().toISOString()
  };

  db.data.visitorData.push(visitorData);
  await saveDb();

  const eventChance = dream.complexity > 50 ? 0.6 : 0.3;
  let randomEvent: RandomEvent | null = null;

  if (Math.random() < eventChance) {
    const eventTypes = ['nightmare', 'memory_fragment'] as const;
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    randomEvent = {
      id: `event-${generateId()}`,
      dreamId: id,
      type: eventType,
      status: 'pending',
      description: eventType === 'nightmare' 
        ? '一个恐怖的梦魇正在逼近...'
        : '你发现了一片闪烁的记忆碎片...',
      triggeredAt: new Date().toISOString()
    };

    db.data.randomEvents.push(randomEvent);
    await saveDb();
  }

  res.status(200).json({
    success: true,
    data: {
      visitorData,
      randomEvent,
      stability: dream.stability,
      experienceScore: dream.experienceScore,
      affixes: dream.affixes
    }
  });
})

router.get('/:id/events', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const db = await getDb();

  const events = db.data.randomEvents.filter(e => e.dreamId === id);

  res.status(200).json({
    success: true,
    data: events
  });
})

router.post('/:id/events/handle', async (req: Request, res: Response): Promise<void> => {
  const { eventId, action, playerId } = req.body;
  const db = await getDb();

  const event = db.data.randomEvents.find(e => e.id === eventId);
  if (!event) {
    res.status(404).json({
      success: false,
      error: 'Event not found'
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

  const success = action === 'fight' ? Math.random() > 0.3 : Math.random() > 0.5;
  const newStatus: EventStatus = success ? 'resolved' : 'failed';

  let reward = { coins: 0, fragments: 0 };
  if (success) {
    reward = {
      coins: Math.floor(Math.random() * 200) + 50,
      fragments: Math.floor(Math.random() * 20) + 5
    };
    player.coins += reward.coins;
    player.dreamFragments += reward.fragments;
  }

  event.status = newStatus;
  event.result = {
    success,
    reward: success ? reward : undefined
  };

  await saveDb();

  res.status(200).json({
    success: true,
    data: {
      event,
      reward
    }
  });
})

export default router
