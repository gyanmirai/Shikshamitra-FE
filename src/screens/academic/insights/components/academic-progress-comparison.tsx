import type { AcademicInsightsSection } from 'src/redux/academicAPI/academicInsightsTypes';

import { Box, Stack, Typography } from '@mui/material';

import { ChartDataAlternative } from './chart-data-alternative';
import { displayValue, isFiniteValue, displaySeriesName } from './visualization-data';

export function AcademicProgressComparison({ section }: { section: AcademicInsightsSection }) {
  const target = section.series.find(
    (entry) =>
      /planned|target/i.test(entry.name) && entry.points.some((point) => isFiniteValue(point.value))
  );
  const recorded = section.series.filter((entry) => !/planned|target/i.test(entry.name));
  const aggregate = section.metrics.find(
    (metric) => metric.key === 'recorded-progress' && metric.unit === '%'
  );
  const maximum = Math.max(
    100,
    ...section.series.flatMap((entry) =>
      entry.points.filter((point) => isFiniteValue(point.value)).map((point) => point.value)
    )
  );

  return (
    <Stack spacing={2}>
      {aggregate && isFiniteValue(aggregate.value) && (
        <Stack
          role="group"
          aria-label="Syllabus progress summary"
          direction="row"
          alignItems="baseline"
          spacing={1.5}
          sx={{ pb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Typography variant="h3" component="span" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {displayValue(aggregate.value, '%')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {aggregate.label}
          </Typography>
        </Stack>
      )}
      {recorded.map((entry) => (
        <Stack key={entry.name} spacing={1.5}>
          <Typography variant="subtitle2">{displaySeriesName(entry.name)}</Typography>
          {entry.points.map((point) => {
            const planned = target?.points.find((sample) => sample.key === point.key)?.value;
            const known = isFiniteValue(point.value);
            return (
              <Box key={point.key}>
                <Stack
                  direction="row"
                  flexWrap="wrap"
                  justifyContent="space-between"
                  gap={1}
                  sx={{ mb: 1 }}
                >
                  <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                    {point.label}
                  </Typography>
                  <Typography variant="body2">
                    {displayValue(point.value, '%')}
                    {isFiniteValue(planned) ? ` / ${displayValue(planned, '%')} planned` : ''}
                  </Typography>
                </Stack>
                <Box
                  aria-hidden
                  sx={{
                    height: 10,
                    position: 'relative',
                    bgcolor: 'background.neutral',
                    borderRadius: 0.5,
                  }}
                >
                  {known && (
                    <Box
                      sx={{
                        height: 1,
                        width: `${(Math.max(0, point.value) / maximum) * 100}%`,
                        bgcolor: 'primary.main',
                        borderRadius: 0.5,
                      }}
                    />
                  )}
                  {isFiniteValue(planned) && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: `${(Math.max(0, planned) / maximum) * 100}%`,
                        top: -4,
                        height: 18,
                        width: 2,
                        bgcolor: 'text.primary',
                      }}
                    />
                  )}
                </Box>
              </Box>
            );
          })}
        </Stack>
      ))}
      <Typography variant="caption" color="text.secondary">
        Recorded delivery (%) · scale 0 to {maximum}%{target ? ' · marker: planned target' : ''}
      </Typography>
      <ChartDataAlternative series={section.series} unit="%" />
    </Stack>
  );
}
