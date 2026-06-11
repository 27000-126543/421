import { cn } from '../lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'w-6 h-6 border-2',
  md: 'w-10 h-10 border-3',
  lg: 'w-16 h-16 border-4',
  xl: 'w-24 h-24 border-4',
};

export default function LoadingSpinner({
  size = 'md',
  text,
  className,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4',
        fullScreen ? 'min-h-screen' : '',
        className
      )}
    >
      <div className="relative">
        <div
          className={cn(
            'rounded-full border-dream-purple/30 animate-spin',
            sizeClasses[size]
          )}
          style={{
            borderTopColor: '#9B5DE5',
            borderRightColor: '#4ECDC4',
            animationDuration: '1s',
          }}
        />
        <div
          className={cn(
            'absolute inset-0 rounded-full animate-pulse',
            sizeClasses[size]
          )}
          style={{
            background:
              'conic-gradient(from 0deg, transparent, #9B5DE5, transparent, #4ECDC4, transparent)',
            opacity: 0.3,
            animationDuration: '2s',
          }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ animation: 'spin 3s linear infinite' }}
        >
          <span
            className={cn(
              size === 'xl' ? 'text-3xl' : size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-sm'
            )}
          >
            ✨
          </span>
        </div>
      </div>

      {text && (
        <p className="text-dream-light/80 font-medium animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-dream-dark/90 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
