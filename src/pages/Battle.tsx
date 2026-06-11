import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, Zap, Flag, MessageSquare } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import MagicButton from '@/components/MagicButton';
import PlayerAvatar from '@/components/PlayerAvatar';
import BattleResultModal from '@/components/battle/BattleResultModal';
import EnergyBar from '@/components/EnergyBar';
import { useArenaStore } from '@/store/useArenaStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import type { BattleSkill, BattleLogEntry } from '../../shared/types';
import { battleSkills, mockPlayers } from '../../shared/mockData';

export default function Battle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentPlayer } = usePlayerStore();
  const { skillCooldowns, useSkill, decrementCooldowns, updateSkillCooldown } = useArenaStore();

  const [playerEnergy, setPlayerEnergy] = useState(50);
  const [opponentEnergy, setOpponentEnergy] = useState(50);
  const [countdown, setCountdown] = useState(180);
  const [battleLog, setBattleLog] = useState<BattleLogEntry[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isWinner, setIsWinner] = useState(true);
  const [isBattleEnded, setIsBattleEnded] = useState(false);

  const logRef = useRef<HTMLDivElement>(null);
  const maxEnergy = 100;

  const player = {
    name: currentPlayer?.nickname || '梦境旅人',
    avatar: currentPlayer?.avatar || mockPlayers[0].avatar,
    dreamName: '记忆花园·秘境',
  };

  const opponent = {
    name: '星辰编织者',
    avatar: mockPlayers[1].avatar,
    dreamName: '恐惧深渊·幻境',
  };

  const [skills, setSkills] = useState<BattleSkill[]>(
    battleSkills.map((s) => ({ ...s, currentCooldown: 0 }))
  );

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isBattleEnded && countdown > 0) {
        setCountdown((prev) => prev - 1);
        setPlayerEnergy((prev) => Math.min(maxEnergy, prev + 1));
        setOpponentEnergy((prev) => Math.min(maxEnergy, prev + 1));
        decrementCooldowns();

        setSkills((prev) =>
          prev.map((s) => ({
            ...s,
            currentCooldown: Math.max(0, s.currentCooldown - 1),
          }))
        );

        if (Math.random() < 0.15) {
          const opponentSkill = battleSkills[Math.floor(Math.random() * battleSkills.length)];
          const damage = Math.floor(opponentSkill.effectValue * 0.5);
          setPlayerEnergy((prev) => Math.max(0, prev - damage));

          addLog({
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            playerId: 'opponent',
            action: opponentSkill.name,
            effect: -damage,
            message: `${opponent.name} 使用了 ${opponentSkill.name}，造成 ${damage} 点伤害！`,
          });
        }

        if (playerEnergy <= 0 || opponentEnergy <= 0) {
          endBattle();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, isBattleEnded, playerEnergy, opponentEnergy]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [battleLog]);

  const addLog = (entry: BattleLogEntry) => {
    setBattleLog((prev) => [...prev, entry]);
  };

  const handleUseSkill = (skill: BattleSkill) => {
    if (skill.currentCooldown > 0 || playerEnergy < skill.energyCost || isBattleEnded) return;

    setPlayerEnergy((prev) => prev - skill.energyCost);
    setSkills((prev) =>
      prev.map((s) =>
        s.id === skill.id ? { ...s, currentCooldown: s.cooldown } : s
      )
    );
    updateSkillCooldown(skill.id, skill.cooldown);
    if (id && currentPlayer?.id) {
      useSkill(id, currentPlayer.id, skill.id);
    }

    const damage = skill.effectValue;
    setOpponentEnergy((prev) => Math.max(0, prev - damage));

    addLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      playerId: 'player',
      action: skill.name,
      effect: damage,
      message: `你使用了 ${skill.name}，造成 ${damage} 点伤害！`,
    });

    if (opponentEnergy - damage <= 0) {
      setTimeout(() => endBattle(), 500);
    }
  };

  const handleSurrender = () => {
    setIsWinner(false);
    endBattle();
  };

  const endBattle = () => {
    setIsBattleEnded(true);
    setIsWinner(opponentEnergy <= playerEnergy);
    setTimeout(() => setShowResult(true), 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCloseResult = () => {
    setShowResult(false);
    navigate('/arena');
  };

  const renderEnergyColumn = (
    current: number,
    isPlayer: boolean,
    reverse?: boolean
  ) => (
    <div className={`flex flex-col items-center gap-4 ${reverse ? 'flex-col-reverse' : ''}`}>
      <div className="relative w-8 h-64 bg-dream-purple/10 rounded-full overflow-hidden border-2 border-dream-purple/30">
        <motion.div
          className={`absolute bottom-0 left-0 right-0 rounded-full ${
            isPlayer
              ? 'bg-gradient-to-t from-dream-blue to-cyan-400'
              : 'bg-gradient-to-t from-dream-red to-red-400'
          }`}
          initial={{ height: 0 }}
          animate={{ height: `${(current / maxEnergy) * 100}%` }}
          transition={{ duration: 0.5 }}
          style={{
            boxShadow: isPlayer
              ? '0 0 20px rgba(78, 205, 196, 0.5)'
              : '0 0 20px rgba(239, 71, 111, 0.5)',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white drop-shadow-lg">
            {current}
          </span>
        </div>
      </div>
      <span className="text-xs text-dream-light/50 font-mono">能量</span>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-between p-4 bg-dream-dark/50 backdrop-blur-lg border-b border-dream-purple/30">
        <div className="flex items-center gap-3">
          <MagicButton size="sm" variant="secondary" onClick={handleSurrender}>
            <Flag className="w-4 h-4" />
            投降
          </MagicButton>
        </div>

        <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-dream-purple/20 border border-dream-purple/30">
          <Clock className="w-5 h-5 text-dream-gold" />
          <span className="text-2xl font-bold font-mono text-dream-gold">
            {formatTime(countdown)}
          </span>
        </div>

        <div className="w-24" />
      </div>

      <div className="flex-1 flex items-center justify-center gap-8 p-8">
        <div className="flex items-center gap-8">
          <div className="text-center">
            <motion.div
              animate={{
                scale: playerEnergy > opponentEnergy ? [1, 1.05, 1] : 1,
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-4"
            >
              <PlayerAvatar
                player={{ avatar: player.avatar, nickname: player.name, level: 1 }}
                size="xl"
                showLevel
              />
            </motion.div>
            <h3 className="text-lg font-bold mb-1">{player.name}</h3>
            <p className="text-sm text-dream-light/60 mb-4">{player.dreamName}</p>
            <EnergyBar
              current={playerEnergy}
              max={maxEnergy}
              color="cyan"
              size="lg"
              showValue
            />
          </div>
          {renderEnergyColumn(playerEnergy, true)}
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="text-4xl font-bold text-dream-light/20">VS</div>
          <GlassCard className="p-4 w-80">
            <h4 className="text-sm font-medium text-dream-light/70 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              战斗日志
            </h4>
            <div ref={logRef} className="h-48 overflow-y-auto space-y-2">
              <AnimatePresence>
                {battleLog.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`text-sm p-2 rounded-lg ${
                      log.playerId === 'player'
                        ? 'bg-dream-blue/10 border-l-2 border-dream-blue'
                        : 'bg-dream-red/10 border-l-2 border-dream-red'
                    }`}
                  >
                    <p className={log.playerId === 'player' ? 'text-dream-blue' : 'text-dream-red'}>
                      {log.message}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
              {battleLog.length === 0 && (
                <p className="text-center text-dream-light/30 text-sm py-8">
                  战斗即将开始...
                </p>
              )}
            </div>
          </GlassCard>
        </div>

        <div className="flex items-center gap-8">
          {renderEnergyColumn(opponentEnergy, false, true)}
          <div className="text-center">
            <motion.div
              animate={{
                scale: opponentEnergy > playerEnergy ? [1, 1.05, 1] : 1,
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-4"
            >
              <PlayerAvatar
                player={{ avatar: opponent.avatar, nickname: opponent.name, level: 1 }}
                size="xl"
                showLevel
              />
            </motion.div>
            <h3 className="text-lg font-bold mb-1">{opponent.name}</h3>
            <p className="text-sm text-dream-light/60 mb-4">{opponent.dreamName}</p>
            <EnergyBar
              current={opponentEnergy}
              max={maxEnergy}
              color="red"
              size="lg"
              showValue
            />
          </div>
        </div>
      </div>

      <div className="p-6 bg-dream-dark/50 backdrop-blur-lg border-t border-dream-purple/30">
        <div className="flex items-center justify-center gap-4">
          {skills.map((skill) => {
            const isOnCooldown = skill.currentCooldown > 0;
            const hasEnoughEnergy = playerEnergy >= skill.energyCost;
            const canUse = !isOnCooldown && hasEnoughEnergy && !isBattleEnded;

            return (
              <motion.div
                key={skill.id}
                whileHover={canUse ? { scale: 1.05, y: -4 } : {}}
                whileTap={canUse ? { scale: 0.95 } : {}}
                className="relative"
              >
                <button
                  onClick={() => handleUseSkill(skill)}
                  disabled={!canUse}
                  className={`relative w-20 h-20 rounded-2xl border-2 overflow-hidden transition-all ${
                    canUse
                      ? 'bg-gradient-to-br from-dream-purple/30 to-dream-blue/30 border-dream-purple/50 hover:border-dream-purple cursor-pointer'
                      : 'bg-dream-purple/10 border-dream-purple/20 cursor-not-allowed opacity-60'
                  }`}
                >
                  <span className="text-4xl">{skill.icon}</span>

                  {isOnCooldown && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {skill.currentCooldown}
                      </span>
                    </div>
                  )}
                </button>

                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-dream-gold/20 text-dream-gold text-xs font-medium flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {skill.energyCost}
                </div>

                <p className="text-center text-xs text-dream-light/70 mt-3 max-w-[100px]">
                  {skill.name}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      <BattleResultModal
        isOpen={showResult}
        onClose={handleCloseResult}
        isWinner={isWinner}
        playerName={player.name}
        playerAvatar={player.avatar}
        opponentName={opponent.name}
        opponentAvatar={opponent.avatar}
        pointsChange={isWinner ? 15 : -10}
        coinsReward={isWinner ? 500 : 100}
        fragmentsReward={isWinner ? 30 : 10}
      />
    </div>
  );
}
