import { motion } from 'framer-motion';
import { ArrowUp, Clock, Shield, Sparkles } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import MagicButton from '@/components/MagicButton';

interface BuildingCardProps {
  name: string;
  icon: string;
  level: number;
  experience: number;
  maxExperience: number;
  description: string;
  effect: string;
  is3D?: boolean;
  onUpgrade: () => void;
}

export default function BuildingCard({
  name,
  icon,
  level,
  experience,
  maxExperience,
  description,
  effect,
  is3D,
  onUpgrade,
}: BuildingCardProps) {
  const progress = (experience / maxExperience) * 100;
  const upgradeCost = level * 1000;

  return (
    <GlassCard className="p-6">
      <div className="flex items-start gap-4">
        <div className="relative">
          <motion.div
            className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-dream-purple/30 to-dream-blue/30 flex items-center justify-center text-4xl ${
              is3D ? 'shadow-lg shadow-dream-purple/30' : ''
            }`}
            animate={is3D ? { rotateY: [0, 10, -10, 0] } : {}}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {icon}
          </motion.div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-dream-gold to-dream-red flex items-center justify-center text-sm font-bold">
            {level}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-lg">{name}</h4>
            {is3D && (
              <span className="px-2 py-0.5 rounded-full bg-dream-purple/20 text-dream-purple text-xs font-medium">
                3D预览
              </span>
            )}
          </div>
          <p className="text-sm text-dream-light/60 mb-3">{description}</p>

          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-dream-light/50">升级进度</span>
              <span className="text-dream-gold">{experience} / {maxExperience}</span>
            </div>
            <div className="h-2 rounded-full bg-dream-purple/20 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-dream-gold to-dream-red rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl bg-dream-green/10 border border-dream-green/20 mb-4">
            <Shield className="w-4 h-4 text-dream-green flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-dream-green">当前效果</p>
              <p className="text-xs text-dream-light/60">{effect}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-dream-gold text-sm">
              <Clock className="w-4 h-4" />
              <span>升级需要 {upgradeCost.toLocaleString()} 贡献</span>
            </div>
            <MagicButton size="sm" onClick={onUpgrade}>
              <ArrowUp className="w-4 h-4" />
              升级
            </MagicButton>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
