'use client';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { ShinyText } from './ShinyText';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'gold' | 'glow';
  size?:    'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

const variantShine: Record<string, { color: string; shineColor: string }> = {
  default:     { color: '#1a1a1a',  shineColor: '#888888' },
  outline:     { color: '#C5A059',  shineColor: '#F5E6C0' },
  ghost:       { color: '#9ca3af',  shineColor: '#ffffff' },
  destructive: { color: '#ffffff',  shineColor: '#ffcccc' },
  gold:        { color: '#111111',  shineColor: '#ffffff' },
  glow:        { color: '#00E676',  shineColor: '#80FFB8' },
};

const variantClasses = {
  default:     'bg-[#C5A059] text-black hover:bg-[#D4AF37] focus-visible:ring-[#C5A059] shadow-[0_0_20px_rgba(197,160,89,0.3)]',
  outline:     'border border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059]/10 focus-visible:ring-[#C5A059]',
  ghost:       'text-gray-300 hover:bg-white/5 hover:text-white focus-visible:ring-white/50',
  destructive: 'bg-[#FF1744] text-white hover:bg-[#FF4569] focus-visible:ring-[#FF1744]',
  gold:        'bg-gradient-to-r from-[#C5A059] to-[#D4AF37] text-black hover:from-[#D4AF37] hover:to-[#E5C158] focus-visible:ring-[#C5A059] shadow-[0_0_30px_rgba(197,160,89,0.4)]',
  glow:        'bg-transparent border border-[#00E676]/50 text-[#00E676] hover:bg-[#00E676]/10 hover:shadow-[0_0_20px_rgba(0,230,118,0.3)] focus-visible:ring-[#00E676]',
};

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5 text-base',
  lg: 'px-8 py-3.5 text-lg',
};

export function Button({
  variant = 'default',
  size = 'md',
  loading = false,
  children,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...rest}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-all duration-300',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
          'disabled:opacity-40 disabled:pointer-events-none',
          'active:scale-[0.98]',
          variantClasses[variant],
          sizeClasses[size],
          className
        )
      )}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      <ShinyText
        color={variantShine[variant].color}
        shineColor={variantShine[variant].shineColor}
        speed={3}
        delay={1.5}
      >
        {children}
      </ShinyText>
    </button>
  );
}
