'use client';

import dayjs from 'dayjs';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { DayType, DAY_TYPE_COLORS, DAY_TYPE_LABELS } from 'src/enums/academic-calendar';
import {
  Box,
  Grid,
  Paper,
  Stack,
  Avatar,
  Tooltip,
  Typography,
  CircularProgress,
} from '@mui/material';

// ─── Mock calendar days for demo ──────────────────────────────────────────────

const MOCK_CALENDAR_DAYS = [
  { date: '2025-08-15', dayType: DayType.Holiday, title: 'Independence Day' },
  { date: '2025-09-05', dayType: DayType.Event, title: "Teachers' Day" },
  { date: '2025-10-02', dayType: DayType.Holiday, title: 'Gandhi Jayanti' },
  { date: '2025-10-24', dayType: DayType.Vacation, title: 'Dussehra Break' },
  { date: '2025-10-25', dayType: DayType.Vacation, title: 'Dussehra Break' },
  { date: '2025-10-26', dayType: DayType.Vacation, title: 'Dussehra Break' },
  { date: '2025-11-12', dayType: DayType.Holiday, title: 'Diwali' },
  { date: '2025-11-13', dayType: DayType.Holiday, title: 'Diwali (2nd day)' },
  { date: '2025-11-14', dayType: DayType.HalfDay, title: "Children's Day" },
  { date: '2025-12-25', dayType: DayType.Holiday, title: 'Christmas' },
  { date: '2025-12-26', dayType: DayType.Vacation, title: 'Winter Vacation' },
  { date: '2025-12-27', dayType: DayType.Vacation, title: 'Winter Vacation' },
  { date: '2025-12-28', dayType: DayType.Vacation, title: 'Winter Vacation' },
  { date: '2025-12-29', dayType: DayType.Vacation, title: 'Winter Vacation' },
  { date: '2026-01-01', dayType: DayType.Holiday, title: "New Year's Day" },
  { date: '2026-01-26', dayType: DayType.Holiday, title: 'Republic Day' },
  { date: '2026-02-10', dayType: DayType.Exam, title: 'Annual Exam Day 1' },
  { date: '2026-02-11', dayType: DayType.Exam, title: 'Annual Exam Day 2' },
  { date: '2026-02-12', dayType: DayType.Exam, title: 'Annual Exam Day 3' },
  { date: '2026-02-13', dayType: DayType.Exam, title: 'Annual Exam Day 4' },
  { date: '2026-03-08', dayType: DayType.Event, title: "Women's Day Celebration" },
  { date: '2026-03-15', dayType: DayType.PTM, title: 'Parent-Teacher Meeting' },
];

const MOCK_START = '2025-06-01';
const MOCK_END = '2026-03-31';

interface Props {
  calendarDays: any[];
  calendarStartDate: string;
  calendarEndDate: string;
  isLoading: boolean;
  onDayClick: (date: string) => void;
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

const MonthCard = ({
  monthStart,
  dayMap,
  startDate,
  endDate,
  today,
  onDayClick,
}: {
  monthStart: dayjs.Dayjs;
  dayMap: Record<string, any>;
  startDate: string;
  endDate: string;
  today: string;
  onDayClick: (date: string) => void;
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
  const markedCount = Object.keys(dayMap).filter((k) =>
    k.startsWith(monthStart.format('YYYY-MM'))
  ).length;

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
          const isWeekend = i === 0 || i === 6;
          return (
            <Box key={`${lbl}-${i}`} sx={{ textAlign: 'center', py: 0.25 }}>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: isWeekend ? theme.palette.error.main : 'text.disabled',
                  textTransform: 'uppercase',
                  opacity: isWeekend ? 0.8 : 0.6,
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
          const calDay = dayMap[key];
          const isWeekend = day.day() === 0 || day.day() === 6;
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
                    : isWeekend
                      ? 'Weekend'
                      : dayjs(key).format('dddd, DD MMM YYYY')
              }
              placement="top"
              arrow
              disableInteractive
              disableHoverListener={isOutside}
            >
              <Box
                onClick={() => !isOutside && onDayClick(key)}
                sx={{
                  height: 34,
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
            </Tooltip>
          );
        })}
      </Box>
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
}: Props) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const days = calendarDays.length > 0 ? calendarDays : MOCK_CALENDAR_DAYS;
  const startDate = calendarStartDate || MOCK_START;
  const endDate = calendarEndDate || MOCK_END;
  const today = dayjs().format('YYYY-MM-DD');

  // Build date map
  const dayMap: Record<string, any> = {};
  days.forEach((d) => {
    dayMap[dayjs(d.date).format('YYYY-MM-DD')] = d;
  });

  // Build months list
  const months: dayjs.Dayjs[] = [];
  let cursor = dayjs(startDate).startOf('month');
  const calEnd = dayjs(endDate).endOf('month');
  while (cursor.isBefore(calEnd) || cursor.isSame(calEnd, 'month')) {
    months.push(cursor);
    cursor = cursor.add(1, 'month');
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
          mb: 3,
          borderRadius: 2.5,
          border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
          overflow: 'hidden',
          backgroundColor: theme.vars.palette.background.paper,
        }}
      >
        {/* Stats Row */}
        <Box
          sx={{
            px: 3,
            py: 2.25,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            backgroundColor: alpha(theme.palette.primary.main, 0.01),
          }}
        >
          <Stack direction="row" flexWrap="wrap" gap={2} alignItems="center">
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

            <Stack direction="row" flexWrap="wrap" gap={1.25} flex={1}>
              {stats.map((s) => (
                <Box
                  key={s.label}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.75,
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
        <Box sx={{ px: 3, py: 1.75, backgroundColor: alpha(theme.palette.grey[500], 0.02) }}>
          <Stack direction="row" flexWrap="wrap" gap={2} alignItems="center">
            <Typography
              variant="caption"
              color="text.disabled"
              fontWeight={800}
              sx={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: 1, mr: 1 }}
            >
              Legend
            </Typography>
            {LEGEND_ITEMS.map(({ type, label }) => (
              <Stack key={type} direction="row" alignItems="center" gap={0.75}>
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
            ))}
            <Stack direction="row" alignItems="center" gap={0.75}>
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
            <Stack direction="row" alignItems="center" gap={0.75} ml={{ md: 'auto' }}>
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
      <Grid container spacing={1.5}>
        {months.map((month) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={month.format('YYYY-MM')}>
            <MonthCard
              monthStart={month}
              dayMap={dayMap}
              startDate={startDate}
              endDate={endDate}
              today={today}
              onDayClick={onDayClick}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CalendarYearView;
