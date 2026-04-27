import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SectionHeadingProps {
  id?:          string;
  level?:       2 | 3 | 4;
  size?:        'lg' | 'md' | 'sm';
  align?:       'start' | 'center';
  label:        string;
  description?: string;
  className?:   string;
  glow?:        boolean;
}

const sizeClasses = {
  lg: 'text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight',
  md: 'text-2xl md:text-3xl font-semibold tracking-tight',
  sm: 'text-xl font-semibold',
};

const alignClasses = {
  start:  'text-start',
  center: 'text-center',
};

export function SectionHeading({
  id,
  level = 2,
  size = 'lg',
  align = 'start',
  label,
  description,
  className,
  glow = false,
}: SectionHeadingProps) {
  const Tag = `h${level}` as 'h2' | 'h3' | 'h4';

  return (
    <div className={twMerge(clsx('space-y-3', alignClasses[align], className))}>
      <Tag id={id} className={clsx(sizeClasses[size], 'text-white relative inline-block')}>
        {glow && (
          <span className="absolute -inset-1 bg-gradient-to-r from-[#C5A059]/20 to-[#00E676]/20 blur-xl rounded-full" aria-hidden="true" />
        )}
        <span className="relative">{label}</span>
      </Tag>
      {description && (
        <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {/* Decorative underline */}
      {align === 'center' && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#C5A059]" />
          <div className="h-1 w-1 rounded-full bg-[#C5A059]" />
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#C5A059]" />
        </div>
      )}
    </div>
  );
}
