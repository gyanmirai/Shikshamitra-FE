import type { AcademicInsightsSection } from 'src/redux/academicAPI/academicInsightsTypes';

import { Stack, Typography, LinearProgress } from '@mui/material';

import { AcademicSeriesChart } from './academic-series-chart';
import { displayValue, usableSeries, isFiniteValue } from './visualization-data';

export function AcademicStudentVisualization({ section }: { section: AcademicInsightsSection }) {
  const series = usableSeries(section.series);
  const hasCoordinates = series.some((entry) =>
    entry.points.some((point) => isFiniteValue(point.x) && isFiniteValue(point.y))
  );
  const counts = series.filter((entry) => entry.name !== 'attendance-score');
  if (hasCoordinates) return <AcademicSeriesChart section={section} />;
  if (counts.length > 0) return <AcademicSeriesChart section={{ ...section, series: counts }} />;
  const percentages = section.metrics.filter((metric) => metric.unit === '%');

  return (
    <Stack spacing={2}>
      {percentages.map((metric) => (
        <Stack key={metric.key} spacing={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" gap={2}>
            <Typography variant="body2">{metric.label}</Typography>
            <Typography variant="subtitle2">{displayValue(metric.value, '%')}</Typography>
          </Stack>
          {isFiniteValue(metric.value) && (
            <LinearProgress
              variant="determinate"
              value={Math.max(0, Math.min(100, metric.value))}
              aria-label={metric.label}
              aria-valuetext={displayValue(metric.value, '%')}
              sx={{ height: 8, borderRadius: 0.5 }}
            />
          )}
        </Stack>
      ))}
      {percentages.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No comparable student samples are available.
        </Typography>
      )}
    </Stack>
  );
}
