import { Box, Typography } from '@mui/material';

import { displayValue, isFiniteValue } from './visualization-data';

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function AcademicWeekdayColumns({
  days,
}: {
  days: { day: number; count: number | null }[];
}) {
  const maximum = Math.max(
    1,
    ...days.flatMap(({ count }) => (isFiniteValue(count) ? [count] : []))
  );
  return (
    <Box
      component="ul"
      aria-label="Daily timetable entries"
      sx={{
        m: 0,
        p: 0,
        listStyle: 'none',
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.max(1, days.length)}, minmax(0, 1fr))`,
        gap: 1,
      }}
    >
      {days.map(({ day, count }) => (
        <Box component="li" key={day} sx={{ minWidth: 0, textAlign: 'center' }}>
          <Typography
            variant="caption"
            component="div"
            sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
          >
            {displayValue(count)}
            {isFiniteValue(count) ? ` ${count === 1 ? 'entry' : 'entries'}` : ''}
          </Typography>
          <Box
            aria-hidden
            sx={{
              height: 128,
              mt: 0.75,
              px: { xs: 0.5, sm: 1 },
              display: 'flex',
              alignItems: 'flex-end',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            {isFiniteValue(count) && (
              <Box
                sx={{
                  width: 1,
                  height: `${(count / maximum) * 100}%`,
                  bgcolor: 'primary.main',
                  borderRadius: '3px 3px 0 0',
                }}
              />
            )}
          </Box>
          <Typography variant="caption" component="div" sx={{ mt: 0.75, overflowWrap: 'anywhere' }}>
            {weekdays[day]}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
