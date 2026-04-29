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
}

export function DashboardKPICard({
  label,
  value,
  subtitle,
  icon,
  cta,
  loading = false,
}: DashboardKPICardProps) {
  const locale = useLocale();

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
      <div className="bg-[#121212] border border-[#2A2A2A] rounded-2xl px-6 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
          <div className="h-8 w-8 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
          <div className="h-3 w-32 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="bg-white/5 border border-white/10 rounded-2xl px-6 py-6 space-y-3 hover:bg-white/[0.07] transition-colors"
    >
      {/* Header: Label + Icon */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-400">{label}</h3>
        {icon && <div className="text-[#C5A059] w-6 h-6">{icon}</div>}
      </div>

      {/* Primary Value */}
      <div>
        <p className="text-3xl font-bold text-white">
          {value ?? '—'}
        </p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>

      {/* CTA Link (optional) */}
      {cta && (
        <Link
          href={getLocalizedHref(cta.href)}
          role="button"
          tabIndex={0}
          className="inline-block mt-3 text-xs text-[#C5A059] hover:text-[#E8D4B0] font-semibold transition-colors"
        >
          {cta.label} →
        </Link>
      )}
    </motion.div>
  );
}
