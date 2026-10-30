import type { AcademicInsightsSection } from 'src/redux/academicAPI/academicInsightsTypes';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Typography } from '@mui/material';

import { ChartDataAlternative } from '../insights/components/chart-data-alternative';
import { displayValue, isFiniteValue } from '../insights/components/visualization-data';

export function AcademicDesignMapping({ section }: { section: AcademicInsightsSection }) {
  const points = section.series.flatMap((series) => series.points);
  const preview = [...points].sort((a, b) => Number(b.status === 'mapped') - Number(a.status === 'mapped')).slice(0, 6);
  const mapped = section.metrics.find((metric) => metric.key === 'mapped')?.value;
  const total = section.metrics.find((metric) => metric.key === 'divisions')?.value;
  const unassigned = isFiniteValue(total) && isFiniteValue(mapped) && mapped <= total ? total - mapped : null;
  return <Stack spacing={1.5}>
    <Typography variant="caption" color="text.secondary">
      {displayValue(mapped)} assigned · {displayValue(unassigned)} unassigned · {displayValue(total)} total divisions
    </Typography>
    <Box component="ul" aria-label="Class teacher mapping" sx={{ m: 0, p: 0, listStyle: 'none',
      display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 1 }}>
      {preview.map((point) => <Stack component="li" direction="row" alignItems="center" gap={1} key={point.key}
        sx={{ p: 1, minWidth: 0, borderRadius: 0.75, border: '1px solid',
          borderColor: point.status === 'mapped' ? 'primary.dark' : 'divider',
          bgcolor: point.status === 'mapped' ? 'primary.dark' : 'background.neutral',
          color: point.status === 'mapped' ? 'common.white' : 'text.primary' }}>
        <Iconify icon={point.status === 'mapped' ? GlobalIcons.tick : GlobalIcons.family} width={20} sx={{ flexShrink: 0 }} aria-hidden />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{point.label}</Typography>
          <Typography variant="caption">{point.status === 'mapped' ? 'Teacher assigned' : point.status === 'unmapped' ? 'No class teacher' : 'Status unavailable'}</Typography>
        </Box>
      </Stack>)}
    </Box>
    <Typography variant="caption" color="text.secondary">Showing {preview.length} of {points.length} returned divisions.</Typography>
    <ChartDataAlternative series={section.series} />
  </Stack>;
}
