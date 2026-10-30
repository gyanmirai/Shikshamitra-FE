import { Iconify } from 'src/components/iconify';
import { Box, Card, Stack, Typography } from '@mui/material';

import { getAcademicInsightsOverview } from './academic-insights-model';

import type { AcademicInsightsDisplayArea } from './academic-insights-model';

export function AcademicInsightsOverview({ areas }: { areas: AcademicInsightsDisplayArea[] }) {
  const metrics = getAcademicInsightsOverview(areas);
  if (!metrics.length) return null;
  return (
    <Box
      role="group"
      aria-label="Academic overview"
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: {
          xs: 'repeat(2, minmax(0, 1fr))',
          lg: `repeat(${metrics.length}, minmax(0, 1fr))`,
        },
      }}
    >
      {metrics.map((metric) => (
        <Card
          variant="outlined"
          key={metric.key}
          sx={{
            p: { xs: 1.5, sm: 2 },
            minWidth: 0,
            borderRadius: 2,
            boxShadow: 'none',
            display: 'flex',
            gap: 1.5,
            alignItems: 'flex-start',
          }}
        >
          <Iconify
            icon={metric.icon}
            width={28}
            aria-hidden
            sx={{
              color: 'text.secondary',
              flexShrink: 0,
              display: { xs: 'none', sm: 'block' },
              mt: 0.5,
            }}
          />
          <Stack component="dl" spacing={0.5} sx={{ m: 0, minWidth: 0 }}>
            <Typography component="dt" variant="body2" color="text.secondary">
              {metric.label}
            </Typography>
            <Typography
              component="dd"
              variant="h3"
              sx={{ m: 0, overflowWrap: 'anywhere', fontVariantNumeric: 'tabular-nums' }}
            >
              {new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(metric.value)}
              {metric.unit === '%' ? '%' : metric.unit ? ` ${metric.unit}` : ''}
            </Typography>
            <Typography component="div" variant="caption" color="text.secondary">
              {metric.context}
            </Typography>
          </Stack>
        </Card>
      ))}
    </Box>
  );
}
