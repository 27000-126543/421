import { Router, type Request, type Response } from 'express'
import { getDb, saveDb } from '../db/index.js'

const router = Router()

async function getPlayerProfile(db: any, id: string) {
  const player = db.data.players.find((p: any) => p.id === id);
  if (!player) return null;

  const weavers = db.data.weavers.filter((w: any) => w.playerId === id);
  const dreams = db.data.dreams.filter((d: any) => d.ownerId === id);
  const notifications = db.data.notifications.filter((n: any) => n.playerId === id);
  const guild = player.guildId ? db.data.guilds.find((g: any) => g.id === player.guildId) : null;

  const stats = {
    totalDreams: dreams.length,
    totalWeavers: weavers.length,
    totalVisitors: dreams.reduce((sum: number, d: any) => sum + (d.visitorCount || 0), 0),
    totalFavorites: dreams.reduce((sum: number, d: any) => sum + (d.favoriteCount || d.favoritesCount || 0), 0),
    totalTransactions: db.data.transactions.filter((t: any) => t.buyerId === id || t.sellerId === id).length,
    battleWins: db.data.battles.filter((b: any) => b.winnerId === id).length,
    battleLosses: db.data.battles.filter((b: any) =>
      b.status === 'finished' && b.winnerId && b.winnerId !== id && (b.player1Id === id || b.player2Id === id)
    ).length
  };

  return {
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
  };
}

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const db = await getDb();

  const profile = await getPlayerProfile(db, id);
  if (!profile) {
    res.status(404).json({
      success: false,
      error: 'Player not found'
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: profile
  });
})

router.patch('/profile', async (req: Request, res: Response): Promise<void> => {
  const { playerId, nickname, avatar } = req.body;
  const db = await getDb();

  const player = db.data.players.find((p: any) => p.id === playerId);
  if (!player) {
    res.status(404).json({
      success: false,
      error: 'Player not found'
    });
    return;
  }

  if (nickname !== undefined) player.nickname = nickname;
  if (avatar !== undefined) player.avatar = avatar;

  await saveDb();

  res.status(200).json({
    success: true,
    data: player
  });
})

router.get('/:id/notifications', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const db = await getDb();

  const notifications = db.data.notifications
    .filter((n: any) => n.playerId === id)
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  res.status(200).json({
    success: true,
    data: {
      notifications,
      unreadCount
    }
  });
})

router.patch('/:id/notifications/:notificationId/read', async (req: Request, res: Response): Promise<void> => {
  const { id, notificationId } = req.params;
  const db = await getDb();

  const notification = db.data.notifications.find(
    (n: any) => n.id === notificationId && n.playerId === id
  );

  if (!notification) {
    res.status(404).json({
      success: false,
      error: 'Notification not found'
    });
    return;
  }

  notification.isRead = true;
  await saveDb();

  res.status(200).json({
    success: true,
    data: notification
  });
})

router.patch('/:id/notifications/read-all', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const db = await getDb();

  db.data.notifications.forEach((n: any) => {
    if (n.playerId === id) {
      n.isRead = true;
    }
  });

  await saveDb();

  const unreadCount = db.data.notifications.filter(
    (n: any) => n.playerId === id && !n.isRead
  ).length;

  res.status(200).json({
    success: true,
    data: {
      updated: true,
      unreadCount
    }
  });
})

export default router
