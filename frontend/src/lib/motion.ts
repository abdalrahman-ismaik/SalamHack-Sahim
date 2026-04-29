/**
 * Motion Variants — Shared Framer Motion Animations
 *
 * Standardized animation variants used across the dashboard for consistent,
 * accessible motion. All transitions use `ease: 'easeInOut'` and durations
 * tuned for fast perception (500ms entry, 300ms stagger).
 *
 * Variants exported:
 * - fadeInUp: Fade + translate-Y for card entries
 * - staggerContainer: Parent variant for orchestrating child animations
 * - pulse: Animated opacity pulse for loading skeletons
 */

import { Variants } from 'framer-motion';

export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

/**
 * Pulse animation for loading skeletons
 */
export const pulse: Variants = {
  pulse: {
    opacity: [1, 0.5, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};
