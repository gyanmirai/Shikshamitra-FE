'use client';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { varAlpha, getSemanticTextStyles } from 'src/theme/styles';
import { DayType, DAY_TYPE_LABELS } from 'src/enums/academic-calendar';
import { Box, Paper, Stack, Button, Tooltip, Typography, IconButton } from '@mui/material';

import { CalendarMonthSkeleton } from './CalendarSkeleton';
import { CalendarMonthEventsPanel } from './CalendarMonthEventsPanel';
import { getDayTypeSemanticColor } from './calendarDayTypePresentation';

import type { CalendarDayViewRecord } from '../calendarViewModel';

interface Props {
  dayMap: Record<string, CalendarDayViewRecord[]>;
  currentMonth: dayjs.Dayjs;
  onMonthChange: (month: dayjs.Dayjs) => void;
  onDayClick: (date: string) => void;
  isLoading: boolean;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Day Cell ─────────────────────────────────────────────────────────────────

const DayCell = ({
  day,
  events,
  isToday,
  isWeekend,
  onClick,
}: {
  day: dayjs.Dayjs | null;
  events: CalendarDayViewRecord[];
  isToday: boolean;
  isWeekend: boolean;
  onClick?: () => void;
}) => {
  const theme = useTheme();

  if (!day) {
    return (
      <Box
        sx={{
          minHeight: 110,
          backgroundColor: alpha(theme.palette.grey[500], 0.025),
          borderRight: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
        }}
      />
    );
  }

  const primaryEvent = events[0];
  const primaryStatusColor = primaryEvent
    ? getDayTypeSemanticColor(primaryEvent.dayType as DayType)
    : null;
  const primaryStatusPalette = primaryStatusColor ? theme.vars.palette[primaryStatusColor] : null;

  return (
    <Box
      data-testid={`academic-calendar-month-day-${day.format('YYYY-MM-DD')}`}
      onClick={onClick}
      sx={{
        minHeight: 110,
        p: 1,
        position: 'relative',
        cursor: 'pointer',
        borderRight: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
        backgroundColor: isToday
          ? alpha(theme.palette.primary.main, 0.04)
          : primaryStatusPalette
            ? varAlpha(primaryStatusPalette.mainChannel, 0.06)
            : 'transparent',
        transition: 'all 0.15s',
        overflow: 'hidden',
        '&:hover': {
          backgroundColor: primaryStatusPalette
            ? varAlpha(primaryStatusPalette.mainChannel, 0.12)
            : alpha(theme.palette.primary.main, 0.07),
          '& .add-hint': { opacity: 1 },
        },
      }}
    >
      {/* Today accent line */}
      {isToday && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            borderRadius: '0 0 2px 2px',
          }}
        />
      )}

      {/* Day number */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          mb: 0.75,
        }}
      >
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isToday ? theme.palette.primary.main : 'transparent',
            boxShadow: isToday ? `0 3px 10px ${alpha(theme.palette.primary.main, 0.45)}` : 'none',
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: '13px',
              fontWeight: isToday ? 800 : isWeekend ? 600 : 400,
              lineHeight: 1,
              color: isToday ? '#fff' : isWeekend ? theme.palette.text.secondary : 'text.primary',
            }}
          >
            {day.date()}
          </Typography>
        </Box>

        {/* Add hint on hover */}
        <Box
          className="add-hint"
          sx={{
            opacity: 0,
            transition: 'opacity 0.15s',
            width: 18,
            height: 18,
            borderRadius: '50%',
            backgroundColor: alpha(theme.palette.primary.main, 0.15),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Iconify icon="mdi:plus" width={12} color="primary.main" />
        </Box>
      </Box>

      {/* Events */}
      <Stack spacing={1}>
        {events.slice(0, 2).map((ev, i) => {
          const statusColor = getDayTypeSemanticColor(ev.dayType as DayType);
          const statusPalette = theme.vars.palette[statusColor];
          return (
            <Tooltip
              key={i}
              title={`${ev.title} — ${DAY_TYPE_LABELS[ev.dayType as DayType]}`}
              placement="top"
              arrow
              disableInteractive
            >
              <Box
                sx={{
                  px: 0.75,
                  py: 0.3,
                  borderRadius: 1,
                  backgroundColor: varAlpha(statusPalette.mainChannel, 0.12),
                  borderLeft: `2px solid ${statusPalette.main}`,
                  overflow: 'hidden',
                }}
              >
                <Typography
                  noWrap
                  sx={{
                    fontSize: '10px',
                    fontWeight: 700,
                    display: 'block',
                    lineHeight: 1.3,
                    ...getSemanticTextStyles(theme, statusColor),
                  }}
                >
                  {ev.title}
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
        {events.length > 2 && (
          <Typography
            sx={{ fontSize: '9.5px', color: 'text.secondary', px: 0.75, fontWeight: 600 }}
          >
            +{events.length - 2} more
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

// ─── Main Month View Component ───────────────────────────────────────────────

const CalendarMonthView = ({
  dayMap,
  currentMonth,
  onMonthChange,
  onDayClick,
  isLoading,
}: Props) => {
  const theme = useTheme();
  const monthKey = currentMonth.format('YYYY-MM');

  /**
   * Memoization Justification:
   * - Month navigation previously deduplicated and rescanned every event in the academic year.
   * - The indexed lookup now visits only the selected month's dates and is reused by the grid,
   *   summary chips, and event panel.
   */
  const { monthEvents, monthEventCounts } = useMemo(() => {
    const events = Object.entries(dayMap)
      .filter(([dateKey]) => dateKey.startsWith(monthKey))
      .flatMap(([dateKey, dateEvents]) =>
        dateEvents.map((event) => ({
          ...event,
          date: event.date ?? `${dateKey}T00:00:00`,
          title: event.title ?? DAY_TYPE_LABELS[event.dayType],
        }))
      )
      .sort((left, right) => dayjs(left.date).valueOf() - dayjs(right.date).valueOf());
    const counts = new Map<DayType, number>();
    events.forEach((event) => {
      counts.set(event.dayType, (counts.get(event.dayType) ?? 0) + 1);
    });
    return { monthEvents: events, monthEventCounts: counts };
  }, [dayMap, monthKey]);

  if (isLoading) {
    return <CalendarMonthSkeleton />;
  }

  const monthStart = currentMonth.startOf('month');
  const daysInMonth = monthStart.daysInMonth();
  const firstDayOfWeek = monthStart.day();
  const today = dayjs().format('YYYY-MM-DD');

  const cells: (null | dayjs.Dayjs)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => monthStart.add(i, 'day')),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isCurrentMonth = currentMonth.isSame(dayjs(), 'month');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        gap: 1,
        alignItems: 'flex-start',
      }}
    >
      {/* ── Main Calendar ──────────────────────────────────────────────────── */}
      <Paper
        sx={{
          flex: 1,
          minWidth: 0,
          borderRadius: 3,
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
          boxShadow: `0 4px 24px ${alpha(theme.palette.common.black, 0.06)}`,
        }}
      >
        {/* Navigation Header */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(theme.palette.primary.light, 0.03)} 100%)`,
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Stack direction="row" alignItems="center" gap={1}>
            <IconButton
              onClick={() => onMonthChange(currentMonth.subtract(1, 'month'))}
              size="small"
              sx={{
                border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                backgroundColor: 'background.paper',
                '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.08) },
              }}
            >
              <Iconify icon="mdi:chevron-left" width={20} />
            </IconButton>

            <Box sx={{ textAlign: 'center', px: 1.5 }}>
              <Typography
                variant="h5"
                fontWeight={800}
                color="primary.main"
                sx={{ lineHeight: 1.1 }}
              >
                {currentMonth.format('MMMM')}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {currentMonth.format('YYYY')}
                {monthEvents.length > 0 &&
                  ` · ${monthEvents.length} event${monthEvents.length > 1 ? 's' : ''}`}
              </Typography>
            </Box>

            <IconButton
              onClick={() => onMonthChange(currentMonth.add(1, 'month'))}
              size="small"
              sx={{
                border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                backgroundColor: 'background.paper',
                '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.08) },
              }}
            >
              <Iconify icon="mdi:chevron-right" width={20} />
            </IconButton>
          </Stack>

          <Stack direction="row" gap={1} alignItems="center">
            {monthEvents.length > 0 && (
              <Stack direction="row" gap={1} flexWrap="wrap">
                {[DayType.Holiday, DayType.Exam, DayType.Event, DayType.Vacation].map((dt) => {
                  const count = monthEventCounts.get(dt) ?? 0;
                  if (!count) return null;
                  const statusColor = getDayTypeSemanticColor(dt);
                  const statusPalette = theme.vars.palette[statusColor];
                  return (
                    <Box
                      key={dt}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.4,
                        px: 1,
                        py: 0.35,
                        borderRadius: 2,
                        backgroundColor: varAlpha(statusPalette.mainChannel, 0.16),
                        border: `1px solid ${varAlpha(statusPalette.mainChannel, 0.32)}`,
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: statusPalette.main,
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: '11px',
                          fontWeight: 700,
                          ...getSemanticTextStyles(theme, statusColor),
                        }}
                      >
                        {count}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            )}
            {!isCurrentMonth && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => onMonthChange(dayjs())}
                sx={{
                  borderRadius: 2,
                  fontSize: '11px',
                  height: 30,
                  px: 1.5,
                  ml: 0.5,
                  borderColor: alpha(theme.palette.primary.main, 0.4),
                }}
              >
                Today
              </Button>
            )}
          </Stack>
        </Box>

        {/* Weekday headers */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          }}
        >
          {WEEKDAYS.map((lbl, i) => (
            <Box
              key={lbl}
              sx={{
                py: 1.25,
                textAlign: 'center',
                backgroundColor: alpha(theme.palette.action.hover, 0.4),
                borderRight: i < 6 ? `1px solid ${alpha(theme.palette.divider, 0.4)}` : 'none',
              }}
            >
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  color: 'text.secondary',
                }}
              >
                {lbl}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Day grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {cells.map((day, idx) => {
            const key = day ? day.format('YYYY-MM-DD') : null;
            const events = key ? (dayMap[key] ?? []) : [];
            const isToday = key === today;
            const isWeekend = day ? day.day() === 0 || day.day() === 6 : false;
            return (
              <DayCell
                key={key ?? `empty-${idx}`}
                day={day}
                events={events}
                isToday={isToday}
                isWeekend={isWeekend}
                onClick={key ? () => onDayClick(key) : undefined}
              />
            );
          })}
        </Box>
      </Paper>

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <Box sx={{ width: { xs: '100%', lg: 300 }, flexShrink: 0 }}>
        {/* Today block */}
        <Paper
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            mb: 2,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(theme.palette.primary.light, 0.04)} 100%)`,
          }}
        >
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography
              variant="caption"
              color="primary.main"
              fontWeight={700}
              sx={{ textTransform: 'uppercase', letterSpacing: 0.8, fontSize: '10px' }}
            >
              Today
            </Typography>
            <Typography
              variant="h3"
              fontWeight={800}
              color="primary.main"
              sx={{ lineHeight: 1, mt: 0.25 }}
            >
              {dayjs().date()}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {dayjs().format('dddd, MMMM YYYY')}
            </Typography>
          </Box>
        </Paper>

        <CalendarMonthEventsPanel currentMonth={currentMonth} events={monthEvents} />
      </Box>
    </Box>
  );
};

export default CalendarMonthView;
