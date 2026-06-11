import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Coins, Gem, TrendingUp, TrendingDown } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import MagicButton from '@/components/MagicButton';
import PlayerAvatar from '@/components/PlayerAvatar';

interface BattleResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  isWinner: boolean;
  playerName: string;
  playerAvatar: string;
  opponentName: string;
  opponentAvatar: string;
  pointsChange: number;
  coinsReward: number;
  fragmentsReward: number;
}

export default function BattleResultModal({
  isOpen,
  onClose,
  isWinner,
  playerName,
  playerAvatar,
  opponentName,
  opponentAvatar,
  pointsChange,
  coinsReward,
  fragmentsReward,
}: BattleResultModalProps) {
  const particles = Array(30).fill(null).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.8,
    duration: 1.5 + Math.random() * 2,
    color: isWinner ? ['#FFD166', '#06D6A0', '#4ECDC4'][Math.floor(Math.random() * 3)] : '#EF476F',
  }));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute w-2 h-2 rounded-full"
                style={{ backgroundColor: p.color }}
                initial={{ y: '100%', x: `${p.x}%`, opacity: 0, scale: 0 }}
                animate={{
                  y: '-100%',
                  opacity: [0, 1, 1, 0],
                  scale: [0, 1.5, 1, 0],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.5, y: 100, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative max-w-md w-full"
          >
            <GlassCard className="relative p-8 overflow-hidden">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-dream-purple/20 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center relative z-10">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.3 }}
                  className="inline-block mb-6"
                >
                  {isWinner ? (
                    <div className="relative">
                      <Trophy className="w-20 h-20 text-dream-gold drop-shadow-[0_0_20px_rgba(255,209,102,0.6)]" />
                      <motion.div
                        className="absolute inset-0"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                      >
                        <div className="absolute top-0 left-1/2 w-2 h-2 bg-dream-gold rounded-full -translate-x-1/2 -translate-y-1" />
                      </motion.div>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-dream-red/20 flex items-center justify-center">
                      <span className="text-5xl">💔</span>
                    </div>
                  )}
                </motion.div>

                <motion.h1
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className={`text-4xl font-bold mb-2 ${
                    isWinner ? 'text-dream-gold' : 'text-dream-red'
                  }`}
                >
                  {isWinner ? '胜利！' : '失败...'}
                </motion.h1>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-dream-light/60 mb-8"
                >
                  {isWinner
                    ? '恭喜你赢得了这场梦境对决！'
                    : '不要气馁，下次一定能赢！'}
                </motion.p>

                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center justify-center gap-6 mb-8"
                >
                  <div className="text-center">
                    <PlayerAvatar
                      player={{ avatar: playerAvatar, nickname: playerName, level: 1 }}
                      size="lg"
                    />
                    <p className="mt-2 font-medium">{playerName}</p>
                    {isWinner && (
                      <span className="inline-block mt-1 text-dream-gold text-sm">👑 胜者</span>
                    )}
                  </div>

                  <div className="text-3xl font-bold text-dream-light/30">VS</div>

                  <div className="text-center">
                    <PlayerAvatar
                      player={{ avatar: opponentAvatar, nickname: opponentName, level: 1 }}
                      size="lg"
                    />
                    <p className="mt-2 font-medium">{opponentName}</p>
                    {!isWinner && (
                      <span className="inline-block mt-1 text-dream-gold text-sm">👑 胜者</span>
                    )}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="grid grid-cols-3 gap-4 mb-8 pt-6 border-t border-dream-purple/20"
                >
                  <div className="text-center">
                    <div className={`flex items-center justify-center gap-1 mb-1 ${
                      pointsChange >= 0 ? 'text-dream-green' : 'text-dream-red'
                    }`}>
                      {pointsChange >= 0 ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                      <span className="text-2xl font-bold">{pointsChange >= 0 ? '+' : ''}{pointsChange}</span>
                    </div>
                    <p className="text-xs text-dream-light/50">积分</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1 text-dream-gold">
                      <Coins className="w-5 h-5" />
                      <span className="text-2xl font-bold">+{coinsReward}</span>
                    </div>
                    <p className="text-xs text-dream-light/50">金币</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1 text-dream-blue">
                      <Gem className="w-5 h-5" />
                      <span className="text-2xl font-bold">+{fragmentsReward}</span>
                    </div>
                    <p className="text-xs text-dream-light/50">梦之碎片</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  className="grid grid-cols-2 gap-3"
                >
                  <MagicButton variant="secondary" onClick={onClose}>
                    返回大厅
                  </MagicButton>
                  <MagicButton onClick={onClose}>
                    再来一局
                  </MagicButton>
                </motion.div>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
