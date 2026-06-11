import { motion } from 'framer-motion';
import { Star, Zap, Shield, TrendingUp } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import AffixBadge from '@/components/AffixBadge';
import type { AffixType, Weaver, SceneElement } from '../../../shared/types';
import { affixInfo } from '../../../shared/mockData';

interface WeavingCalculatorProps {
  selectedWeavers: Weaver[];
  selectedElements: SceneElement[];
}

export default function WeavingCalculator({ selectedWeavers, selectedElements }: WeavingCalculatorProps) {
  const baseStability = 50;
  const weaverStabilityBonus = selectedWeavers.reduce((sum, w) => {
    const stabilitySkill = w.skills.find((s) => s.type === 'stability');
    return sum + (stabilitySkill?.value || 0) + w.level * 0.5;
  }, 0);
  const elementStabilityModifier = selectedElements.reduce((sum, e) => sum + e.stabilityModifier, 0);
  const totalStability = Math.max(0, Math.min(100, baseStability + weaverStabilityBonus + elementStabilityModifier));

  const baseExpScore = 30;
  const weaverExpBonus = selectedWeavers.reduce((sum, w) => {
    const expSkill = w.skills.find((s) => s.type === 'experience');
    return sum + (expSkill?.value || 0) + w.level * 0.8;
  }, 0);
  const elementExpModifier = selectedElements.reduce((sum, e) => sum + e.experienceModifier, 0);
  const totalExpScore = Math.max(0, Math.min(100, baseExpScore + weaverExpBonus + elementExpModifier));

  const starRating = Math.floor((totalStability + totalExpScore) / 40);
  const displayStars = Math.min(5, Math.max(1, starRating));

  const affixChances: Record<AffixType, number> = {
    lucid: 0,
    precognition: 0,
    nightmare: 0,
    stable: 0,
    chaotic: 0,
  };

  selectedWeavers.forEach((w) => {
    const affixSkill = w.skills.find((s) => s.type === 'affix_chance');
    if (affixSkill) {
      Object.keys(affixChances).forEach((key) => {
        affixChances[key as AffixType] += affixSkill.value * 0.5;
      });
    }
  });

  selectedElements.forEach((e) => {
    Object.entries(e.affixBonus).forEach(([key, value]) => {
      affixChances[key as AffixType] += value * 2;
    });
  });

  Object.keys(affixChances).forEach((key) => {
    affixChances[key as AffixType] = Math.min(95, Math.max(0, affixChances[key as AffixType]));
  });

  const stabilityColor = totalStability >= 70 ? '#06D6A0' : totalStability >= 40 ? '#FFD166' : '#EF476F';

  const arcPath = (percentage: number) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    return {
      strokeDasharray: circumference,
      strokeDashoffset: offset,
    };
  };

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
        <Zap className="w-5 h-5 text-dream-gold" />
        编织计算器
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col items-center">
          <h4 className="text-sm font-medium text-dream-light/70 mb-3">稳定性</h4>
          <div className="relative w-36 h-36">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
              <circle
                cx="70"
                cy="70"
                r="60"
                fill="none"
                stroke="rgba(155, 93, 229, 0.2)"
                strokeWidth="12"
              />
              <motion.circle
                cx="70"
                cy="70"
                r="60"
                fill="none"
                stroke={stabilityColor}
                strokeWidth="12"
                strokeLinecap="round"
                initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
                animate={arcPath(totalStability)}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{ filter: `drop-shadow(0 0 8px ${stabilityColor})` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                key={totalStability}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl font-bold"
                style={{ color: stabilityColor }}
              >
                {Math.round(totalStability)}
              </motion.span>
              <span className="text-xs text-dream-light/50">/ 100</span>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <Shield className="w-4 h-4" style={{ color: stabilityColor }} />
            <span className="text-sm" style={{ color: stabilityColor }}>
              {totalStability >= 70 ? '非常稳定' : totalStability >= 40 ? '中等稳定' : '不稳定'}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <h4 className="text-sm font-medium text-dream-light/70 mb-3">星级评分</h4>
          <div className="flex items-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.div
                key={star}
                initial={{ scale: 0, rotate: -180 }}
                animate={{
                  scale: star <= displayStars ? 1 : 0.5,
                  rotate: 0,
                }}
                transition={{ delay: star * 0.1, type: 'spring' }}
              >
                <Star
                  className={`w-10 h-10 ${
                    star <= displayStars
                      ? 'text-dream-gold fill-dream-gold drop-shadow-[0_0_8px_rgba(255,209,102,0.6)]'
                      : 'text-dream-light/20'
                  }`}
                />
              </motion.div>
            ))}
          </div>
          <motion.span
            key={displayStars}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl font-bold gradient-text"
          >
            {displayStars}
          </motion.span>
          <span className="text-sm text-dream-light/50 mt-1">
            {displayStars >= 4 ? '传奇梦境' : displayStars >= 3 ? '优秀梦境' : displayStars >= 2 ? '普通梦境' : '基础梦境'}
          </span>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-dream-light/70 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-dream-purple" />
            词缀概率
          </h4>
          {(Object.entries(affixChances) as [AffixType, number][]).map(([affix, chance], index) => (
            <motion.div
              key={affix}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-1"
            >
              <div className="flex items-center justify-between text-xs">
                <AffixBadge affix={affix} size="sm" />
                <span className="font-mono" style={{ color: affixInfo[affix].color }}>
                  {chance.toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 bg-dream-purple/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${chance}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  style={{ backgroundColor: affixInfo[affix].color }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-dream-purple/20 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-dream-gold">{totalExpScore.toFixed(0)}</p>
          <p className="text-xs text-dream-light/50">经验评分</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-dream-purple">{selectedWeavers.length}</p>
          <p className="text-xs text-dream-light/50">编织师数量</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-dream-blue">{selectedElements.length}</p>
          <p className="text-xs text-dream-light/50">场景元素</p>
        </div>
      </div>
    </GlassCard>
  );
}
