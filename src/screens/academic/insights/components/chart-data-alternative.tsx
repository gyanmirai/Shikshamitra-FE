import type { AcademicInsightsSeries } from 'src/redux/academicAPI/academicInsightsTypes';

import { Box, Stack, Typography } from '@mui/material';

import { displayValue, displaySeriesName } from './visualization-data';

const screenReaderOnly = {
  border: 0, margin: -1, padding: 0, width: '1px', height: '1px',
  overflow: 'hidden', position: 'absolute', whiteSpace: 'nowrap', clip: 'rect(0 0 0 0)',
} as const;

export function ChartDataAlternative({
  series,
  coordinateLabels,
  unit,
  valueLabel,
}: {
  series: AcademicInsightsSeries[];
  coordinateLabels?: [string, string];
  unit?: string;
  valueLabel?: string;
}) {
  return (
    <Box role="group" aria-label="Chart data" sx={screenReaderOnly}>
      <Stack spacing={1.5}>
        {series.map((entry, index) => (
          <Box key={`${entry.name}-${index}`}>
            <Typography variant="subtitle2">{displaySeriesName(entry.name)}</Typography>
            <Box component="dl" sx={{ m: 0 }}>
              {entry.points.map((point) => (
                <Stack
                  key={point.key}
                  direction="row"
                  justifyContent="space-between"
                  gap={2}
                  sx={{ py: 0.5 }}
                >
                  <Typography component="dt" variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                    {point.label}
                  </Typography>
                  <Typography component="dd" variant="body2" sx={{ m: 0, textAlign: 'right' }}>
                    {coordinateLabels
                      ? `${coordinateLabels[0]}: ${displayValue(point.x)}, ${coordinateLabels[1]}: ${displayValue(point.y)}`
                      : displayValue(point.value, unit)}
                    {coordinateLabels && valueLabel
                      ? `, ${valueLabel}: ${displayValue(point.value, unit)}`
                      : ''}
                    {point.status ? ` · ${point.status}` : ''}
                  </Typography>
                </Stack>
              ))}
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
