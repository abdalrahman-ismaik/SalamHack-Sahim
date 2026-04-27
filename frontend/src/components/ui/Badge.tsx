import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ReactNode } from 'react';

export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'outline' | 'gold' | 'pro' | 'enterprise';
  children: ReactNode;
  className?: string;
  glow?: boolean;
}

const variantClasses = {
  default:  'bg-white/10 text-white border border-white/10',
  success:  'bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30 shadow-[0_0_10px_rgba(0,230,118,0.1)]',
  warning:  'bg-[#FFB300]/15 text-[#FFB300] border border-[#FFB300]/30',
  error:    'bg-[#FF1744]/15 text-[#FF1744] border border-[#FF1744]/30 shadow-[0_0_10px_rgba(255,23,68,0.1)]',
  outline:  'border border-white/20 text-gray-300',
  gold:     'bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/40 shadow-[0_0_10px_rgba(197,160,89,0.15)]',
  pro:      'bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/40 shadow-[0_0_15px_rgba(0,230,118,0.2)]',
  enterprise: 'bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/40 shadow-[0_0_15px_rgba(197,160,89,0.2)]',
};

export function Badge({ variant = 'default', children, className, glow = false }: BadgeProps) {
  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm',
          variantClasses[variant],
          glow && 'animate-[pulse-gold_2s_ease-in-out_infinite]',
          className
        )
      )}
    >
      {children}
    </span>
  );
}
