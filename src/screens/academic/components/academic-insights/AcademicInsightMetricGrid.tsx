'use client';

import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Grid, Paper, Skeleton, Typography } from '@mui/material';

import type { AcademicInsightMetric } from './types';

type Props = {
  metrics: AcademicInsightMetric[];
  isLoading: boolean;
  onMetricClick: (metric: AcademicInsightMetric) => void;
};

const METRIC_TONES = ['primary', 'info', 'success', 'warning'] as const;

export function AcademicInsightMetricGrid({ metrics, isLoading, onMetricClick }: Props) {
  if (isLoading) {
    return (
      <Grid container spacing={1} aria-label="Loading academic insight metrics">
        {Array.from({ length: 4 }).map((_, index) => (
          <Grid key={index} size={{ xs: 6 }}>
            <Skeleton variant="rounded" height={98} sx={{ borderRadius: 1.5 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={1}>
      {metrics.map((metric, index) => {
        const interactive = Boolean(metric.onClick);
        const tone = METRIC_TONES[index % METRIC_TONES.length];

        return (
          <Grid key={metric.id} size={{ xs: 6 }}>
            <Paper
              component={interactive ? 'button' : 'div'}
              type={interactive ? 'button' : undefined}
              variant="outlined"
              aria-pressed={interactive ? metric.selected : undefined}
              onClick={interactive ? () => onMetricClick(metric) : undefined}
              sx={{
                width: 1,
                minHeight: 98,
                p: 1.5,
                borderRadius: 1.5,
                borderColor: metric.selected ? `${tone}.main` : 'divider',
                bgcolor: metric.selected
                  ? (theme) => varAlpha(theme.vars.palette[tone].mainChannel, 0.06)
                  : 'background.paper',
                color: 'text.primary',
                textAlign: 'left',
                cursor: interactive ? 'pointer' : 'default',
                transition: (theme) =>
                  theme.transitions.create(['border-color', 'background-color']),
                '&:hover': interactive
                  ? { borderColor: `${tone}.main`, bgcolor: 'action.hover' }
                  : undefined,
              }}
            >
              <Box
                sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
              >
                <Box>
                  <Typography variant="h5" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {metric.value}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                    {metric.label}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: 1.25,
                    color: `${tone}.main`,
                    bgcolor: (theme) => varAlpha(theme.vars.palette[tone].mainChannel, 0.1),
                  }}
                >
                  <Iconify icon={metric.icon} width={20} />
                </Box>
              </Box>
              {metric.helper && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mt: 0.75 }}
                >
                  {metric.helper}
                </Typography>
              )}
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
}
