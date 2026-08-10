'use client';

import dayjs from 'dayjs';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { DayType, DAY_TYPE_COLORS, DAY_TYPE_LABELS } from 'src/enums/academic-calendar';
import { Box, Paper, Stack, Avatar, Tooltip, Typography, CircularProgress } from '@mui/material';

interface Props {
  calendarDays: any[];
  calendarStartDate: string;
  calendarEndDate: string;
  isLoading: boolean;
  onDayClick: (date: string) => void;
  activeDayType: DayType | null;
  onToggleDayType: (type: DayType) => void;
}

const WEEKDAY_ABBR = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const LEGEND_ITEMS = [
  { type: DayType.Holiday, label: 'Holiday' },
  { type: DayType.Vacation, label: 'Vacation' },
  { type: DayType.HalfDay, label: 'Half Day' },
  { type: DayType.Event, label: 'Event' },
  { type: DayType.Exam, label: 'Exam' },
  { type: DayType.PTM, label: 'PTM' },
  { type: DayType.EmergencyClosure, label: 'Emergency' },
];

/**
 * Class-specific records for one calendar event can have different IDs, but
 * they should still render as one event when their visible event details match.
 */
const getCalendarEventIdentity = (event: any) =>
  [
    dayjs(event.date).format('YYYY-MM-DD'),
    event.dayType,
    event.title?.trim().toLowerCase() ?? '',
    event.holidayCategory ?? '',
    event.description?.trim().toLowerCase() ?? '',
  ].join('|');

