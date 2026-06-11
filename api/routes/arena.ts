import { Router, type Request, type Response } from 'express'
import { getDb, saveDb, generateId } from '../db/index.js'
import type { Battle, BattleSkill, MatchResult, BattleLogEntry, Dream } from '../../shared/types.js'

const router = Router()

interface MatchQueueItem {
  playerId: string;
  dreamId: string;
  dreamComplexity: number;
  startTime: number;
}

interface MatchedPair {
  battleId: string;
  player1MatchId: string;
  player2MatchId: string;
  player1Id: string;
  player2Id: string;
}

const matchQueue: Map<string, MatchQueueItem> = new Map();
const matchedPairs: Map<string, MatchedPair> = new Map();

const MAX_COMPLEXITY_DIFF = 30;
const MATCH_TIMEOUT = 60000;

router.post('/match', async (req: Request, res: Response): Promise<void> => {
  const { playerId, dreamId } = req.body;
  const db = await getDb();

  const player = db.data.players.find(p => p.id === playerId);
  if (!player) {
    res.status(404).json({
      success: false,
      error: 'Player not found'
    });
    return;
  }

  const dream = db.data.dreams.find(d => d.id === dreamId);
  if (!dream) {
    res.status(404).json({
      success: false,
      error: 'Dream not found'
    });
    return;
  }

  const matchId = `match-${generateId()}`;
  const playerComplexity = dream.complexity;

  let matched = false;
  let opponentMatchId = '';
  let opponentData: MatchQueueItem | null = null;

  const validOpponents = Array.from(matchQueue.entries()).filter(([, data]) => {
    if (data.playerId === playerId) return false;
    if (Date.now() - data.startTime > MATCH_TIMEOUT) return false;
    const diff = Math.abs(data.dreamComplexity - playerComplexity);
    return diff <= MAX_COMPLEXITY_DIFF;
  });

  if (validOpponents.length > 0) {
    validOpponents.sort((a, b) => {
      const diffA = Math.abs(a[1].dreamComplexity - playerComplexity);
      const diffB = Math.abs(b[1].dreamComplexity - playerComplexity);
      return diffA - diffB;
    });

    [opponentMatchId, opponentData] = validOpponents[0];
    matchQueue.delete(opponentMatchId);
    matched = true;
  }

  if (matched && opponentData) {
    const opponent = db.data.players.find(p => p.id === opponentData!.playerId);
    const opponentDream = db.data.dreams.find(d => d.id === opponentData!.dreamId);

    if (opponent && opponentDream) {
      const battle = await createBattle(
        player, opponent,
        dream, opponentDream,
        db.data.battleSkills
      );
      db.data.battles.push(battle);

      const pair: MatchedPair = {
        battleId: battle.id,
        player1MatchId: matchId,
        player2MatchId: opponentMatchId,
        player1Id: playerId,
        player2Id: opponentData.playerId,
      };
      matchedPairs.set(matchId, pair);
      matchedPairs.set(opponentMatchId, pair);

      await saveDb();

      const result: MatchResult = {
        matchId,
        status: 'success',
        battleId: battle.id,
        matchedPlayer: {
          id: opponent.id,
          name: opponent.nickname,
          avatar: opponent.avatar,
          level: opponent.level
        }
      };

      res.status(200).json({
        success: true,
        data: result
      });
      return;
    }
  }

  matchQueue.set(matchId, {
    playerId,
    dreamId,
    dreamComplexity: playerComplexity,
    startTime: Date.now()
  });

  const waitSeconds = Math.ceil(MATCH_TIMEOUT / 1000);
  const result: MatchResult = {
    matchId,
    status: 'matching',
    estimatedWaitTime: waitSeconds
  };

  res.status(200).json({
    success: true,
    data: result
  });
})

router.get('/match/:id/status', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const db = await getDb();

  const pair = matchedPairs.get(id);
  if (pair) {
    const battle = db.data.battles.find(b => b.id === pair.battleId);
    if (battle) {
      const isPlayer1 = pair.player1MatchId === id;
      const opponentId = isPlayer1 ? pair.player2Id : pair.player1Id;
      const opponent = db.data.players.find(p => p.id === opponentId);

      res.status(200).json({
        success: true,
        data: {
          matchId: id,
          status: 'success',
          battleId: battle.id,
          matchedPlayer: opponent ? {
            id: opponent.id,
            name: opponent.nickname,
            avatar: opponent.avatar,
            level: opponent.level
          } : undefined
        }
      });
      return;
    }
  }

  const matchData = matchQueue.get(id);

  if (!matchData) {
    res.status(200).json({
      success: true,
      data: {
        matchId: id,
        status: 'timeout'
      }
    });
    return;
  }

  if (Date.now() - matchData.startTime > MATCH_TIMEOUT) {
    matchQueue.delete(id);
    res.status(200).json({
      success: true,
      data: {
        matchId: id,
        status: 'timeout'
      }
    });
    return;
  }

  const remaining = Math.max(0, Math.ceil((MATCH_TIMEOUT - (Date.now() - matchData.startTime)) / 1000));

  res.status(200).json({
    success: true,
    data: {
      matchId: id,
      status: 'matching',
      estimatedWaitTime: remaining
    }
  });
})

