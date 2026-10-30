import type { AcademicInsightsItem } from 'src/redux/academicAPI/academicInsightsTypes';

import { fDateTime } from 'src/utils/format-time';
import { Box, Stack, Typography } from '@mui/material';

import { displayValue, isFiniteValue } from './visualization-data';

export function AcademicInsightRecords({ items }: { items: AcademicInsightsItem[] }) {
  return (
    <Stack component="ul" spacing={1.5} sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {items.map((item) => (
        <Box
          component="li"
          key={item.id}
          sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 1.5 }}
        >
          <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
            {item.label}
          </Typography>
          {item.detail && (
            <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
              {item.detail}
            </Typography>
          )}
          {item.date && (
            <Typography
              component="time"
              dateTime={item.date}
              variant="caption"
              color="text.secondary"
            >
              {fDateTime(item.date)}
            </Typography>
          )}
          {(item.status || isFiniteValue(item.value)) && (
            <Typography variant="caption" color="text.secondary" component="div">
              {[item.status, isFiniteValue(item.value) ? displayValue(item.value) : null]
                .filter(Boolean)
                .join(' · ')}
            </Typography>
          )}
        </Box>
      ))}
    </Stack>
  );
}
