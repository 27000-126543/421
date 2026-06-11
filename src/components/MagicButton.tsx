import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/utils';
import { Loader2 } from 'lucide-react';

interface MagicButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  glow?: boolean;
}

const variants = {
  primary: 'from-dream-purple to-dream-blue',
  secondary: 'from-gray-600 to-gray-700',
  danger: 'from-red-500 to-dream-red',
  success: 'from-dream-green to-emerald-500',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5',
  lg: 'px-8 py-4 text-lg',
};

export default function MagicButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  glow = true,
  disabled,
  ...props
}: MagicButtonProps) {
  return (
    <button
      className={cn(
        'magic-btn flex items-center justify-center gap-2 font-semibold',
        `bg-gradient-to-r ${variants[variant]}`,
        sizes[size],
        glow && 'hover:shadow-lg hover:shadow-dream-purple/30',
        disabled || loading ? 'opacity-60 cursor-not-allowed' : '',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
      {children}
    </button>
  );
}
