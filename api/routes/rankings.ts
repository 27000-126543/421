import { Router, type Request, type Response } from 'express'
import { getDb } from '../db/index.js'
import type { RankingEntry, RankingType } from '../../shared/types.js'

const router = Router()

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { type = 'points', limit = 20 } = req.query;
  const db = await getDb();

  const rankingType = type as RankingType;
  const rankings: RankingEntry[] = [];

  const playersWithValue = db.data.players.map(player => {
    let value = 0;

    if (rankingType === 'favorite') {
      value = db.data.dreams
        .filter(d => d.ownerId === player.id)
        .reduce((sum, d) => sum + d.favoriteCount, 0);
    } else if (rankingType === 'points') {
      value = player.arenaPoints;
    } else if (rankingType === 'contribution') {
      value = db.data.guilds.reduce((sum, guild) => {
        const member = guild.members.find(m => m.playerId === player.id);
        return sum + (member?.contribution || 0);
      }, 0);
    }

    return { player, value };
  });

  playersWithValue.sort((a, b) => b.value - a.value);

  playersWithValue.slice(0, Number(limit)).forEach((item, index) => {
    rankings.push({
      rank: index + 1,
      playerId: item.player.id,
      playerName: item.player.nickname,
      playerAvatar: item.player.avatar,
      value: item.value,
      previousRank: Math.floor(Math.random() * 10) + 1
    });
  });

  res.status(200).json({
    success: true,
    data: {
      type: rankingType,
      rankings,
      updatedAt: new Date().toISOString()
    }
  });
})

export default router
