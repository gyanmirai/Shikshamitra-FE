
import { Iconify } from 'src/components/iconify';
import { Box, Card, Stack, Typography } from '@mui/material';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';

import { displayValue, isFiniteValue } from '../insights/components/visualization-data';

import type { AcademicDesignMetric } from './academic-design-model';

export function AcademicDesignOverview({ metrics }: { metrics: AcademicDesignMetric[] }) {
  if (!metrics.length) return null;
  return <Box role="group" aria-label="Academic overview" sx={{ display: 'grid', gap: 2,
    gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: `repeat(${metrics.length}, minmax(0, 1fr))` } }}>
    {metrics.map((metric) => <Card key={metric.key} variant="outlined" sx={{ p: 1.5, minWidth: 0,
      borderRadius: 1, boxShadow: 'none', display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
      <Iconify icon={metric.icon} width={30} aria-hidden sx={{ color: 'text.secondary', mt: 0.75,
        flexShrink: 0, display: { xs: 'none', sm: 'block' } }} />
      <Stack spacing={0.25} sx={{ minWidth: 0 }}>
        <Box component="dl" sx={{ m: 0 }}>
          <Stack component="dt" direction="row" alignItems="center" gap={0.5}>
            <Typography component="span" variant="caption" color="text.secondary">{metric.label}</Typography>
            <InfoTooltipIcon title={metric.caption} label={`${metric.label} details`} />
          </Stack>
          <Typography component="dd" variant="h3" sx={{ m: 0, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere' }}>
            {displayValue(metric.value, metric.unit ?? undefined)}
            {isFiniteValue(metric.value) && isFiniteValue(metric.denominator) ? ` / ${displayValue(metric.denominator)}` : ''}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">{metric.caption}</Typography>
      </Stack>
    </Card>)}
  </Box>;
}
