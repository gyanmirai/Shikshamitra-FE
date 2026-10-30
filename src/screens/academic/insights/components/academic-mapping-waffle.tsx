import type { AcademicInsightsSection } from 'src/redux/academicAPI/academicInsightsTypes';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Typography } from '@mui/material';

import { ChartDataAlternative } from './chart-data-alternative';
import { displayValue, isFiniteValue } from './visualization-data';

export function AcademicMappingWaffle({ section }: { section: AcademicInsightsSection }) {
  const points = section.series.flatMap((entry) => entry.points);
  const preview = [...points]
    .sort((a, b) => Number(b.status === 'mapped') - Number(a.status === 'mapped'))
    .slice(0, 12);
  const metricCount = (key: string) => {
    const value = section.metrics.find((metric) => metric.key === key)?.value;
    return isFiniteValue(value) && Number.isInteger(value) && value >= 0 ? value : null;
  };
  const total = metricCount('divisions');
  const mapped = metricCount('mapped');
  const unmapped = total !== null && mapped !== null && mapped <= total ? total - mapped : null;
  const totals = [
    ['Total divisions', total],
    ['Teacher assigned', mapped],
    ['Needs assignment', unmapped],
  ] as const;
  return (
    <Stack spacing={1.5}>
      <Box
        component="dl"
        role="group"
        aria-label="Mapping totals"
        sx={{ m: 0, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1 }}
      >
        {totals.map(([label, value]) => (
          <Box key={label}>
            <Typography component="dt" variant="caption" color="text.secondary">
              {label}
            </Typography>
            <Typography component="dd" variant="subtitle1" sx={{ m: 0, overflowWrap: 'anywhere' }}>
              {displayValue(value)}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box
        component="ul"
        aria-label="Class teacher mapping"
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
          gap: 1,
          listStyle: 'none',
          m: 0,
          p: 0,
        }}
      >
        {preview.map((point) => (
          <Box
            component="li"
            key={point.key}
            sx={{
              border: '2px solid',
              borderColor: point.status === 'mapped' ? 'primary.main' : 'divider',
              borderRadius: 1,
              p: 1,
              minWidth: 0,
              bgcolor: point.status === 'mapped' ? 'primary.dark' : 'background.neutral',
              color: point.status === 'mapped' ? 'common.white' : 'text.primary',
            }}
          >
            <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
              {point.label}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
              {point.status === 'mapped' && (
                <Iconify icon={GlobalIcons.tick} width={16} sx={{ flexShrink: 0 }} />
              )}
              <Typography
                variant="caption"
                color={point.status === 'mapped' ? 'inherit' : 'text.secondary'}
              >
                {point.status === 'mapped'
                  ? 'Teacher assigned'
                  : point.status === 'unmapped'
                    ? 'No class teacher'
                    : 'Status unavailable'}
              </Typography>
            </Stack>
          </Box>
        ))}
      </Box>
      <Typography variant="caption" color="text.secondary">
        Showing {preview.length} of {points.length} returned divisions.
      </Typography>
      <ChartDataAlternative series={section.series} />
    </Stack>
  );
}
