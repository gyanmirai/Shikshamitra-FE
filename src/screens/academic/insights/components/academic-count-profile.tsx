import type { AcademicInsightsSection } from 'src/redux/academicAPI/academicInsightsTypes';

import { Box, Stack, Typography } from '@mui/material';

import { ChartDataAlternative } from './chart-data-alternative';
import { AcademicInsightRecords } from './academic-insight-records';
import { displayValue, isFiniteValue, displaySeriesName } from './visualization-data';

export function AcademicCountProfile({ section }: { section: AcademicInsightsSection }) {
  const points = section.series.flatMap((entry) => entry.points);
  const maximum = Math.max(
    1,
    ...points.filter((point) => isFiniteValue(point.value)).map((point) => point.value)
  );
  const lollipop = section.key === 'reports';
  if (points.length === 0 && section.items.length > 0)
    return <AcademicInsightRecords items={section.items} />;

  return (
    <Stack spacing={2}>
      {section.series.map((entry) => (
        <Stack spacing={1.5} key={entry.name}>
          <Typography variant="subtitle2">{displaySeriesName(entry.name)}</Typography>
          {entry.points.map((point) => (
            <Box key={point.key}>
              <Stack
                direction="row"
                alignItems="baseline"
                justifyContent="space-between"
                gap={2}
                sx={{ mb: 1 }}
              >
                <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                  {point.label}
                </Typography>
                <Typography variant="subtitle2">{displayValue(point.value)}</Typography>
              </Stack>
              <Box
                aria-hidden
                sx={{
                  height: lollipop ? 3 : 8,
                  position: 'relative',
                  bgcolor: 'background.neutral',
                  borderRadius: 0.5,
                }}
              >
                {isFiniteValue(point.value) && (
                  <>
                    <Box
                      sx={{
                        height: 1,
                        width: `${(Math.max(0, point.value) / maximum) * 100}%`,
                        bgcolor: 'primary.main',
                        borderRadius: 0.5,
                      }}
                    />
                    {lollipop && (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: `calc(${(Math.max(0, point.value) / maximum) * 100}% - 4px)`,
                          top: -2.5,
                          width: 8,
                          height: 8,
                          bgcolor: 'primary.main',
                          borderRadius: '50%',
                        }}
                      />
                    )}
                  </>
                )}
              </Box>
              {point.status && (
                <Typography variant="caption" color="text.secondary">
                  {point.status}
                </Typography>
              )}
            </Box>
          ))}
        </Stack>
      ))}
      <Typography variant="caption" color="text.secondary">
        Count · scale 0 to {maximum}
      </Typography>
      <ChartDataAlternative series={section.series} />
      {section.items.length > 0 && <AcademicInsightRecords items={section.items} />}
    </Stack>
  );
}
