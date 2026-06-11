import { motion, AnimatePresence } from 'framer-motion';
import { X, Skull, Sparkles, Shield, Settings } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import MagicButton from '@/components/MagicButton';
import type { RandomEvent } from '../../../shared/types';

interface EventModalProps {
  isOpen: boolean;
  event: RandomEvent | null;
  onClose: () => void;
  onDispatchGuardian: () => void;
  onAdjustScene: () => void;
}

export default function EventModal({
  isOpen,
  event,
  onClose,
  onDispatchGuardian,
  onAdjustScene,
}: EventModalProps) {
  if (!event) return null;

  const isNightmare = event.type === 'nightmare';

  const handleDispatch = () => {
    onDispatchGuardian();
    onClose();
  };

  const handleAdjust = () => {
    onAdjustScene();
    onClose();
  };

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
            <GlassCard className={`relative p-6 overflow-hidden ${isNightmare ? 'ring-2 ring-dream-red/50' : 'ring-2 ring-dream-gold/50'}`}>
              {isNightmare && (
                <div className="absolute inset-0 pointer-events-none">
                  <motion.div
                    className="absolute inset-0 bg-dream-red/10"
                    animate={{ opacity: [0, 0.3, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              )}

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
                  transition={{ type: 'spring', delay: 0.2 }}
                  className={`inline-block mb-4 ${isNightmare ? 'text-6xl' : 'text-6xl'}`}
                >
                  {isNightmare ? '💀' : '✨'}
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4 ${
                    isNightmare
                      ? 'bg-dream-red/20 text-dream-red border border-dream-red/30'
                      : 'bg-dream-gold/20 text-dream-gold border border-dream-gold/30'
                  }`}
                >
                  {isNightmare ? <Skull className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  {isNightmare ? '噩梦入侵' : '记忆碎片'}
                </motion.div>

                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl font-bold mb-4"
                >
                  {isNightmare ? '噩梦正在侵蚀梦境！' : '发现珍贵记忆碎片！'}
                </motion.h2>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-dream-light/70 mb-6"
                >
                  {event.description}
                </motion.p>

                {isNightmare ? (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="grid grid-cols-2 gap-3"
                  >
                    <MagicButton variant="danger" onClick={handleDispatch}>
                      <Shield className="w-4 h-4" />
                      派遣守护者
                    </MagicButton>
                    <MagicButton variant="secondary" onClick={handleAdjust}>
                      <Settings className="w-4 h-4" />
                      调整场景
                    </MagicButton>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <MagicButton variant="success" onClick={handleDispatch} className="w-full">
                      <Sparkles className="w-4 h-4" />
                      收集记忆碎片
                    </MagicButton>
                    <p className="text-xs text-dream-light/50 mt-3">
                      收集后将获得随机奖励（金币/梦之碎片）
                    </p>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-6 pt-4 border-t border-dream-purple/20"
                >
                  <p className="text-xs text-dream-light/40">
                    事件触发时间: {new Date(event.triggeredAt).toLocaleString('zh-CN')}
                  </p>
                </motion.div>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