const uniqueCalendarEvents = (events: any[]) => {
  const seen = new Set<string>();

  return events.filter((event) => {
    const identity = getCalendarEventIdentity(event);
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
};

// ─── Single Month Mini-Calendar ───────────────────────────────────────────────

const MonthInner = ({
  monthStart,
  dayMap,
  startDate,
  endDate,
  today,
  onDayClick,
  activeDayType,
}: {
  monthStart: dayjs.Dayjs;
  dayMap: Record<string, any[]>;
  startDate: string;
  endDate: string;
  today: string;
  onDayClick: (date: string) => void;
  activeDayType: DayType | null;
}) => {
  const theme = useTheme();
  const daysInMonth = monthStart.daysInMonth();
  const firstDayOfWeek = monthStart.day();

  const cells: (null | dayjs.Dayjs)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => monthStart.add(i, 'day')),
  ];
  while (cells.length < 42) cells.push(null);

  // Count marked days in this month (dates that have at least one matching event)
  const markedCount = Object.entries(dayMap).filter(
    ([key, events]) =>
      key.startsWith(monthStart.format('YYYY-MM')) &&
      (!activeDayType || events.some((e: any) => e.dayType === activeDayType))
  ).length;

  return (
    <Box sx={{ minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Month Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 2,
          px: 2.5,
          py: 1.75,
          borderBottom: `1px solid ${varAlpha(theme.palette.dividerChannel, 0.5)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: varAlpha(theme.palette.primary.mainChannel, 0.02),
        }}
      >
        <Typography
          variant="subtitle2"
          fontWeight={800}
          sx={{
            fontSize: '14px',
            color: theme.vars.palette.text.primary,
            letterSpacing: 0.2,
          }}
        >
          {monthStart.format('MMMM YYYY')}
        </Typography>
      </Box>

      {/* Weekday headers */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', px: 1, pt: 1.5, pb: 0.5 }}>
        {WEEKDAY_ABBR.map((lbl, i) => {
          const isSunday = i === 0;
          const isSaturday = i === 6;
          return (
            <Box key={`${lbl}-${i}`} sx={{ textAlign: 'center', py: 0.25 }}>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: isSunday ? theme.palette.error.main : 'text.disabled',
                  textTransform: 'uppercase',
                  opacity: isSunday ? 0.8 : isSaturday ? 0.5 : 0.6,
                }}
              >
                {lbl}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Day grid */}
      <Box
        sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', px: 1, pb: 1.5, gap: '3px' }}
      >
        {cells.map((day, idx) => {
          if (!day) {
            return <Box key={`e-${idx}`} sx={{ height: 34 }} />;
          }

          const key = day.format('YYYY-MM-DD');
          const dayEvents = dayMap[key];
          const calEvents = dayEvents
            ? activeDayType
              ? dayEvents.filter((e: any) => e.dayType === activeDayType)
              : dayEvents
            : [];
          const isWeekend = day.day() === 0;
          const isSaturday = day.day() === 6;
          const isToday = key === today;
          const isOutside =
            day.isBefore(dayjs(startDate), 'day') || day.isAfter(dayjs(endDate), 'day');
          // Use the first event's color for cell background, or null if no events
          const markerColor = calEvents.length > 0
            ? DAY_TYPE_COLORS[calEvents[0].dayType as DayType]
            : null;

          return (
            <Tooltip
              key={key}
              title={
                isOutside
                  ? ''
                  : calEvents.length > 0
                    ? (
                      <Box sx={{ py: 0.5 }}>
                        {calEvents.map((e: any, i: number) => (
                          <Typography key={i} variant="caption" sx={{ display: 'block', lineHeight: 1.6 }}>
                            {`${i + 1}. ${e.title || DAY_TYPE_LABELS[e.dayType as DayType]}`}
                          </Typography>
                        ))}
                      </Box>
                    )
                    : isWeekend || isSaturday
                      ? 'Weekend'
                      : dayjs(key).format('dddd, DD MMM YYYY')
              }
              placement="top"
              arrow
              disableInteractive
              disableHoverListener={isOutside}
            >
              <Box
                sx={{
                  height: 34,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  data-testid={`academic-calendar-year-day-${key}`}
                  onClick={() => !isOutside && onDayClick(key)}
                  sx={{
                    width: 30,
                    height: 30,
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    cursor: isOutside ? 'default' : 'pointer',
                    opacity: isOutside ? 0.15 : 1,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    backgroundColor: isToday
                      ? theme.palette.primary.main
                      : markerColor
                        ? alpha(markerColor, 0.08)
                        : 'transparent',
                    border: '1px solid transparent',
                    boxSizing: 'border-box',
                    '&:hover': isOutside
                      ? {}
                      : {
                        backgroundColor: markerColor
                          ? alpha(markerColor, 0.18)
                          : isToday
                            ? theme.vars.palette.primary.dark
                            : varAlpha(theme.palette.primary.mainChannel, 0.08),
                        transform: 'scale(1.15)',
                        zIndex: 2,
                        boxShadow: `0 4px 8px ${alpha(theme.palette.common.black, 0.08)}`,
                      },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '11px',
                      fontWeight: isToday ? 800 : calEvents.length > 0 ? 700 : 500,
                      lineHeight: 1,
                      color: isToday
                        ? '#fff'
                        : isWeekend
                          ? theme.vars.palette.text.secondary
                          : isSaturday
                            ? theme.vars.palette.text.disabled
                            : theme.vars.palette.text.primary,
                    }}
                  >
                    {day.date()}
                  </Typography>
                  {/* Multi-event dot indicators */}
                  {calEvents.length > 0 && !isToday && (
                    <Box sx={{ display: 'flex', gap: '2px', mt: '2px' }}>
                      {calEvents.slice(0, 3).map((e: any, i: number) => (
                        <Box
                          key={i}
                          sx={{
                            width: 4,
                            height: 4,
                            borderRadius: '50%',
                            backgroundColor: DAY_TYPE_COLORS[e.dayType as DayType] || markerColor,
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
};

const MonthCard = (props: {
  monthStart: dayjs.Dayjs;
  dayMap: Record<string, any[]>;
  startDate: string;
  endDate: string;
  today: string;
  onDayClick: (date: string) => void;
  activeDayType: DayType | null;
}) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2.5,
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        backgroundColor: theme.vars.palette.background.paper,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.08)}`,
          borderColor: alpha(theme.palette.primary.main, 0.25),
          transform: 'translateY(-2px)',
        },
      }}
    >
      <MonthInner {...props} />
    </Paper>
  );
};

// DualMonthCard removed — year view uses individual MonthCard per responsive grid (Bug #5408 fix)

// ─── Main Component ───────────────────────────────────────────────────────────

