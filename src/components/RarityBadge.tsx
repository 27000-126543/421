import { Rarity } from '../../shared/types';
import { cn } from '../lib/utils';

interface RarityBadgeProps {
  rarity: Rarity;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const rarityConfig: Record<Rarity, { label: string; bgColor: string; borderColor: string; textColor: string }> = {
  common: {
    label: '普通',
    bgColor: 'bg-gray-500/20',
    borderColor: 'border-gray-500',
    textColor: 'text-gray-400',
  },
  rare: {
    label: '稀有',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-400',
  },
  epic: {
    label: '史诗',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-400',
  },
  legendary: {
    label: '传说',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-400',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export default function RarityBadge({
  rarity,
  showText = true,
  size = 'md',
  className,
}: RarityBadgeProps) {
  const config = rarityConfig[rarity];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        config.bgColor,
        config.borderColor,
        config.textColor,
        sizeClasses[size],
        className
      )}
    >
      <span
        className={cn(
          'w-2 h-2 rounded-full',
          rarity === 'legendary' ? 'animate-pulse' : ''
        )}
        style={{ backgroundColor: config.textColor.includes('gray') ? '#9CA3AF' : config.textColor.includes('blue') ? '#3B82F6' : config.textColor.includes('purple') ? '#9B5DE5' : '#FFD166' }}
      />
      {showText && config.label}
    </span>
  );
}
