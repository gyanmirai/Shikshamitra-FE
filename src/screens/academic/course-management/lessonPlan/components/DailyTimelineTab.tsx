'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import { GlobalIcons } from 'src/utils/icons';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import { LessonTimelineCard } from './LessonTimelineCard';
import {
  Box,
  Card,
  Grid,
  Stack,
  Alert,
  Paper,
  Button,
  MenuItem,
  Skeleton,
  Typography,
  IconButton,
  LinearProgress,
  Chip,
  Tooltip,
} from '@mui/material';

const planStatusColor: Record<
  string,
  'default' | 'primary' | 'success' | 'error' | 'warning' | 'info'
> = {
  Draft: 'default',
  Submitted: 'warning',
  Approved: 'success',
  Rejected: 'error',
  NeedsChanges: 'warning',
  Missed: 'error',
  Rescheduled: 'info',
};

const PLAN_STATUS_BY_VALUE = ['Draft', 'Submitted', 'Approved', 'Rejected', 'NeedsChanges'];

const toPlanStatusLabel = (status: unknown) =>
  typeof status === 'number'
    ? (PLAN_STATUS_BY_VALUE[status] ?? 'Draft')
    : String(status || 'Draft');

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
}: Props) => {
  const theme = useTheme();
  const popover = usePopover();
  const [menuPlan, setMenuPlan] = useState<any | null>(null);

  const handlePrevDay = () => onChangeDate(selectedDate.subtract(1, 'day'));
  const handleNextDay = () => onChangeDate(selectedDate.add(1, 'day'));
  const handleToday = () => onChangeDate(dayjs());

  const openCardMenu = (event: React.MouseEvent<HTMLElement>, plan: any) => {
    setMenuPlan(plan);
    popover.onOpen(event);
  };
  const closeCardMenu = () => {
    popover.onClose();
    setMenuPlan(null);
  };

  // Compute daily stats
  const totalSlots = slots.length;
  const plannedSlots = slots.filter((s) => !!s.lessonPlan).length;

  return (
    <Card
      sx={{
        p: 1,
        flex: '1 0 auto',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 'var(--shadows-4)',
      }}
    >
      {/* ── Top Header Bar & Controls ── */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', md: 'center' }}
          spacing={2}
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'background.neutral',
            border: (t) => `1px solid ${t.palette.divider}`,
          }}
        >
          {/* Date Picker Controls */}
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <IconButton
              onClick={handlePrevDay}
              size="small"
              sx={{
                bgcolor: 'background.paper',
                border: (t) => `1px solid ${t.palette.divider}`,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Iconify icon="mdi:chevron-left" width={20} />
            </IconButton>

            <DatePicker
              label="Selected Date"
              value={selectedDate}
              onChange={(newVal) => newVal && onChangeDate(newVal)}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  size: 'small',
                  sx: {
                    minWidth: 160,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                  },
                },
              }}
            />

            <IconButton
              onClick={handleNextDay}
              size="small"
              sx={{
                bgcolor: 'background.paper',
                border: (t) => `1px solid ${t.palette.divider}`,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Iconify icon="mdi:chevron-right" width={20} />
            </IconButton>

            <Button
              variant="outlined"
              size="small"
              onClick={handleToday}
              startIcon={<Iconify icon="solar:calendar-bold" width={16} />}
              sx={{ bgcolor: 'background.paper' }}
            >
              Today
            </Button>
          </Stack>

          {/* Timeline Date Header & Mini Summary Chips */}
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <Chip
              icon={<Iconify icon="solar:clock-circle-bold" width={16} />}
              label={`Timeline: ${selectedDate.format('dddd, DD MMMM YYYY')}`}
              variant="soft"
              color="primary"
              sx={{ fontWeight: 600, py: 2, px: 0.5 }}
            />
            {totalSlots > 0 && (
              <Stack direction="row" spacing={1}>
                <Tooltip title="Total Scheduled Periods">
                  <Chip
                    size="small"
                    label={`${plannedSlots}/${totalSlots} Planned`}
                    color={plannedSlots === totalSlots ? 'success' : 'warning'}
                    variant="soft"
                    sx={{ fontWeight: 700 }}
                  />
                </Tooltip>
              </Stack>
            )}
          </Stack>
        </Stack>
      </Stack>

      {/* ── Main Content Area: Loader / Empty / Timeline Slots ── */}
      {isLoading ? (
        <Stack spacing={2} sx={{ flex: 1 }}>
          {[1, 2, 3].map((key) => (
            <Paper
              key={key}
              variant="outlined"
              sx={{ p: 2.5, borderRadius: 2, bgcolor: 'background.neutral' }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 3 }}>
                  <Skeleton
                    variant="rectangular"
                    width={120}
                    height={42}
                    sx={{ borderRadius: 1 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Skeleton variant="text" width="70%" height={24} />
                  <Skeleton variant="text" width="40%" height={20} />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Skeleton
                    variant="rectangular"
                    width={110}
                    height={36}
                    sx={{ borderRadius: 1, ml: 'auto' }}
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Stack>
      ) : slots.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8,
            px: 2,
            borderRadius: 2,
            borderStyle: 'dashed',
            bgcolor: 'background.neutral',
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.1),
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <Iconify icon="solar:calendar-minimalistic-bold" width={36} />
          </Box>
          <Typography variant="h6" fontWeight={700} color="text.primary">
            No Timetable Slots Scheduled
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380, mt: 0.5 }}>
            There are no teaching periods assigned to your schedule for this date. Select another
            date using the date picker above.
          </Typography>
        </Paper>
      ) : (
        /* Timeline slots track */
        <Stack spacing={2} sx={{ flex: 1, overflow: 'auto', pr: 0.5 }}>
          {slots.map((slot, index) => (
            <LessonTimelineCard
              key={slot.timetableSlotId ?? `manual-${slot.lessonPlan?.id ?? slot.lessonPlan?.Id ?? index}`}
              slot={slot}
              selectedDate={selectedDate}
              onAddLesson={onAddLesson}
              onEditLesson={onEditLesson}
              onViewDetails={onViewDetails}
              onSubmitDiary={onSubmitDiary}
              onSubmitPlan={onSubmitPlan}
              openCardMenu={openCardMenu}
            />
          ))}
        </Stack>
      )}

      {/* Overflow menu */}
      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={closeCardMenu}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuItem
          onClick={() => {
            if (menuPlan) onViewDetails(menuPlan);
            closeCardMenu();
          }}
        >
          <Iconify icon={GlobalIcons.eye} width={18} sx={{ mr: 1, color: 'text.secondary' }} />
          View Details
        </MenuItem>
        {['Draft', 'NeedsChanges', 'Rejected'].includes(menuPlan?.status) && (
          <MenuItem
            onClick={() => {
              if (menuPlan) onEditLesson(menuPlan);
              closeCardMenu();
            }}
          >
            <Iconify icon={GlobalIcons.edit} width={18} sx={{ mr: 1, color: 'primary.main' }} />
            Edit Plan
          </MenuItem>
        )}
        {menuPlan?.status === 'Approved' && (
          <MenuItem
            onClick={() => {
              if (menuPlan) onCreateHomework?.(menuPlan);
              closeCardMenu();
            }}
          >
            <Iconify
              icon="solar:book-bookmark-bold"
              width={18}
              sx={{ mr: 1, color: 'success.main' }}
            />
            Create Homework
          </MenuItem>
        )}
      </CustomPopover>
    </Card>
  );
};

export default DailyTimelineTab;
