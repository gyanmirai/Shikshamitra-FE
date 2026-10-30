import { Box, Typography } from '@mui/material';
import { formatNumber } from 'src/utils/formate_number';

import type { DashboardFocusUnit, DashboardFocusMetric } from './dashboard-focus-types';

export function formatFocusValue(value: number | null, unit?: DashboardFocusUnit) {
  if (value === null || !Number.isFinite(value)) return 'Unavailable';
  if (unit === 'INR') return formatNumber(value, 'INR');
  const number = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);
  return unit === 'percent' ? `${number}%` : number;
}

export function DashboardFocusMetrics({ metrics, unit }: {
  metrics: DashboardFocusMetric[]; unit?: DashboardFocusUnit;
}) {
  if (!metrics.length) return null;
  return (
    <Box component="dl" sx={{ m: 0, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      {metrics.map((metric) => (
        <Box key={metric.key} sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
          <Typography component="dt" variant="caption" color="text.secondary">{metric.label}</Typography>
          <Typography component="dd" variant="h5" sx={{ m: 0, color: 'text.primary' }}>
            {formatFocusValue(metric.value, metric.unit ?? unit)}
          </Typography>
          {metric.description && <Typography variant="caption" color="text.secondary">
            {metric.description}
          </Typography>}
        </Box>
      ))}
    </Box>
  );
}
