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
  children: React.ReactNode;
}

export function DashboardZone({ title, loading = false, children }: DashboardZoneProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {title && (
          <div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
        )}
        <div className="bg-[#121212] border border-[#2A2A2A] rounded-2xl h-48 animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {title && (
        <h2 className="text-sm font-semibold text-white uppercase tracking-wide opacity-60">
          {title}
        </h2>
      )}
      {children}
    </motion.div>
  );
}
