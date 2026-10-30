import type { AcademicInsightsSection } from 'src/redux/academicAPI/academicInsightsTypes';

import { Box, Stack, Typography } from '@mui/material';

import { ChartDataAlternative } from './chart-data-alternative';
import { displayValue, isFiniteValue } from './visualization-data';
import { AcademicWeekdayColumns } from './academic-weekday-columns';

export function AcademicWeeklyTimetable({ section }: { section: AcademicInsightsSection }) {
  const points = section.series.flatMap((series) => series.points);
  const days = Array.from(
    new Set(
      points.flatMap((point) =>
        isFiniteValue(point.x) && Number.isInteger(point.x) && point.x >= 0 && point.x <= 6
          ? [point.x]
          : []
      )
    )
  )
    .sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7))
    .map((day) => {
      const samples = points.filter((point) => point.x === day);
      const count = samples.every((point) => isFiniteValue(point.value) && point.value >= 0)
        ? samples.reduce((sum, point) => sum + point.value, 0)
        : null;
      return { day, count };
    });
  const knownCounts = days.flatMap(({ count }) => (isFiniteValue(count) ? [count] : []));
  const total =
    knownCounts.length === days.length && days.length > 0
      ? knownCounts.reduce((sum, count) => sum + count, 0)
      : null;
  const timetableCount = section.metrics.find((metric) => metric.key === 'timetables')?.value;

  return (
    <Stack spacing={2}>
      <Box component="dl" sx={{ display: 'flex', gap: 4, m: 0, flexWrap: 'wrap' }}>
        {(
          [
            ['Saved timetables', timetableCount],
            ['Weekly entries', total],
          ] as const
        ).map(([label, value]) => (
          <Box key={label}>
            <Typography component="dt" variant="caption" color="text.secondary">
              {label}
            </Typography>
            <Typography
              component="dd"
              variant="h4"
              sx={{ m: 0, fontVariantNumeric: 'tabular-nums' }}
            >
              {displayValue(value)}
            </Typography>
          </Box>
        ))}
      </Box>
      <Typography variant="body2" color="text.secondary">
        Timetable entries per day across the selected divisions.
      </Typography>
      <AcademicWeekdayColumns days={days} />
      <Typography variant="caption" color="text.secondary">
        Open timetable management for the period-by-period schedule.
      </Typography>
      <ChartDataAlternative
        series={section.series}
        coordinateLabels={['Weekday (0=Sunday)', 'Period']}
        valueLabel="Timetable entries"
      />
    </Stack>
  );
}
