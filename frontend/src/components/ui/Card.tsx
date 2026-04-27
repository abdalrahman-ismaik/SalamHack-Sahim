import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ReactNode, ElementType } from 'react';

export interface CardProps {
  children:   ReactNode;
  className?: string;
  as?:        'div' | 'article' | 'section';
}

export function Card({ children, className, as: Tag = 'div' }: CardProps) {
  return (
    <Tag
      className={twMerge(
        clsx(
          'rounded-xl border border-gray-200 bg-white p-6 shadow-sm',
          className
        )
      )}
    >
      {children}
    </Tag>
  );
}
