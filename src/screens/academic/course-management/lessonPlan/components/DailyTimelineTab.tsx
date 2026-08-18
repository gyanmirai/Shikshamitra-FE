'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import React, { useState, useMemo } from 'react';
import { varAlpha } from 'src/theme/styles';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Card,
  Stack,
  Paper,
  Button,
  Typography,
} from '@mui/material';

import { DayHeaderNavigator } from './timeline/DayHeaderNavigator';
import { DailySummaryRow } from './timeline/DailySummaryRow';
import { TimelineTrack } from './timeline/TimelineTrack';
import { DaySummaryDrawer } from './timeline/DaySummaryDrawer';
import { TimelineSkeleton } from './timeline/TimelineSkeleton';
import { getLessonStatusConfig } from './lessonTimelineConfig';

type Props = {
  selectedDate: Dayjs;
  onChangeDate: (date: Dayjs) => void;
  slots: any[];
  isLoading: boolean;
  onAddLesson: (date: Dayjs, prefill?: any) => void;
  onEditLesson: (plan: any) => void;
  onViewDetails: (plan: any) => void;
  onSubmitDiary: (plan: any) => void;
  onSubmitPlan: (planId: string) => void;
  onCreateHomework?: (plan: any) => void;
  onViewTimetable?: () => void;
};

const DailyTimelineTab = ({
  selectedDate,
  onChangeDate,
  slots = [],
  isLoading,
  onAddLesson,
  onEditLesson,
  onViewDetails,
  onSubmitDiary,
  onSubmitPlan,
  onCreateHomework,
  onViewTimetable,
}: Props) => {
  const theme = useTheme();
  const [summaryDrawerOpen, setSummaryDrawerOpen] = useState(false);

  // Compute daily KPI stats
  const dailyStats = useMemo(() => {
    let completedCount = 0;
    let inProgressCount = 0;
    let needsAttnCount = 0;
    let upcomingCount = 0;
    let plannedCount = 0;

    slots.forEach((slot) => {
      const config = getLessonStatusConfig(slot, selectedDate);
      if (slot.lessonPlan) plannedCount++;

      if (config.stateKey === 'completed') {
        completedCount++;
      } else if (config.stateKey === 'inProgress') {
        inProgressCount++;
      } else if (config.stateKey === 'needsChanges' || config.stateKey === 'rejected') {
        needsAttnCount++;
      } else {
        upcomingCount++;
      }
    });

    return {
      total: slots.length,
      completed: completedCount,
      inProgress: inProgressCount,
      needsAttention: needsAttnCount,
      upcoming: upcomingCount,
      planned: plannedCount,
    };
  }, [slots, selectedDate]);

  return (
    <Card
      sx={{
        p: { xs: 1.25, sm: 2 },
        flex: '1 0 auto',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 'var(--shadows-2)',
      }}
    >
      {/* ── 1. Compact Date Navigation Toolbar ── */}
      <DayHeaderNavigator
        selectedDate={selectedDate}
        onChangeDate={onChangeDate}
        plannedCount={dailyStats.planned}
        totalCount={dailyStats.total}
        onOpenSummaryDrawer={() => setSummaryDrawerOpen(true)}
      />

      {/* ── 2. Subtle, Single-Line Daily Summary Row ── */}
      <DailySummaryRow stats={dailyStats} />

      {/* ── 3. Main Timeline Area (Cards with Direct Actions, No Attention Banner) ── */}
      {isLoading ? (
        <TimelineSkeleton />
      ) : slots.length === 0 ? (
        /* Empty State */
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 7,
            px: 3,
            borderRadius: 1.5,
            borderStyle: 'dashed',
            bgcolor: 'background.neutral',
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.1),
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1.5,
            }}
          >
            <Iconify icon="solar:calendar-minimalistic-bold" width={32} />
          </Box>

          <Typography variant="subtitle1" fontWeight={800} color="text.primary">
            No Lessons Scheduled for Today
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: 400, mt: 0.5, mb: 2 }}
          >
            No teaching periods are assigned for {selectedDate.format('dddd, DD MMMM YYYY')}.
            Select another date above or create a lesson plan.
          </Typography>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<Iconify icon="solar:add-circle-bold" width={16} />}
              onClick={() => onAddLesson(selectedDate)}
              sx={{ fontWeight: 700 }}
            >
              Create Lesson Plan
            </Button>

            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<Iconify icon="solar:calendar-bold" width={16} />}
              onClick={() => onChangeDate(dayjs())}
              sx={{ fontWeight: 600 }}
            >
              Go to Today
            </Button>
          </Stack>
        </Paper>
      ) : (
        /* Full-Width Timeline Layout */
        <Stack spacing={1.25} sx={{ flex: 1 }}>
          <TimelineTrack
            slots={slots}
            selectedDate={selectedDate}
            onAddLesson={onAddLesson}
            onEditLesson={onEditLesson}
            onViewDetails={onViewDetails}
            onSubmitDiary={onSubmitDiary}
            onSubmitPlan={onSubmitPlan}
            onCreateHomework={onCreateHomework}
          />
        </Stack>
      )}

      {/* ── 4. Slide-Out Day Summary Drawer (On-Demand) ── */}
      <DaySummaryDrawer
        open={summaryDrawerOpen}
        onClose={() => setSummaryDrawerOpen(false)}
        slots={slots}
        selectedDate={selectedDate}
        onAddLesson={onAddLesson}
        onOpenQuickDiary={() => {
          const activeOrFirstSlot =
            slots.find((s) => s.lessonPlan && s.lessonPlan.status === 'Approved') ||
            slots.find((s) => s.lessonPlan);
          if (activeOrFirstSlot?.lessonPlan) {
            onSubmitDiary(activeOrFirstSlot.lessonPlan);
          } else {
            onAddLesson(selectedDate);
          }
        }}
        onViewTimetable={onViewTimetable}
      />
    </Card>
  );
};

export default DailyTimelineTab;
