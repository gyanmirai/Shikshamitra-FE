'use client';

import { varAlpha } from 'src/theme/styles';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Paper, Stack, Skeleton } from '@mui/material';
import { DayType, DAY_TYPE_COLORS } from 'src/enums/academic-calendar';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const LEGEND_ITEMS = [
  { type: DayType.Holiday, label: 'Holiday' },
  { type: DayType.Vacation, label: 'Vacation' },
  { type: DayType.HalfDay, label: 'Half Day' },
  { type: DayType.Event, label: 'Event' },
  { type: DayType.Exam, label: 'Exam' },
  { type: DayType.PTM, label: 'PTM' },
  { type: DayType.EmergencyClosure, label: 'Emergency' },
];

// ─── Single Month Skeleton Card ──────────────────────────────────────────────

export const MonthCardSkeleton = () => {
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
        <Skeleton variant="text" width={110} height={20} sx={{ borderRadius: 1 }} />
      </Box>

      {/* A single painted placeholder replaces 42 animated skeleton components. */}
      <Box
        sx={{
          height: 222,
          mx: 1,
          mb: 1.5,
          backgroundImage: `radial-gradient(circle, ${alpha(theme.palette.text.secondary, 0.1)} 0 11px, transparent 12px)`,
          backgroundPosition: 'center 18px',
          backgroundSize: 'calc(100% / 7) 34px',
        }}
      />
    </Paper>
  );
};

// ─── Year View Skeleton ───────────────────────────────────────────────────────

export const CalendarYearSkeleton = () => {
  const theme = useTheme();

  return (
    <Box
      aria-busy="true"
      aria-label="Loading academic calendar"
      sx={{ width: '100%', minWidth: 0, '& .MuiSkeleton-root': { animation: 'none' } }}
    >
      {/* Legend & Filter Bar Skeleton */}
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
          {/* Date range label skeleton */}
          <Stack direction="row" alignItems="center" gap={1} mr={1}>
            <Skeleton variant="circular" width={26} height={26} />
            <Skeleton variant="text" width={160} height={20} sx={{ borderRadius: 1 }} />
          </Stack>

          <Box
            sx={{
              height: 16,
              width: '1px',
              bgcolor: 'divider',
              display: { xs: 'none', sm: 'block' },
            }}
          />

          {/* Legend chips skeleton */}
          <Stack direction="row" flexWrap="wrap" gap={0.75} alignItems="center" flex={1}>
            {LEGEND_ITEMS.map(({ type }) => (
              <Stack
                key={type}
                direction="row"
                alignItems="center"
                gap={0.75}
                sx={{
                  border: `1px solid ${alpha(DAY_TYPE_COLORS[type], 0.25)}`,
                  borderRadius: 1.5,
                  px: 1,
                  py: 0.4,
                  backgroundColor: alpha(DAY_TYPE_COLORS[type], 0.03),
                }}
              >
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    backgroundColor: DAY_TYPE_COLORS[type],
                    opacity: 0.6,
                  }}
                />
                <Skeleton variant="text" width={45} height={14} sx={{ borderRadius: 0.5 }} />
              </Stack>
            ))}

            {/* Weekend / Today Legend skeletons */}
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
              <Skeleton variant="text" width={48} height={14} />
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  backgroundColor: alpha(theme.palette.primary.main, 0.4),
                  ml: 1,
                }}
              />
              <Skeleton variant="text" width={36} height={14} />
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      {/* Grid of 12 Months Skeleton */}
      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <Box key={i} sx={{ minWidth: 0, height: '100%' }}>
            <MonthCardSkeleton />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// ─── Month View Skeleton ──────────────────────────────────────────────────────

export const CalendarMonthSkeleton = () => {
  const theme = useTheme();

  return (
    <Box
      aria-busy="true"
      aria-label="Loading calendar month"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        gap: 1,
        alignItems: 'flex-start',
        '& .MuiSkeleton-root': { animation: 'none' },
      }}
    >
      {/* ── Main Calendar Grid Skeleton ───────────────────────────────────── */}
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
            <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: 1 }} />
            <Box sx={{ textAlign: 'center', px: 1.5 }}>
              <Skeleton variant="text" width={110} height={28} sx={{ borderRadius: 1 }} />
              <Skeleton variant="text" width={70} height={16} sx={{ mx: 'auto', borderRadius: 0.5 }} />
            </Box>
            <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: 1 }} />
          </Stack>

          <Stack direction="row" gap={1} alignItems="center">
            <Skeleton variant="rounded" width={55} height={26} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rounded" width={55} height={26} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rounded" width={65} height={30} sx={{ borderRadius: 2, ml: 0.5 }} />
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
              <Skeleton variant="text" width={30} height={16} sx={{ mx: 'auto' }} />
            </Box>
          ))}
        </Box>

        {/* Day grid: 35 cells (5 rows x 7 cols) */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {Array.from({ length: 35 }).map((_, idx) => (
            <Box
              key={idx}
              sx={{
                minHeight: 110,
                p: 1,
                borderRight: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                backgroundColor: idx % 7 === 0 || idx % 7 === 6 ? alpha(theme.palette.grey[500], 0.02) : 'transparent',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Skeleton variant="rounded" width={24} height={20} sx={{ borderRadius: 1 }} />
              </Stack>
              {idx % 3 === 0 && (
                <Skeleton
                  variant="rounded"
                  width="85%"
                  height={18}
                  sx={{ borderRadius: 1, mb: 0.5 }}
                />
              )}
              {idx % 5 === 0 && (
                <Skeleton variant="rounded" width="65%" height={18} sx={{ borderRadius: 1 }} />
              )}
            </Box>
          ))}
        </Box>
      </Paper>

      {/* ── Sidebar Skeleton ──────────────────────────────────────────────── */}
      <Box sx={{ width: { xs: '100%', lg: 300 }, flexShrink: 0 }}>
        {/* Today card */}
        <Paper
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            mb: 2,
            p: 2,
            textAlign: 'center',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(theme.palette.primary.light, 0.04)} 100%)`,
          }}
        >
          <Skeleton variant="text" width={40} height={14} sx={{ mx: 'auto', mb: 0.5 }} />
          <Skeleton variant="text" width={50} height={48} sx={{ mx: 'auto', my: 0.25 }} />
          <Skeleton variant="text" width={140} height={18} sx={{ mx: 'auto' }} />
        </Paper>

        {/* Upcoming events card */}
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
              <Skeleton variant="circular" width={17} height={17} />
              <Skeleton variant="text" width={100} height={18} />
            </Stack>
            <Skeleton variant="rounded" width={22} height={18} sx={{ borderRadius: 1 }} />
          </Box>

          <Box sx={{ p: 1.5 }}>
            <Stack spacing={1.5}>
              {[1, 2, 3, 4].map((item) => (
                <Stack key={item} direction="row" alignItems="center" spacing={1}>
                  <Skeleton variant="rounded" width={34} height={34} sx={{ borderRadius: 1.5, flexShrink: 0 }} />
                  <Box flex={1}>
                    <Skeleton variant="text" width="80%" height={16} />
                    <Skeleton variant="text" width="55%" height={12} />
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};
