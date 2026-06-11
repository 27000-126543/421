import { Router, type Request, type Response } from 'express'
import { getDb, saveDb, generateId } from '../db/index.js'
import type { Player } from '../../shared/types.js'

const router = Router()

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { nickname, avatar } = req.body;
  const db = await getDb();

  let player: Player;
  
  if (nickname) {
    player = db.data.players.find(p => p.nickname === nickname) || db.data.players[0];
  } else {
    const guestId = `guest-${generateId()}`;
    player = {
      id: guestId,
      nickname: `游客_${Math.random().toString(36).substring(2, 8)}`,
      avatar: avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${guestId}`,
      level: 1,
      exp: 0,
      coins: 1000,
      dreamFragments: 50,
      arenaPoints: 1000,
      createdAt: new Date().toISOString()
    };
    db.data.players.push(player);
    await saveDb();
  }

  res.status(200).json({
    success: true,
    data: {
      player,
      token: `token_${generateId()}`
    }
  });
})

router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
})

export default router
