import type { AcademicInsightsSection } from 'src/redux/academicAPI/academicInsightsTypes';

import { Box, Stack, Typography } from '@mui/material';

import { ChartDataAlternative } from './chart-data-alternative';
import { displayValue, isFiniteValue } from './visualization-data';
import { AcademicInsightRecords } from './academic-insight-records';

export function AcademicPeriodHeatmap({ section }: { section: AcademicInsightsSection }) {
  const points = section.series
    .flatMap((entry) => entry.points)
    .filter((point) => isFiniteValue(point.x) && isFiniteValue(point.y));
  const days = Array.from(new Set(points.map((point) => point.x!)))
    .sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
  const periods = Array.from(new Set(points.map((point) => point.y!))).sort((a, b) => a - b);
  const maximum = Math.max(
    1,
    ...points.filter((point) => isFiniteValue(point.value)).map((point) => point.value)
  );
  if (points.length === 0 && section.items.length > 0)
    return <AcademicInsightRecords items={section.items} />;
  if (points.length === 0)
    return (
      <Typography variant="body2" color="text.secondary">
        No period samples are available.
      </Typography>
    );

  return (
    <Stack spacing={1.5}>
      <Typography variant="caption" color="text.secondary">
        Occupied periods · darker cells indicate more recorded occupancy
      </Typography>
      <Box sx={{ overflowX: 'auto', maxWidth: '100%' }}>
        <Box
          component="table"
          aria-label="Timetable period occupancy"
          sx={{ width: 1, minWidth: days.length * 64, borderSpacing: 4 }}
        >
          <Box component="thead">
            <Box component="tr">
              <Box component="th" sx={{ typography: 'caption', textAlign: 'left' }}>
                Period
              </Box>
              {days.map((day) => (
                <Box component="th" key={day} sx={{ typography: 'caption' }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day] ?? `Day ${day}`}
                </Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {periods.map((period) => (
              <Box component="tr" key={period}>
                <Box component="th" scope="row" sx={{ typography: 'body2', textAlign: 'left' }}>
                  {period}
                </Box>
                {days.map((day) => {
                  const matches = points.filter((point) => point.x === day && point.y === period);
                  const point = matches.length === 1 ? matches[0] : undefined;
                  const known = isFiniteValue(point?.value);
                  return (
                    <Box
                      component="td"
                      key={day}
                      sx={{
                        p: 1,
                        textAlign: 'center',
                        position: 'relative',
                        bgcolor: 'background.neutral',
                        borderRadius: 0.5,
                      }}
                    >
                      {known && point.value > 0 && (
                        <Box
                          aria-hidden
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            bgcolor: 'primary.main',
                            borderRadius: 0.5,
                            opacity: 0.12 + (point.value / maximum) * 0.42,
                          }}
                        />
                      )}
                      <Typography
                        variant="body2"
                        sx={{ position: 'relative' }}
                        title={point?.label}
                      >
                        {known ? displayValue(point.value) : 'N/A'}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      <Typography variant="caption" color="text.secondary">
        0 is recorded zero occupancy. N/A means no comparable sample.
      </Typography>
      <ChartDataAlternative
        series={section.series}
        coordinateLabels={['Weekday (0=Sunday)', 'Period']}
        valueLabel="Occupied slots"
      />
      {section.items.length > 0 && <AcademicInsightRecords items={section.items} />}
    </Stack>
  );
}
