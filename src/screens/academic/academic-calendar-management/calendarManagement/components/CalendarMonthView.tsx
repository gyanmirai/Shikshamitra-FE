'use client';

import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { DayType, DAY_TYPE_COLORS, DAY_TYPE_LABELS } from 'src/enums/academic-calendar';
import {
  Box,
  Paper,
  Stack,
  Button,
  Avatar,
  Tooltip,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';

import CalendarDayTypeChip from './CalendarDayTypeChip';

interface Props {
  calendarDays: any[];
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
  events: any[];
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
  const primaryColor = primaryEvent ? DAY_TYPE_COLORS[primaryEvent.dayType as DayType] : null;

  return (
    <Box
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
          : primaryColor
            ? alpha(primaryColor, 0.04)
            : 'transparent',
        transition: 'all 0.15s',
        overflow: 'hidden',
        '&:hover': {
          backgroundColor: primaryColor
            ? alpha(primaryColor, 0.1)
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
          const evColor = DAY_TYPE_COLORS[ev.dayType as DayType];
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
                  backgroundColor: alpha(evColor, 0.08),
                  borderLeft: `2px solid ${evColor}`,
                  overflow: 'hidden',
                }}
              >
                <Typography
                  noWrap
                  sx={{
                    fontSize: '10px',
                    color: evColor,
                    fontWeight: 700,
                    display: 'block',
                    lineHeight: 1.3,
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

// ─── Main Component ───────────────────────────────────────────────────────────

const CalendarMonthView = ({
  calendarDays,
  currentMonth,
  onMonthChange,
  onDayClick,
  isLoading,
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

  const dayMap: Record<string, any[]> = {};
  days.forEach((d) => {
    const key = dayjs(d.date).format('YYYY-MM-DD');
    if (!dayMap[key]) dayMap[key] = [];
    dayMap[key].push(d);
  });

  const monthStart = currentMonth.startOf('month');
  const daysInMonth = monthStart.daysInMonth();
  const firstDayOfWeek = monthStart.day();
  const today = dayjs().format('YYYY-MM-DD');

  const cells: (null | dayjs.Dayjs)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => monthStart.add(i, 'day')),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthEvents = days
    .filter((d) => dayjs(d.date).format('YYYY-MM') === currentMonth.format('YYYY-MM'))
    .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());

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
                  const count = monthEvents.filter((e) => e.dayType === dt).length;
                  if (!count) return null;
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
                        backgroundColor: alpha(DAY_TYPE_COLORS[dt], 0.12),
                        border: `1px solid ${alpha(DAY_TYPE_COLORS[dt], 0.3)}`,
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: DAY_TYPE_COLORS[dt],
                        }}
                      />
                      <Typography
                        sx={{ fontSize: '11px', fontWeight: 700, color: DAY_TYPE_COLORS[dt] }}
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

        {/* Events panel */}
        {monthEvents.length > 0 && (
          <Paper
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
              boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.05)}`,
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: alpha(theme.palette.primary.main, 0.04),
              }}
            >
              <Stack direction="row" alignItems="center" gap={1}>
                <Iconify icon="mdi:calendar-star-outline" width={17} color="primary.main" />
                <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '13px' }}>
                  {currentMonth.format('MMMM')} Events
                </Typography>
              </Stack>
              <Label
                variant="soft"
                color="primary"
                sx={{
                  height: 18,
                  fontSize: '10px',
                  fontWeight: 700,
                }}
              >
                {monthEvents.length}
              </Label>
            </Box>

            <Box sx={{ maxHeight: 460, overflowY: 'auto' }}>
              <Stack>
                {monthEvents.map((ev, i) => {
                  const evColor = DAY_TYPE_COLORS[ev.dayType as DayType];
                  return (
                    <Box
                      key={i}
                      sx={{
                        px: 1.75,
                        py: 1.25,
                        borderLeft: `3px solid ${evColor}`,
                        borderBottom:
                          i < monthEvents.length - 1
                            ? `1px solid ${alpha(theme.palette.divider, 0.4)}`
                            : 'none',
                        '&:hover': { backgroundColor: alpha(evColor, 0.04) },
                        transition: 'background 0.15s',
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar
                          sx={{
                            width: 34,
                            height: 34,
                            borderRadius: 1.5,
                            backgroundColor: alpha(evColor, 0.14),
                            flexShrink: 0,
                          }}
                        >
                          <Typography
                            sx={{
                              color: evColor,
                              fontSize: '12px',
                              fontWeight: 800,
                              lineHeight: 1,
                            }}
                          >
                            {dayjs(ev.date).date()}
                          </Typography>
                        </Avatar>
                        <Box flex={1} overflow="hidden">
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            noWrap
                            sx={{ fontSize: '12.5px' }}
                          >
                            {ev.title}
                          </Typography>
                          <Stack direction="row" alignItems="center" gap={1} mt={0.3}>
                            <CalendarDayTypeChip dayType={ev.dayType} />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: '10.5px' }}
                            >
                              {dayjs(ev.date).format('ddd, DD MMM')}
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
        )}
      </Box>
    </Box>
  );
};

export default CalendarMonthView;
