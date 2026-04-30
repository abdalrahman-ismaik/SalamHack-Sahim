/**
 * DashboardZone — Wrapper component for dashboard layout sections
 *
 * Provides consistent styling, optional title, and skeleton loading.
 * Wraps dashboard zones (Zones 1–6) for consistent UX.
 *
 * Props:
 *   title?: string — optional zone title
 *   loading?: boolean — show skeleton when true
 *   children: React.ReactNode — zone content
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/motion';

export interface DashboardZoneProps {
  title?: string;
  loading?: boolean;
  density?: 'default' | 'edge';
  children: React.ReactNode;
}

export function DashboardZone({
  title,
  loading = false,
  density = 'default',
  children,
}: DashboardZoneProps) {
  if (loading) {
    return (
      <div className={density === 'edge' ? 'space-y-3' : 'space-y-3'}>
        {title && (
          <div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
        )}
        <div className="h-48 animate-pulse rounded-xl border border-white/10 bg-white/[0.04]" />
      </div>
    );
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className={density === 'edge' ? 'space-y-3' : 'space-y-4'}
    >
      {title && (
        <h2 className="text-sm font-semibold text-white/70">
          {title}
        </h2>
      )}
      {children}
    </motion.div>
  );
}
