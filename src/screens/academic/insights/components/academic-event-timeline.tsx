import type { AcademicInsightsSection } from 'src/redux/academicAPI/academicInsightsTypes';

import { Box, Stack, Typography } from '@mui/material';
import { fDate, fDateTime } from 'src/utils/format-time';

import { displayValue, isFiniteValue } from './visualization-data';

export function AcademicEventTimeline({ section }: { section: AcademicInsightsSection }) {
  const items = section.key === 'audits' ? section.items.slice(0, 5) : section.items;
  return (
    <Box
      component="ol"
      aria-label={section.key === 'calendar' ? 'Calendar events' : 'Audit activity'}
      sx={{ m: 0, p: 0, listStyle: 'none' }}
    >
      {items.map((item) => (
        <Box
          component="li"
          key={item.id}
          sx={{
            position: 'relative',
            pl: 2.5,
            pb: 2,
            borderLeft: '1px solid',
            borderColor: 'divider',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 6,
              left: -4,
              width: 7,
              height: 7,
              bgcolor: 'primary.main',
              borderRadius: '50%',
            },
          }}
        >
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              {item.date ? (
                <Box component="time" dateTime={item.date}>
                  {section.key === 'calendar' ? fDate(item.date) : fDateTime(item.date)}
                </Box>
              ) : (
                'Date unavailable'
              )}
            </Typography>
            <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
              {item.label}
            </Typography>
            {item.detail && (
              <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
                {item.detail}
              </Typography>
            )}
            {(item.status || isFiniteValue(item.value)) && (
              <Typography variant="caption" color="text.secondary">
                {[item.status, isFiniteValue(item.value) ? displayValue(item.value) : null]
                  .filter(Boolean)
                  .join(' · ')}
              </Typography>
            )}
          </Stack>
        </Box>
      ))}
      {section.items.length === 0 && (
        <Typography component="li" variant="body2" color="text.secondary">
          No dated records are available.
        </Typography>
      )}
    </Box>
  );
}
