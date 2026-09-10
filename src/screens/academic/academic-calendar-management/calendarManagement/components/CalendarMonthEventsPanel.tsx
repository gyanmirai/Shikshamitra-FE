import type { DayType } from 'src/enums/academic-calendar';

import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { varAlpha, getSemanticTextStyles } from 'src/theme/styles';
import { Box, Paper, Stack, Avatar, Typography } from '@mui/material';

import CalendarDayTypeChip from './CalendarDayTypeChip';
import { getDayTypeSemanticColor } from './calendarDayTypePresentation';

export interface CalendarMonthEvent {
  date: string;
  dayType: DayType;
  title: string;
}

interface CalendarMonthEventsPanelProps {
  currentMonth: dayjs.Dayjs;
  events: CalendarMonthEvent[];
}

export function CalendarMonthEventsPanel({ currentMonth, events }: CalendarMonthEventsPanelProps) {
  const theme = useTheme();

  if (events.length === 0) return null;

  return (
    <Paper
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: `1px solid ${theme.vars.palette.divider}`,
        boxShadow: `0 2px 12px ${varAlpha(theme.vars.palette.common.blackChannel, 0.05)}`,
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${theme.vars.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
        }}
      >
        <Stack direction="row" alignItems="center" gap={1}>
          <Iconify icon="mdi:calendar-star-outline" width={17} color="primary.main" />
          <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '13px' }}>
            {currentMonth.format('MMMM')} Events
          </Typography>
        </Stack>
        <Label color="primary" variant="soft" sx={{ height: 18, fontSize: '10px' }}>
          {events.length}
        </Label>
      </Box>

      <Box sx={{ maxHeight: 460, overflowY: 'auto' }}>
        <Stack>
          {events.map((event, index) => {
            const statusColor = getDayTypeSemanticColor(event.dayType);
            const statusPalette = theme.vars.palette[statusColor];

            return (
              <Box
                key={`${event.date}-${event.title}-${index}`}
                sx={{
                  px: 1.75,
                  py: 1.25,
                  borderLeft: `3px solid ${statusPalette.main}`,
                  borderBottom:
                    index < events.length - 1
                      ? `1px solid ${theme.vars.palette.divider}`
                      : 'none',
                  '&:hover': { bgcolor: varAlpha(statusPalette.mainChannel, 0.08) },
                  transition: theme.transitions.create('background-color', {
                    duration: theme.transitions.duration.shorter,
                  }),
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: 1.5,
                      bgcolor: varAlpha(statusPalette.mainChannel, 0.16),
                      flexShrink: 0,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '12px',
                        fontWeight: 800,
                        lineHeight: 1,
                        ...getSemanticTextStyles(theme, statusColor),
                      }}
                    >
                      {dayjs(event.date).date()}
                    </Typography>
                  </Avatar>
                  <Box flex={1} overflow="hidden">
                    <Typography variant="body2" fontWeight={700} noWrap sx={{ fontSize: '12.5px' }}>
                      {event.title}
                    </Typography>
                    <Stack direction="row" alignItems="center" gap={1} mt={0.3}>
                      <CalendarDayTypeChip dayType={event.dayType} />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: '10.5px' }}
                      >
                        {dayjs(event.date).format('ddd, DD MMM')}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </Box>
    </Paper>
  );
}
