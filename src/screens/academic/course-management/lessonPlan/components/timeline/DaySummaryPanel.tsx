'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { varAlpha } from 'src/theme/styles';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Stack,
  Paper,
  Button,
  Divider,
  Typography,
  LinearProgress,
} from '@mui/material';

import {
  getLessonStatusConfig,
  parseSlotTime,
  isSlotCurrentlyActive,
} from '../lessonTimelineConfig';

type Props = {
  slots: any[];
  selectedDate: Dayjs;
  onAddLesson: (date: Dayjs) => void;
  onOpenQuickDiary?: () => void;
  onViewTimetable?: () => void;
};

export const DaySummaryPanel: React.FC<Props> = ({
  slots = [],
  selectedDate,
  onAddLesson,
  onOpenQuickDiary,
  onViewTimetable,
}) => {
  const theme = useTheme();

  // Compute stats
  const {
    total,
    completed,
    needsAttention,
    upcoming,
    totalTeachingMinutes,
    overallCompletionRate,
    nextSlot,
  } = useMemo(() => {
    let completedCount = 0;
    let needsAttnCount = 0;
    let upcomingCount = 0;
    let totalMinutes = 0;
    let totalProgressSum = 0;
    let plansCount = 0;

    let foundNext: any = null;
    const now = dayjs();
    const isToday = selectedDate.isSame(now, 'day');

    slots.forEach((slot) => {
      const config = getLessonStatusConfig(slot, selectedDate);
      const plan = slot.lessonPlan;

      // Duration
      const start = parseSlotTime(slot.startTime, selectedDate);
      const end = parseSlotTime(slot.endTime, selectedDate);
      if (start && end && end.isAfter(start)) {
        totalMinutes += end.diff(start, 'minute');
      } else {
        totalMinutes += 40; // Default 40 min period if unstated
      }

      if (config.stateKey === 'completed') {
        completedCount++;
      } else if (config.stateKey === 'needsChanges' || config.stateKey === 'rejected') {
        needsAttnCount++;
      } else if (config.stateKey === 'scheduled' || config.stateKey === 'draft' || config.stateKey === 'unplanned') {
        upcomingCount++;
      }

      if (plan) {
        plansCount++;
        const pct = Number(plan.plannedCompletionPercentage ?? plan.actualCompletionPercentage ?? 0);
        totalProgressSum += pct;
      }

      // Detect Next Up
      if (!foundNext) {
        if (isToday && start && start.isAfter(now)) {
          foundNext = slot;
        } else if (!isToday && config.stateKey === 'scheduled') {
          foundNext = slot;
        }
      }
    });

    const slotCount = slots.length;
    const completionRate =
      slotCount > 0 ? Math.round((completedCount / slotCount) * 100) : 0;

    return {
      total: slotCount,
      completed: completedCount,
      needsAttention: needsAttnCount,
      upcoming: upcomingCount,
      totalTeachingMinutes: totalMinutes,
      overallCompletionRate: completionRate,
      nextSlot: foundNext || slots[0],
    };
  }, [slots, selectedDate]);

  const teachingHoursFormatted = useMemo(() => {
    if (totalTeachingMinutes <= 0) return '0h';
    const h = Math.floor(totalTeachingMinutes / 60);
    const m = totalTeachingMinutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }, [totalTeachingMinutes]);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
        position: 'sticky',
        top: 0,
        boxShadow: 'var(--shadows-2)',
      }}
    >
      <Stack spacing={2}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon="solar:chart-square-bold" width={20} sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle2" fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Today's Summary
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {selectedDate.format('MMM DD')}
          </Typography>
        </Stack>

        <Divider />

        {/* Core Metrics 2x2 Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1.25,
          }}
        >
          {/* Total Periods */}
          <Box
            sx={{
              p: 1.25,
              borderRadius: 1.5,
              bgcolor: (t) => varAlpha(t.vars.palette.grey['500Channel'], 0.06),
              border: (t) => `1px solid ${t.palette.divider}`,
            }}
          >
            <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ lineHeight: 1 }}>
              {total}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mt: 0.5, display: 'block' }}>
              Total Periods
            </Typography>
          </Box>

          {/* Completed */}
          <Box
            sx={{
              p: 1.25,
              borderRadius: 1.5,
              bgcolor: (t) => varAlpha(t.vars.palette.success.mainChannel, 0.08),
              border: (t) => `1px solid ${varAlpha(t.vars.palette.success.mainChannel, 0.2)}`,
            }}
          >
            <Typography variant="h5" fontWeight={800} color="success.dark" sx={{ lineHeight: 1 }}>
              {completed}
            </Typography>
            <Typography variant="caption" color="success.dark" fontWeight={600} sx={{ mt: 0.5, display: 'block' }}>
              Completed
            </Typography>
          </Box>

          {/* Needs Attention */}
          <Box
            sx={{
              p: 1.25,
              borderRadius: 1.5,
              bgcolor: (t) => varAlpha(t.vars.palette.warning.mainChannel, 0.08),
              border: (t) => `1px solid ${varAlpha(t.vars.palette.warning.mainChannel, 0.2)}`,
            }}
          >
            <Typography variant="h5" fontWeight={800} color="warning.dark" sx={{ lineHeight: 1 }}>
              {needsAttention}
            </Typography>
            <Typography variant="caption" color="warning.dark" fontWeight={600} sx={{ mt: 0.5, display: 'block' }}>
              Needs Attention
            </Typography>
          </Box>

          {/* Upcoming */}
          <Box
            sx={{
              p: 1.25,
              borderRadius: 1.5,
              bgcolor: (t) => varAlpha(t.vars.palette.info.mainChannel, 0.08),
              border: (t) => `1px solid ${varAlpha(t.vars.palette.info.mainChannel, 0.2)}`,
            }}
          >
            <Typography variant="h5" fontWeight={800} color="info.dark" sx={{ lineHeight: 1 }}>
              {upcoming}
            </Typography>
            <Typography variant="caption" color="info.dark" fontWeight={600} sx={{ mt: 0.5, display: 'block' }}>
              Upcoming
            </Typography>
          </Box>
        </Box>

        {/* Teaching Hours & Daily Completion Progress */}
        <Stack spacing={1.5} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              Teaching Hours
            </Typography>
            <Typography variant="subtitle2" fontWeight={800} color="text.primary">
              {teachingHoursFormatted}
            </Typography>
          </Stack>

          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                Daily Completion
              </Typography>
              <Typography variant="caption" fontWeight={800} color="primary.main">
                {overallCompletionRate}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={overallCompletionRate}
              color="primary"
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        </Stack>

        {/* Next Up Class Card (if available) */}
        {nextSlot && (
          <Paper
            variant="outlined"
            sx={{
              p: 1.25,
              borderRadius: 1.5,
              bgcolor: 'background.paper',
              border: (t) => `1px dashed ${t.palette.divider}`,
            }}
          >
            <Typography variant="caption" color="text.disabled" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Next Up
            </Typography>
            <Typography variant="subtitle2" fontWeight={800} color="text.primary" sx={{ mt: 0.25 }}>
              {nextSlot.subjectName || nextSlot.lessonPlan?.subjectName || 'Next Class'}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
              <Typography variant="caption" color="text.secondary">
                {nextSlot.startTime || 'Scheduled'} · Grade {nextSlot.standardName}
              </Typography>
            </Stack>
          </Paper>
        )}

        <Divider />

        {/* Quick Actions */}
        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Quick Actions
          </Typography>

          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<Iconify icon="solar:add-circle-bold" width={16} />}
            onClick={() => onAddLesson(selectedDate)}
            fullWidth
            sx={{ fontWeight: 700, py: 0.75 }}
          >
            Create Lesson Plan
          </Button>

          {onOpenQuickDiary && (
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<Iconify icon="solar:notebook-bookmark-bold" width={16} />}
              onClick={onOpenQuickDiary}
              fullWidth
              sx={{ fontWeight: 600, py: 0.75 }}
            >
              Record Diary
            </Button>
          )}

          {onViewTimetable && (
            <Button
              variant="text"
              color="inherit"
              size="small"
              startIcon={<Iconify icon="solar:calendar-linear" width={16} />}
              onClick={onViewTimetable}
              fullWidth
              sx={{ fontWeight: 600, fontSize: 12 }}
            >
              View Full Timetable
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default DaySummaryPanel;
