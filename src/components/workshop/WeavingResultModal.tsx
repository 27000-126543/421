import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Star } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import RarityBadge from '@/components/RarityBadge';
import AffixBadge from '@/components/AffixBadge';
import type { Dream, AffixType } from '../../../shared/types';

interface WeavingResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: Dream | null;
  triggeredAffixes: AffixType[];
}

export default function WeavingResultModal({
  isOpen,
  onClose,
  result,
  triggeredAffixes,
}: WeavingResultModalProps) {
  if (!result) return null;

  const starRating = Math.min(5, Math.max(1, Math.floor((result.stability + result.experienceScore) / 40)));
  const rarity = result.complexity > 80 ? 'legendary' : result.complexity > 50 ? 'epic' : result.complexity > 30 ? 'rare' : 'common';

  const particles = Array(20).fill(null).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 2,
  }));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {rarity === 'legendary' && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {particles.map((p) => (
                  <motion.div
                    key={p.id}
                    className="absolute w-2 h-2 rounded-full bg-dream-gold"
                    initial={{ y: '100%', x: `${p.x}%`, opacity: 0 }}
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
                    style={{ filter: 'blur(1px)' }}
                  />
                ))}
              </div>
            )}

            <GlassCard className="relative p-6">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-dream-purple/20 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="inline-block mb-4"
                >
                  <span className="text-6xl">✨</span>
                </motion.div>

                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold mb-2 gradient-text"
                >
                  梦境编织完成！
                </motion.h2>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-4"
                >
                  <h3 className="text-xl font-bold mb-2">{result.name}</h3>
                  <div className="flex items-center justify-center gap-2">
                    <RarityBadge rarity={rarity} size="lg" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-center gap-1 mb-6"
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.div
                      key={star}
                      initial={{ scale: 0 }}
                      animate={{ scale: star <= starRating ? 1 : 0.5 }}
                      transition={{ delay: 0.6 + star * 0.1, type: 'spring' }}
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= starRating
                            ? 'text-dream-gold fill-dream-gold drop-shadow-[0_0_8px_rgba(255,209,102,0.8)]'
                            : 'text-dream-light/20'
                        }`}
                      />
                    </motion.div>
                  ))}
                </motion.div>

                {triggeredAffixes.length > 0 && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mb-6"
                  >
                    <h4 className="text-sm font-medium text-dream-light/70 mb-3 flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4 text-dream-gold" />
                      触发的稀有词缀
                    </h4>
                    <div className="flex flex-wrap justify-center gap-2">
                      {triggeredAffixes.map((affix, index) => (
                        <motion.div
                          key={affix}
                          initial={{ scale: 0, rotate: -10 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 1 + index * 0.15, type: 'spring' }}
                        >
                          <AffixBadge affix={affix} />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="grid grid-cols-3 gap-4 mb-6 pt-4 border-t border-dream-purple/20"
                >
                  <div>
                    <p className="text-2xl font-bold text-dream-green">{result.stability}</p>
                    <p className="text-xs text-dream-light/50">稳定性</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-dream-gold">{result.experienceScore}</p>
                    <p className="text-xs text-dream-light/50">经验评分</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-dream-purple">{result.complexity}</p>
                    <p className="text-xs text-dream-light/50">复杂度</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  <p className="text-sm text-dream-light/60 mb-4">{result.description}</p>
                </motion.div>

                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.4 }}
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-dream-purple to-dream-blue font-bold text-white hover:opacity-90 transition-opacity"
                >
                  太棒了！
                </motion.button>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
