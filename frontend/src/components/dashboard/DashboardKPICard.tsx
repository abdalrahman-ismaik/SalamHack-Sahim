/**
 * DashboardKPICard — Individual KPI display card
 *
 * Renders a single key performance indicator with animated skeleton loading.
 * Features:
 * - Gold accent icon
 * - Primary value (large) + subtitle (small)
 * - Optional CTA link
 * - Pulse animation during loading
 *
 * Props:
 *   label: Card title (e.g., "عدد الأسهم")
 *   value: Primary number or string (e.g., "12")
 *   subtitle?: Secondary text (e.g., "في المحفظة")
 *   icon?: React component (Lucide icon, custom SVG)
 *   cta?: { label: string, href: string } — optional link button
 *   loading: boolean — show skeleton when true
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/motion';

export interface DashboardKPICardProps {
  label: string;
  value: string | number | null;
  subtitle?: string;
  icon?: React.ReactNode;
  cta?: { label: string; href: string };
  loading?: boolean;
  tone?: 'gold' | 'green' | 'amber' | 'blue';
}

const toneClasses = {
  gold: {
    icon: 'border-[#C5A059]/25 bg-[#C5A059]/10 text-[#E8D4B0]',
    glow: 'from-[#C5A059]/20',
    value: 'text-[#F4E5C8]',
  },
  green: {
    icon: 'border-[#00E676]/25 bg-[#00E676]/10 text-[#7CFFBA]',
    glow: 'from-[#00E676]/15',
    value: 'text-[#DFFFEF]',
  },
  amber: {
    icon: 'border-[#FFB300]/25 bg-[#FFB300]/10 text-[#FFD67A]',
    glow: 'from-[#FFB300]/15',
    value: 'text-[#FFE7AD]',
  },
  blue: {
    icon: 'border-sky-300/20 bg-sky-300/10 text-sky-200',
    glow: 'from-sky-300/15',
    value: 'text-sky-50',
  },
};

export function DashboardKPICard({
  label,
  value,
  subtitle,
  icon,
  cta,
  loading = false,
  tone = 'gold',
}: DashboardKPICardProps) {
  const locale = useLocale();
  const styles = toneClasses[tone];

  const getLocalizedHref = (href: string) => {
    if (href.startsWith(`/${locale}/`)) {
      return href;
    }
    if (href.startsWith('/')) {
      return `/${locale}${href}`;
    }
    return `/${locale}/${href}`;
  };

  if (loading) {
    return (
      <div className="min-h-[176px] rounded-xl border border-white/10 bg-white/[0.035] px-5 py-5">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
          <div className="h-10 w-10 animate-pulse rounded-lg bg-white/10" />
        </div>
        <div className="mt-8 space-y-3">
          <div className="h-8 w-20 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-36 animate-pulse rounded bg-white/10" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="group relative min-h-[176px] overflow-hidden rounded-xl border border-white/10 bg-[#101010]/85 px-5 py-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C5A059]/30 hover:bg-[#141414]"
    >
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${styles.glow} to-transparent opacity-70`} />
      {/* Header: Label + Icon */}
      <div className="relative flex items-start justify-between gap-4">
        <h3 className="text-sm font-medium leading-5 text-white/62">{label}</h3>
        {icon && (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${styles.icon}`}>
            {icon}
          </div>
        )}
      </div>

      {/* Primary Value */}
      <div className="relative mt-6">
        <p className={`text-2xl font-semibold leading-tight tracking-normal md:text-3xl ${styles.value}`}>
          {value ?? '—'}
        </p>
        {subtitle && <p className="mt-2 text-xs leading-5 text-white/45">{subtitle}</p>}
      </div>

      {/* CTA Link (optional) */}
      {cta && (
        <Link
          href={getLocalizedHref(cta.href)}
          role="button"
          tabIndex={0}
          className="relative mt-4 inline-flex items-center rounded-full border border-[#C5A059]/25 bg-[#C5A059]/10 px-3 py-1.5 text-xs font-semibold text-[#E8D4B0] transition-colors hover:border-[#C5A059]/45 hover:bg-[#C5A059]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]"
        >
          {cta.label} →
        </Link>
      )}
    </motion.div>
  );
}
