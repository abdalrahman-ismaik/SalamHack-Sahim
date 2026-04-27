import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SectionHeadingProps {
  level?:       2 | 3 | 4;
  size?:        'lg' | 'md' | 'sm';
  align?:       'start' | 'center';
  label:        string;
  description?: string;
  className?:   string;
}

const sizeClasses = {
  lg: 'text-3xl font-bold',
  md: 'text-2xl font-semibold',
  sm: 'text-xl font-semibold',
};

const alignClasses = {
  start:  'text-start',
  center: 'text-center',
};

export function SectionHeading({
  level = 2,
  size = 'lg',
  align = 'start',
  label,
  description,
  className,
}: SectionHeadingProps) {
  const Tag = `h${level}` as 'h2' | 'h3' | 'h4';

  return (
    <div className={twMerge(clsx('space-y-2', alignClasses[align], className))}>
      <Tag className={clsx(sizeClasses[size], 'text-gray-900')}>{label}</Tag>
      {description && (
        <p className="text-gray-600 text-base">{description}</p>
      )}
    </div>
  );
}
