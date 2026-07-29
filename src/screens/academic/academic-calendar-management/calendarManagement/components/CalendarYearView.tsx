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
  dayMap: Record<string, any>;
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
  while (cells.length % 7 !== 0) cells.push(null);

  // Count marked days in this month
  const markedCount = Object.entries(dayMap).filter(
    ([key, value]) =>
      key.startsWith(monthStart.format('YYYY-MM')) &&
      (!activeDayType || value.dayType === activeDayType)
  ).length;

  return (
    <Box sx={{ minWidth: 0 }}>
      {/* Month Header */}
      <Box
        sx={{
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
        {markedCount > 0 && <Label>{`${markedCount} marked`}</Label>}
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
          const dayMarker = dayMap[key];
          const calDay =
            dayMarker && (!activeDayType || dayMarker.dayType === activeDayType) ? dayMarker : null;
          const isWeekend = day.day() === 0;
          const isSaturday = day.day() === 6;
          const isToday = key === today;
          const isOutside =
            day.isBefore(dayjs(startDate), 'day') || day.isAfter(dayjs(endDate), 'day');
          const markerColor = calDay ? DAY_TYPE_COLORS[calDay.dayType as DayType] : null;

          return (
            <Tooltip
              key={key}
              title={
                isOutside
                  ? ''
                  : calDay
                    ? calDay.title || DAY_TYPE_LABELS[calDay.dayType as DayType]
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
                      fontWeight: isToday ? 800 : calDay ? 700 : 500,
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
                  {/* Visual Dot indicator */}
                  {calDay && !isToday && (
                    <Box
                      sx={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        backgroundColor: markerColor,
                        mt: '2px',
                      }}
                    />
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
  dayMap: Record<string, any>;
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

// ─── Dual Month Card (two months combined into one wide card) ───────────────

const DualMonthCard = ({
  months,
  dayMap,
  startDate,
  endDate,
  today,
  onDayClick,
  activeDayType,
}: {
  months: dayjs.Dayjs[];
  dayMap: Record<string, any>;
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
        borderRadius: 2.5,
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        backgroundColor: theme.vars.palette.background.paper,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'grid',
        gridTemplateColumns: `repeat(${months.length}, minmax(0, 1fr))`,
        '&:hover': {
          boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.08)}`,
          borderColor: alpha(theme.palette.primary.main, 0.25),
        },
      }}
    >
      {months.map((month, idx) => (
        <Box
          key={month.format('YYYY-MM')}
          sx={{
            minWidth: 0,
            borderLeft: idx > 0 ? `1px solid ${alpha(theme.palette.divider, 0.6)}` : 'none',
          }}
        >
          <MonthInner
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
    </Paper>
  );
};

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

  // Build date map
  const dayMap: Record<string, any> = {};
  days.forEach((d) => {
    const key = dayjs(d.date).format('YYYY-MM-DD');
    if (!dayMap[key]) dayMap[key] = d;
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

  // Summary stats
  const stats = [
    {
      label: 'Holidays',
      count: days.filter((d) => d.dayType === DayType.Holiday).length,
      color: DAY_TYPE_COLORS[DayType.Holiday],
      icon: 'mdi:flag-outline',
    },
    {
      label: 'Vacations',
      count: days.filter((d) => d.dayType === DayType.Vacation).length,
      color: DAY_TYPE_COLORS[DayType.Vacation],
      icon: 'mdi:beach',
    },
    {
      label: 'Events',
      count: days.filter((d) => d.dayType === DayType.Event).length,
      color: DAY_TYPE_COLORS[DayType.Event],
      icon: 'mdi:party-popper',
    },
    {
      label: 'Exam Days',
      count: days.filter((d) => d.dayType === DayType.Exam).length,
      color: DAY_TYPE_COLORS[DayType.Exam],
      icon: 'mdi:file-document-edit-outline',
    },
    {
      label: 'PTM Days',
      count: days.filter((d) => d.dayType === DayType.PTM).length,
      color: DAY_TYPE_COLORS[DayType.PTM],
      icon: 'mdi:account-group-outline',
    },
    {
      label: 'Half Days',
      count: days.filter((d) => d.dayType === DayType.HalfDay).length,
      color: DAY_TYPE_COLORS[DayType.HalfDay],
      icon: 'mdi:clock-time-four-outline',
    },
  ];

  return (
    <Box>
      {/* Summary + Legend Section */}
      <Paper
        elevation={0}
        sx={{
          mb: 1,
          borderRadius: 2.5,
          border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
          overflow: 'hidden',
          backgroundColor: theme.vars.palette.background.paper,
        }}
      >
        {/* Stats Row */}
        <Box
          sx={{
            px: 1,
            py: 1,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            backgroundColor: alpha(theme.palette.primary.main, 0.01),
          }}
        >
          <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
            <Stack direction="row" alignItems="center" gap={1} mr={1.5}>
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                }}
              >
                <Iconify icon="mdi:calendar-range" width={15} />
              </Avatar>
              <Typography
                variant="subtitle2"
                fontWeight={800}
                color="text.primary"
                sx={{ letterSpacing: 0.3 }}
              >
                {dayjs(startDate).format('MMM YYYY')} — {dayjs(endDate).format('MMM YYYY')}
              </Typography>
            </Stack>

            <Stack direction="row" flexWrap="wrap" gap={1} flex={1}>
              {stats.map((s) => (
                <Box
                  key={s.label}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1,
                    py: 0.75,
                    borderRadius: 2,
                    backgroundColor: alpha(s.color, 0.06),
                    border: `1px solid ${alpha(s.color, 0.15)}`,
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: alpha(s.color, 0.1),
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  <Iconify icon={s.icon} width={14} sx={{ color: s.color }} />
                  <Typography
                    variant="body2"
                    fontWeight={800}
                    sx={{ color: s.color, lineHeight: 1 }}
                  >
                    {s.count}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                    sx={{ fontSize: '11px' }}
                  >
                    {s.label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Box>

        {/* Legend Row */}
        <Box sx={{ px: 1, py: 1, backgroundColor: alpha(theme.palette.grey[500], 0.02) }}>
          <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
            <Typography
              variant="caption"
              color="text.disabled"
              fontWeight={800}
              sx={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: 1, mr: 1 }}
            >
              Legend
            </Typography>
            {LEGEND_ITEMS.map(({ type, label }) => {
              const isActive = activeDayType === type;

              return (
                <Stack
                  key={type}
                  component="button"
                  type="button"
                  direction="row"
                  alignItems="center"
                  gap={1}
                  onClick={() => onToggleDayType(type)}
                  sx={{
                    border: 0,
                    cursor: 'pointer',
                    borderRadius: 1,
                    px: 0.75,
                    py: 0.5,
                    backgroundColor: isActive ? alpha(DAY_TYPE_COLORS[type], 0.12) : 'transparent',
                  }}
                >
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      backgroundColor: alpha(DAY_TYPE_COLORS[type], 0.15),
                      border: `1.5px solid ${alpha(DAY_TYPE_COLORS[type], 0.5)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        backgroundColor: DAY_TYPE_COLORS[type],
                      }}
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color="text.secondary"
                    sx={{ fontSize: '11px' }}
                  >
                    {label}
                  </Typography>
                </Stack>
              );
            })}
            <Stack direction="row" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 14,
                  height: 14,
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
            </Stack>
            <Stack direction="row" alignItems="center" gap={1} ml={{ md: 'auto' }}>
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  backgroundColor: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
        </Box>
      </Paper>

      {/* Monthly Grids */}
      <Box
        sx={{
          display: 'grid',
          gap: 1,
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        }}
      >
        {months.map((month) => (
          <Box key={month.format('YYYY-MM')} sx={{ minWidth: 0 }}>
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
