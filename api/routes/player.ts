import { Router, type Request, type Response } from 'express'
import { getDb } from '../db/index.js'

const router = Router()

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const db = await getDb();

  const player = db.data.players.find(p => p.id === id);
  if (!player) {
    res.status(404).json({
      success: false,
      error: 'Player not found'
    });
    return;
  }

  const weavers = db.data.weavers.filter(w => w.playerId === id);
  const dreams = db.data.dreams.filter(d => d.ownerId === id);
  const notifications = db.data.notifications.filter(n => n.playerId === id);
  const guild = player.guildId ? db.data.guilds.find(g => g.id === player.guildId) : null;

  const stats = {
    totalDreams: dreams.length,
    totalWeavers: weavers.length,
    totalVisitors: dreams.reduce((sum, d) => sum + d.visitorCount, 0),
    totalFavorites: dreams.reduce((sum, d) => sum + d.favoriteCount, 0),
    totalTransactions: db.data.transactions.filter(t => t.buyerId === id || t.sellerId === id).length,
    battleWins: db.data.battles.filter(b => b.winnerId === id).length,
    battleLosses: db.data.battles.filter(b => b.status === 'finished' && b.winnerId && b.winnerId !== id && (b.player1Id === id || b.player2Id === id)).length
  };

  res.status(200).json({
    success: true,
    data: {
      player,
      weavers,
      dreams,
      notifications,
      guild: guild ? {
        id: guild.id,
        name: guild.name,
        avatar: guild.avatar,
        position: player.guildPosition
      } : null,
      stats
    }
  });
})

export default router