const CalendarYearView = ({
  calendarDays,
  calendarStartDate,
  calendarEndDate,
  isLoading,
  onDayClick,
  activeDayType,
  onToggleDayType,
}: Props) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const days = calendarDays;
  const startDate = calendarStartDate;
  const endDate = calendarEndDate;
  const today = dayjs().format('YYYY-MM-DD');

  // Build date map after collapsing class-specific duplicates per date.
  const uniqueDays = uniqueCalendarEvents(days);
  const dayMap: Record<string, any[]> = {};
  uniqueDays.forEach((d) => {
    const key = dayjs(d.date).format('YYYY-MM-DD');
    if (!dayMap[key]) dayMap[key] = [];
    dayMap[key].push(d);
  });

  // Build months list
  const months: dayjs.Dayjs[] = [];
  if (startDate && endDate) {
    let cursor = dayjs(startDate).startOf('month');
    while (cursor.isBefore(dayjs(endDate).endOf('month'))) {
      months.push(cursor);
      cursor = cursor.add(1, 'month');
    }
  }

  // Summary stats are shown inline in the legend filter chips (no separate redundant row needed)

  return (
    <Box>
      {/* Integrated Streamlined Legend & Filter Section */}
      <Paper
        elevation={0}
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          mb: 1.5,
          p: 1.5,
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
          backgroundColor: theme.vars.palette.background.paper,
          boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.04)}`,
        }}
      >
        <Stack direction="row" flexWrap="wrap" gap={1.25} alignItems="center">
          <Stack direction="row" alignItems="center" gap={1} mr={1}>
            <Avatar
              sx={{
                width: 26,
                height: 26,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
              }}
            >
              <Iconify icon="mdi:calendar-range" width={14} />
            </Avatar>
            <Typography
              variant="caption"
              fontWeight={800}
              color="text.primary"
              sx={{ letterSpacing: 0.3, whiteSpace: 'nowrap' }}
            >
              {dayjs(startDate).format('MMM YYYY')} — {dayjs(endDate).format('MMM YYYY')}
            </Typography>
          </Stack>

          <Box sx={{ height: 16, width: '1px', bgcolor: 'divider', display: { xs: 'none', sm: 'block' } }} />

          {/* Interactive Legend & Count Filter Chips */}
          <Stack direction="row" flexWrap="wrap" gap={0.75} alignItems="center" flex={1}>
            {LEGEND_ITEMS.map(({ type, label }) => {
              const isActive = activeDayType === type;
              const count = uniqueDays.filter((d) => d.dayType === type).length;

              return (
                <Stack
                  key={type}
                  component="button"
                  type="button"
                  direction="row"
                  alignItems="center"
                  gap={0.75}
                  onClick={() => onToggleDayType(type)}
                  sx={{
                    border: '1px solid',
                    borderColor: isActive
                      ? DAY_TYPE_COLORS[type]
                      : alpha(DAY_TYPE_COLORS[type], 0.25),
                    cursor: 'pointer',
                    borderRadius: 1.5,
                    px: 1,
                    py: 0.4,
                    backgroundColor: isActive
                      ? alpha(DAY_TYPE_COLORS[type], 0.12)
                      : alpha(DAY_TYPE_COLORS[type], 0.03),
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: alpha(DAY_TYPE_COLORS[type], 0.12),
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      backgroundColor: DAY_TYPE_COLORS[type],
                    }}
                  />
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="text.primary"
                    sx={{ fontSize: '11px' }}
                  >
                    {label}
                  </Typography>
                  {count > 0 && (
                    <Box
                      sx={{
                        px: 0.6,
                        py: 0.1,
                        borderRadius: 1,
                        backgroundColor: alpha(DAY_TYPE_COLORS[type], 0.16),
                        color: DAY_TYPE_COLORS[type],
                        fontSize: '10px',
                        fontWeight: 800,
                        lineHeight: 1.2,
                      }}
                    >
                      {count}
                    </Box>
                  )}
                </Stack>
              );
            })}

            <Stack direction="row" alignItems="center" gap={0.75} ml={{ md: 'auto' }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: alpha(theme.palette.text.secondary, 0.15),
                  border: `1px solid ${alpha(theme.palette.text.secondary, 0.4)}`,
                }}
              />
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
                sx={{ fontSize: '11px' }}
              >
                Weekend
              </Typography>
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  backgroundColor: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ml: 1,
                }}
              >
                <Typography sx={{ fontSize: '8px', color: '#fff', fontWeight: 900, lineHeight: 1 }}>
                  T
                </Typography>
              </Box>
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
                sx={{ fontSize: '11px' }}
              >
                Today
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      {/* Monthly Grids — max 4 columns so cards are never cramped (Bug #5408) */}
      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, minmax(280px, 1fr))',
          },
        }}
      >
        {months.map((month) => (
          <Box key={month.format('YYYY-MM')} sx={{ minWidth: 0, height: '100%' }}>
            <MonthCard
              monthStart={month}
              dayMap={dayMap}
              startDate={startDate}
              endDate={endDate}
              today={today}
              onDayClick={onDayClick}
              activeDayType={activeDayType}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default CalendarYearView;
