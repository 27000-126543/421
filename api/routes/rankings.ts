import { Router, type Request, type Response } from 'express'
import { getDb } from '../db/index.js'
import type { RankingEntry, RankingType } from '../../shared/types.js'

const router = Router()

function getRankings(db: any, type: RankingType, limit: number): RankingEntry[] {
  const rankings: RankingEntry[] = [];

  const playersWithValue = db.data.players.map(player => {
    let value = 0;

    if (type === 'favorite') {
      value = db.data.dreams
        .filter((d: any) => d.ownerId === player.id)
        .reduce((sum: number, d: any) => sum + (d.favoriteCount || d.favoritesCount || 0), 0);
    } else if (type === 'points') {
      value = player.arenaPoints;
    } else if (type === 'contribution') {
      value = db.data.guilds.reduce((sum: number, guild: any) => {
        const member = guild.members.find((m: any) => m.playerId === player.id);
        return sum + (member?.contribution || 0);
      }, 0);
    }

    return { player, value };
  });

  playersWithValue.sort((a: any, b: any) => b.value - a.value);

  playersWithValue.slice(0, Number(limit)).forEach((item: any, index: number) => {
    rankings.push({
      rank: index + 1,
      playerId: item.player.id,
      playerName: item.player.nickname,
      playerAvatar: item.player.avatar,
      value: item.value,
      previousRank: Math.floor(Math.random() * 10) + 1
    });
  });

  return rankings;
}

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { type = 'points', limit = 20 } = req.query;
  const db = await getDb();

  const rankingType = type as RankingType;
  const rankings = getRankings(db, rankingType, Number(limit));

  res.status(200).json({
    success: true,
    data: {
      type: rankingType,
      rankings,
      updatedAt: new Date().toISOString()
    }
  });
})

router.get('/:type', async (req: Request, res: Response): Promise<void> => {
  const { type } = req.params;
  const { limit = 20 } = req.query;
  const db = await getDb();

  const rankingType = type as RankingType;
  const rankings = getRankings(db, rankingType, Number(limit));

  res.status(200).json({
    success: true,
    data: rankings
  });
})

export default router
