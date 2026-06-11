import { Router, type Request, type Response } from 'express'
import { getDb } from '../db/index.js'
import { generateWeeklyReport } from '../../shared/mockData.js'

const router = Router()

router.get('/weekly', async (req: Request, res: Response): Promise<void> => {
  const db = await getDb();

  const report = generateWeeklyReport();

  report.totalTransactions = db.data.transactions.length;
  report.totalVolume = db.data.transactions.reduce((sum, t) => sum + t.price, 0);
  report.activePlayers = new Set([
    ...db.data.visitorData.map(v => v.playerId),
    ...db.data.transactions.map(t => t.buyerId),
    ...db.data.battles.flatMap(b => [b.player1Id, b.player2Id])
  ]).size;

  res.status(200).json({
    success: true,
    data: report
  });
})

export default router
