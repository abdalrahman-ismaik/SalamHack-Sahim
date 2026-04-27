import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ReactNode, ElementType } from 'react';

export interface CardProps {
  children:   ReactNode;
  className?: string;
  as?:        'div' | 'article' | 'section';
  variant?:   'default' | 'glass' | 'gold' | 'elevated';
  hover?:     boolean;
}

const variantClasses = {
  default:  'bg-[#121212] border border-[#2A2A2A]',
  glass:    'glass border border-white/10',
  gold:     'bg-[#121212] border border-[#C5A059]/30 shadow-[0_0_30px_rgba(197,160,89,0.08)]',
  elevated: 'bg-[#121212] border border-[#2A2A2A] shadow-[0_20px_60px_rgba(0,0,0,0.6)]',
};

export function Card({ children, className, as: Tag = 'div', variant = 'default', hover = false }: CardProps) {
  return (
    <Tag
      className={twMerge(
        clsx(
          'rounded-xl p-6 transition-all duration-300',
          variantClasses[variant],
          hover && 'hover:border-[#C5A059]/40 hover:shadow-[0_0_30px_rgba(197,160,89,0.1)] hover:-translate-y-1',
          className
        )
      )}
    >
      {children}
    </Tag>
  );
}
