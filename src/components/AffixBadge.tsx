import { AffixType } from '../../shared/types';
import { cn } from '../lib/utils';

interface AffixBadgeProps {
  affix: AffixType;
  type?: AffixType;
  size?: 'sm' | 'md';
  showText?: boolean;
  className?: string;
}

const affixConfig: Record<AffixType, { label: string; icon: string; color: string; description: string }> = {
  lucid: {
    label: '清醒',
    icon: '✨',
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50',
    description: '保持意识清醒',
  },
  precognition: {
    label: '预知',
    icon: '🔮',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    description: '预见未来事件',
  },
  nightmare: {
    label: '噩梦',
    icon: '💀',
    color: 'bg-red-500/20 text-red-400 border-red-500/50',
    description: '恐怖的梦境',
  },
  stable: {
    label: '稳定',
    icon: '🛡️',
    color: 'bg-green-500/20 text-green-400 border-green-500/50',
    description: '梦境不易崩塌',
  },
  chaotic: {
    label: '混沌',
    icon: '🌀',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    description: '规则混乱',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-3 py-1 text-sm gap-1.5',
};

export default function AffixBadge({ affix, type, size = 'md', showText = true, className }: AffixBadgeProps) {
  const actualAffix = type || affix;
  const config = affixConfig[actualAffix];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium tooltip',
        config.color,
        sizeClasses[size],
        className
      )}
      data-tip={config.description}
    >
      <span>{config.icon}</span>
      {showText && config.label}
    </span>
  );
}
