import { Player } from '../../shared/types';
import { cn } from '../lib/utils';
import { User } from 'lucide-react';

interface PlayerAvatarProps {
  player?: Pick<Player, 'avatar' | 'nickname' | 'level'> & { isOnline?: boolean };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showLevel?: boolean;
  showOnline?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

const levelSizeClasses = {
  xs: 'w-4 h-4 text-[10px] -bottom-1 -right-1',
  sm: 'w-5 h-5 text-[10px] -bottom-1 -right-1',
  md: 'w-6 h-6 text-xs -bottom-1 -right-1',
  lg: 'w-7 h-7 text-sm -bottom-1 -right-2',
  xl: 'w-8 h-8 text-base -bottom-2 -right-2',
};

export default function PlayerAvatar({
  player,
  size = 'md',
  showLevel = false,
  className,
}: PlayerAvatarProps) {
  return (
    <div className={cn('relative inline-block', className)}>
      <div
        className={cn(
          'rounded-full overflow-hidden bg-gradient-to-br from-dream-purple to-dream-blue flex items-center justify-center',
          sizeClasses[size]
        )}
      >
        {player?.avatar ? (
          <img
            src={player.avatar}
            alt={player.nickname}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-1/2 h-1/2 text-white/80" />
        )}
      </div>

      {showLevel && player?.level !== undefined && (
        <div
          className={cn(
            'absolute rounded-full bg-gradient-to-br from-dream-gold to-yellow-500 text-dream-dark font-bold flex items-center justify-center border-2 border-dream-dark',
            levelSizeClasses[size]
          )}
        >
          {player.level}
        </div>
      )}
    </div>
  );
}