router.delete('/match/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  matchQueue.delete(id);
  matchedPairs.delete(id);

  res.status(200).json({
    success: true,
    data: {
      message: 'Matching cancelled'
    }
  });
})

router.get('/battles/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const db = await getDb();

  const battle = db.data.battles.find(b => b.id === id);
  if (!battle) {
    res.status(404).json({
      success: false,
      error: 'Battle not found'
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: battle
  });
})

router.post('/battles/:id/skill', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { playerId, skillId } = req.body;
  const db = await getDb();

  const battle = db.data.battles.find(b => b.id === id);
  if (!battle) {
    res.status(404).json({
      success: false,
      error: 'Battle not found'
    });
    return;
  }

  if (battle.status !== 'fighting') {
    res.status(400).json({
      success: false,
      error: 'Battle is not active'
    });
    return;
  }

  const isPlayer1 = battle.player1Id === playerId;
  const isPlayer2 = battle.player2Id === playerId;

  if (!isPlayer1 && !isPlayer2) {
    res.status(403).json({
      success: false,
      error: 'Not a participant in this battle'
    });
    return;
  }

  const playerSkills = isPlayer1 ? battle.player1Skills : battle.player2Skills;
  const skill = playerSkills.find(s => s.id === skillId);

  if (!skill) {
    res.status(404).json({
      success: false,
      error: 'Skill not found'
    });
    return;
  }

  if (skill.currentCooldown > 0) {
    res.status(400).json({
      success: false,
      error: 'Skill is on cooldown'
    });
    return;
  }

  const playerEnergy = isPlayer1 ? battle.player1Energy : battle.player2Energy;
  if (playerEnergy < skill.energyCost) {
    res.status(400).json({
      success: false,
      error: 'Insufficient energy'
    });
    return;
  }

  if (isPlayer1) {
    battle.player1Energy -= skill.energyCost;
    battle.player2Energy = Math.max(0, battle.player2Energy - skill.effectValue);
  } else {
    battle.player2Energy -= skill.energyCost;
    battle.player1Energy = Math.max(0, battle.player1Energy - skill.effectValue);
  }

  skill.currentCooldown = skill.cooldown;

  const logEntry: BattleLogEntry = {
    id: `log-${generateId()}`,
    timestamp: new Date().toISOString(),
    playerId,
    action: skill.name,
    effect: skill.effectValue,
    message: `${isPlayer1 ? battle.player1Name : battle.player2Name} 使用了 ${skill.name}，造成 ${skill.effectValue} 点伤害！`
  };

  battle.battleLog.push(logEntry);

  battle.player1Skills.forEach(s => {
    if (s.currentCooldown > 0) s.currentCooldown--;
  });
  battle.player2Skills.forEach(s => {
    if (s.currentCooldown > 0) s.currentCooldown--;
  });

  battle.player1Energy = Math.min(battle.player1MaxEnergy, battle.player1Energy + 5);
  battle.player2Energy = Math.min(battle.player2MaxEnergy, battle.player2Energy + 5);

  let winner: string | undefined;
  if (battle.player1Energy <= 0) {
    winner = battle.player2Id;
  } else if (battle.player2Energy <= 0) {
    winner = battle.player1Id;
  }

  if (winner) {
    battle.status = 'finished';
    battle.winnerId = winner;
    battle.endTime = new Date().toISOString();
    battle.duration = (new Date(battle.endTime).getTime() - new Date(battle.startTime).getTime()) / 1000;

    const winnerPlayer = db.data.players.find(p => p.id === winner);
    if (winnerPlayer) {
      winnerPlayer.arenaPoints += 50;
      winnerPlayer.coins += 200;
    }

    const loserId = winner === battle.player1Id ? battle.player2Id : battle.player1Id;
    const loserPlayer = db.data.players.find(p => p.id === loserId);
    if (loserPlayer) {
      loserPlayer.arenaPoints = Math.max(1000, loserPlayer.arenaPoints - 20);
    }
  }

  await saveDb();

  res.status(200).json({
    success: true,
    data: {
      battle,
      logEntry
    }
  });
})

async function createBattle(
  player1: { id: string; nickname: string; avatar: string },
  player2: { id: string; nickname: string; avatar: string },
  dream1: { id: string; name: string },
  dream2: { id: string; name: string },
  skillsTemplate: BattleSkill[]
): Promise<Battle> {
  const createPlayerSkills = (): BattleSkill[] =>
    skillsTemplate.map(s => ({ ...s, id: `skill-${generateId()}`, currentCooldown: 0 }));

  return {
    id: `battle-${generateId()}`,
    player1Id: player1.id,
    player2Id: player2.id,
    player1Name: player1.nickname,
    player2Name: player2.nickname,
    player1Avatar: player1.avatar,
    player2Avatar: player2.avatar,
    player1DreamId: dream1.id,
    player2DreamId: dream2.id,
    player1DreamName: dream1.name,
    player2DreamName: dream2.name,
    player1Energy: 100,
    player2Energy: 100,
    player1MaxEnergy: 100,
    player2MaxEnergy: 100,
    player1Skills: createPlayerSkills(),
    player2Skills: createPlayerSkills(),
    status: 'fighting',
    startTime: new Date().toISOString(),
    duration: 0,
    battleLog: []
  };
}

export default router
