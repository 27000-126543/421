import { motion } from 'framer-motion';
import { Star, ArrowUp, Plus } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import RarityBadge from '@/components/RarityBadge';
import PlayerAvatar from '@/components/PlayerAvatar';
import EnergyBar from '@/components/EnergyBar';
import type { Weaver } from '../../../shared/types';

interface WeaverCardProps {
  weaver: Weaver;
  selected?: boolean;
  onSelect?: () => void;
  onUpgrade?: () => void;
  onRecruit?: () => void;
  showRecruit?: boolean;
}

export default function WeaverCard({
  weaver,
  selected = false,
  onSelect,
  onUpgrade,
  onRecruit,
  showRecruit = false,
}: WeaverCardProps) {
  const expPercentage = (weaver.exp / (weaver.level * 100)) * 100;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <GlassCard
        className={selected ? 'ring-2 ring-dream-purple shadow-lg shadow-dream-purple/30' : ''}
        onClick={onSelect}
      >
        <div className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <PlayerAvatar
              player={{
                avatar: weaver.avatar,
                nickname: weaver.name,
                level: weaver.level,
              }}
              size="lg"
              showLevel
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold truncate">{weaver.name}</h4>
                <RarityBadge rarity={weaver.rarity} size="sm" showText={false} />
              </div>
              <RarityBadge rarity={weaver.rarity} size="sm" />
            </div>
          </div>

          <EnergyBar
            current={weaver.exp}
            max={weaver.level * 100}
            label="经验"
            showValue
            color="purple"
            size="sm"
            className="mb-3"
          />

          <div className="space-y-2 mb-3">
            {weaver.skills.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center justify-between text-xs bg-dream-purple/10 rounded-lg px-2 py-1.5"
              >
                <span className="text-dream-light/70">{skill.name}</span>
                <span className="flex items-center gap-1 text-dream-gold">
                  <Star className="w-3 h-3" />
                  +{skill.value}
                </span>
              </div>
            ))}
          </div>

          {showRecruit ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRecruit?.();
              }}
              className="w-full py-2 rounded-lg bg-gradient-to-r from-dream-purple to-dream-blue text-sm font-medium flex items-center justify-center gap-1 hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              招募
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpgrade?.();
              }}
              className="w-full py-2 rounded-lg bg-dream-gold/20 text-dream-gold text-sm font-medium flex items-center justify-center gap-1 hover:bg-dream-gold/30 transition-colors"
            >
              <ArrowUp className="w-4 h-4" />
              升级培养
            </button>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
