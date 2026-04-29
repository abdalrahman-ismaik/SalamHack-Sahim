/**
 * Chart.js Global Component Registry
 *
 * Centralized registration of all Chart.js elements, scales, and plugins
 * used across the dashboard. This ensures:
 * - Consistent configuration across all chart components
 * - Minimal re-registration overhead (one-time initialization)
 * - Easy auditing of which Chart.js features are enabled
 *
 * All dashboard charts import from this registry to prevent duplicate registration errors.
 *
 * Features registered:
 * - Line, Bar, Doughnut (Arc), and other chart types
 * - LinearScale and CategoryScale for axes
 * - Tooltip and Legend plugins
 * - Filler plugin for confidence interval shading (ARIMA chart)
 */

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register all dashboard chart components globally
ChartJS.register(
  CategoryScale,    // X-axis for categorical data (sectors, dates)
  LinearScale,      // Y-axis for numerical values
  PointElement,     // Individual data points on line charts
  LineElement,      // Line segments connecting points (ARIMA forecasts)
  BarElement,       // Bar rectangles (sector performance)
  ArcElement,       // Pie/doughnut arcs (portfolio, risk gauge, etc.)
  Tooltip,          // Interactive data tooltips
  Legend,           // Chart legends
  Filler            // Area fills between lines (confidence intervals)
);

export default ChartJS;
