import { cn } from '../lib/utils';

interface EnergyBarProps {
  current: number;
  max: number;
  label?: string;
  showValue?: boolean;
  showLabel?: boolean;
  color?: 'cyan' | 'purple' | 'green' | 'red' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animate?: boolean;
}

const colorClasses = {
  cyan: 'from-cyan-400 to-dream-blue',
  purple: 'from-purple-400 to-dream-purple',
  green: 'from-emerald-400 to-dream-green',
  red: 'from-red-400 to-dream-red',
  gold: 'from-yellow-400 to-dream-gold',
};

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export default function EnergyBar({
  current,
  max,
  label,
  showValue = false,
  showLabel = false,
  color = 'cyan',
  size = 'md',
  className,
  animate = true,
}: EnergyBarProps) {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className="text-xs text-dream-light/70 font-medium">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-xs text-dream-light font-mono">
              {Math.floor(current)} / {max}
            </span>
          )}
        </div>
      )}
      <div className={cn('energy-bar', sizeClasses[size])}>
        <div
          className={cn(
            'energy-bar-fill bg-gradient-to-r',
            colorClasses[color],
            animate ? 'transition-all duration-500 ease-out' : ''
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
