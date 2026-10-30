import type { AcademicInsightsSection } from 'src/redux/academicAPI/academicInsightsTypes';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Typography } from '@mui/material';

import { ChartDataAlternative } from '../insights/components/chart-data-alternative';
import { displayValue, isFiniteValue } from '../insights/components/visualization-data';

export function AcademicDesignSyllabus({ section }: { section: AcademicInsightsSection }) {
  const aggregate = section.metrics.find((metric) => metric.key === 'recorded-progress' && metric.unit === '%');
  const recorded = section.series.filter((series) => !/planned|target/i.test(series.name));
  const target = section.series.find((series) => /planned|target/i.test(series.name));
  return <Stack spacing={1.5}>
    {aggregate && isFiniteValue(aggregate.value) && <Stack role="group" aria-label="Syllabus progress summary"
      direction="row" alignItems="baseline" gap={1.5} sx={{ pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Typography component="span" variant="h3" sx={{ lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>{displayValue(aggregate.value, '%')}</Typography>
      <Typography variant="caption" color="text.secondary">{aggregate.label}</Typography>
    </Stack>}
    <Box component="ul" aria-label="Recorded syllabus progress" sx={{ m: 0, p: 0, listStyle: 'none' }}>
      {recorded.flatMap((series) => series.points.map((point) => {
        const planned = target?.points.find((entry) => entry.key === point.key)?.value;
        return <Box component="li" key={`${series.name}:${point.key}`} sx={{ display: 'grid', alignItems: 'center',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr) auto',
          gap: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
            <Iconify icon={GlobalIcons.notebook} width={20} aria-hidden sx={{ color: 'text.secondary', flexShrink: 0 }} />
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{point.label}</Typography>
          </Stack>
          <Box aria-hidden sx={{ height: 10, bgcolor: 'background.neutral', borderRadius: 0.5 }}>
            {isFiniteValue(point.value) && <Box sx={{ height: 1, width: `${Math.max(0, Math.min(100, point.value))}%`,
              bgcolor: 'primary.main', borderRadius: 0.5 }} />}
          </Box>
          <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>{displayValue(point.value, '%')}
            {isFiniteValue(planned) ? ` / ${displayValue(planned, '%')} planned` : ''}</Typography>
        </Box>;
      }))}
    </Box>
    <ChartDataAlternative series={section.series} unit="%" />
  </Stack>;
}
