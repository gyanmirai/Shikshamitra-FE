'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import {
  Box,
  Card,
  Grid,
  Stack,
  Alert,
  Menu,
  Button,
  MenuItem,
  Skeleton,
  Typography,
  IconButton,
  LinearProgress,
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
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [menuPlan, setMenuPlan] = useState<any | null>(null);

  const handlePrevDay = () => onChangeDate(selectedDate.subtract(1, 'day'));
  const handleNextDay = () => onChangeDate(selectedDate.add(1, 'day'));
  const handleToday = () => onChangeDate(dayjs());

  const openCardMenu = (target: HTMLElement, plan: any) => {
    setMenuAnchorEl(target);
    setMenuPlan(plan);
  };
  const closeCardMenu = () => {
    setMenuAnchorEl(null);
    setMenuPlan(null);
  };

  return (
    <Card sx={{ p: 3, height: '100%' }}>
      {/* Date navigation bar */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        spacing={1}
        sx={{ mb: 4 }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton onClick={handlePrevDay} title="Previous Day">
            <Iconify icon="mdi:chevron-left" />
          </IconButton>
          <DatePicker
            label="Selected Date"
            value={selectedDate}
            onChange={(newVal) => newVal && onChangeDate(newVal)}
            format="DD/MM/YYYY"
            slotProps={{ textField: { size: 'small', sx: { minWidth: 160 } } }}
          />
          <IconButton onClick={handleNextDay} title="Next Day">
            <Iconify icon="mdi:chevron-right" />
          </IconButton>
          <Button variant="outlined" size="small" onClick={handleToday} sx={{ ml: 1 }}>
            Today
          </Button>
        </Stack>

        <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
          Showing timeline for:{' '}
          <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
            {selectedDate.format('dddd, DD MMMM YYYY')}
          </Box>
        </Typography>
      </Stack>

      {/* Skeletons loader */}
      {isLoading ? (
        <Stack spacing={1}>
          {[1, 2, 3].map((key) => (
            <Box
              key={key}
              sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
            >
              <Grid container spacing={1}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Skeleton variant="rectangular" width={100} height={40} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Skeleton variant="rectangular" width="100%" height={32} />
                </Grid>
              </Grid>
            </Box>
          ))}
        </Stack>
      ) : slots.length === 0 ? (
        <Stack alignItems="center" spacing={1} sx={{ py: 6, textAlign: 'center' }}>
          <Iconify icon="mdi:calendar-blank" width={48} sx={{ color: 'text.disabled' }} />
          <Typography variant="h6" color="text.secondary">
            No timetable slots scheduled
          </Typography>
          <Typography variant="body2" color="text.disabled">
            No classes scheduled on this date.
          </Typography>
        </Stack>
      ) : (
        /* Timeline slots list */
        <Stack spacing={1}>
          {slots.map((slot, index) => {
            const hasPlan = !!slot.lessonPlan;
            const plan = slot.lessonPlan;
            const planStatus = toPlanStatusLabel(plan?.status);
            const normalizedPlan = hasPlan
              ? {
                ...plan,
                status: planStatus,
                planStatus,
                className: plan.className || plan.standardName || slot.standardName,
                divisionName: plan.divisionName || slot.divisionName,
                subjectName: plan.subjectName || slot.subjectName,
              }
              : null;
            const insightSeverity =
              slot.insightSeverity === 'error' || slot.insightSeverity === 'warning'
                ? slot.insightSeverity
                : 'info';

            // Manual/unscheduled slot: no timetable slot id and no start time
            const isManualSlot = !slot.timetableSlotId && !slot.startTime;

            return (
              <Box
                key={slot.timetableSlotId ?? `manual-${plan?.id ?? plan?.Id ?? index}`}
                sx={{
                  p: 2.5,
                  borderRadius: 1.5,
                  border: '1px solid',
                  // Left accent border for NeedsChanges / Rejected
                  borderLeft: hasPlan && (planStatus === 'NeedsChanges' || planStatus === 'Rejected')
                    ? '4px solid'
                    : '1px solid',
                  borderLeftColor:
                    planStatus === 'NeedsChanges'
                      ? 'warning.main'
                      : planStatus === 'Rejected'
                        ? 'error.main'
                        : undefined,
                  borderStyle: hasPlan ? 'solid' : 'dashed',
                  borderColor: hasPlan
                    ? planStatus === 'Approved'
                      ? 'success.light'
                      : planStatus === 'NeedsChanges'
                        ? 'warning.light'
                        : planStatus === 'Rejected'
                          ? 'error.light'
                          : 'divider'
                    : 'divider',
                  bgcolor: hasPlan ? 'background.neutral' : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: (theme) => theme.customShadows.z8,
                  },
                }}
              >
                <Grid container spacing={1} alignItems="flex-start">
                  {/* Period & Time slot info */}
                  <Grid size={{ xs: 12, md: 3 }}>
                    {isManualSlot ? (
                      /* ── Manual / Unscheduled slot header (mirrors period block) ── */
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 1,
                            bgcolor: 'grey.100',
                            color: 'text.secondary',
                            display: 'flex',
                          }}
                        >
                          <Iconify icon="mdi:calendar-edit-outline" width={20} />
                        </Box>
                        <Box>
                          <Label color="default" variant="soft">
                            Manual Plan
                          </Label>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Grade {slot.standardName}
                            {slot.divisionName ? `-${slot.divisionName}` : ''}
                          </Typography>
                        </Box>
                      </Stack>
                    ) : (
                      /* ── Regular timetable period ── */
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 1,
                            bgcolor: 'primary.lighter',
                            color: 'primary.dark',
                            textAlign: 'center',
                            minWidth: 80,
                          }}
                        >
                          <Typography variant="subtitle2" fontWeight={700}>
                            {slot.periodName}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {slot.startTime} – {slot.endTime}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Grade {slot.standardName}-{slot.divisionName}
                          </Typography>
                        </Box>
                      </Stack>
                    )}
                  </Grid>

                  {/* Slot Details (Plan Info / Actions) */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    {hasPlan ? (
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                            {slot.subjectName} — {plan.chapterName || 'Curriculum'}
                          </Typography>
                          <Label color={planStatusColor[planStatus] || 'default'} variant="soft">
                            {planStatus}
                          </Label>
                          {plan.isAiGenerated && (
                            <Label
                              color="secondary"
                              variant="soft"
                              startIcon={<Iconify icon="mdi:robot-outline" width={12} />}
                            >
                              AI
                            </Label>
                          )}
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          Topic: <strong>{plan.topic}</strong>
                        </Typography>
                        {plan.learningObjective && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Objective: {plan.learningObjective}
                          </Typography>
                        )}
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Planned completion: <strong>{plan.plannedCompletionPercentage}%</strong>
                          </Typography>
                          <Box sx={{ width: 100 }}>
                            <LinearProgress
                              variant="determinate"
                              value={plan.plannedCompletionPercentage}
                              sx={{ height: 4, borderRadius: 1 }}
                            />
                          </Box>
                        </Stack>
                      </Stack>
                    ) : (
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Iconify
                            icon={
                              slot.isPlanCreationBlocked
                                ? 'mdi:calendar-remove-outline'
                                : 'mdi:calendar-blank-outline'
                            }
                            color="text.disabled"
                            width={24}
                          />
                          <Typography variant="body2" color="text.disabled" fontStyle="italic">
                            {slot.isPlanCreationBlocked
                              ? 'This period is unavailable for lesson planning.'
                              : 'No lesson plan created for this period. Click Create Plan to draft one.'}
                          </Typography>
                        </Stack>
                        {slot.insightMessage && (
                          <Alert
                            severity={insightSeverity}
                            icon={<Iconify icon="mdi:information-outline" />}
                            sx={{ py: 0.25, px: 1 }}
                          >
                            {slot.insightMessage}
                          </Alert>
                        )}
                      </Stack>
                    )}
                  </Grid>

                  {/* Actions Panel — single primary action + overflow (⋮) menu */}
                  <Grid size={{ xs: 12, md: 3 }}>
                    {hasPlan ? (
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                        alignItems="center"
                      >
                        {/* Primary action by status */}
                        {['Draft', 'NeedsChanges', 'Rejected'].includes(planStatus) && (
                          <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            startIcon={<Iconify icon="mdi:send-outline" />}
                            onClick={() => onSubmitPlan(plan.id || plan.Id)}
                          >
                            Submit
                          </Button>
                        )}
                        {planStatus === 'Approved' && (
                          <Button
                            variant="contained"
                            size="small"
                            color="success"
                            startIcon={<Iconify icon="mdi:notebook-edit-outline" />}
                            onClick={() => normalizedPlan && onSubmitDiary(normalizedPlan)}
                          >
                            Record Diary
                          </Button>
                        )}
                        {planStatus === 'Submitted' && (
                          <Button
                            variant="outlined"
                            size="small"
                            disabled
                            startIcon={<Iconify icon="mdi:clock-outline" />}
                          >
                            Pending HOD
                          </Button>
                        )}

                        {/* Secondary actions collapsed into ⋮ overflow */}
                        {planStatus !== 'Submitted' && (
                          <IconButton
                            size="small"
                            title="More actions"
                            onClick={(e) =>
                              normalizedPlan && openCardMenu(e.currentTarget, normalizedPlan)
                            }
                          >
                            <Iconify icon="mdi:dots-vertical" />
                          </IconButton>
                        )}
                      </Stack>
                    ) : (
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                        alignItems="center"
                      >
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          startIcon={<Iconify icon="mdi:plus-circle-outline" />}
                          disabled={slot.isPlanCreationBlocked}
                          onClick={() =>
                            onAddLesson(selectedDate, {
                              timetableSlotId: slot.timetableSlotId,
                              period: slot.periodName,
                              className: slot.standardName,
                              divisionName: slot.divisionName,
                              subjectName: slot.subjectName,
                              standardId: slot.standardId,
                              divisionId: slot.divisionId,
                              subjectId: slot.subjectId,
                            })
                          }
                        >
                          {slot.isPlanCreationBlocked ? 'On Leave' : 'Create Plan'}
                        </Button>
                      </Stack>
                    )}
                  </Grid>
                </Grid>

                {/* ── Full-width footer: HOD remarks + plan insight (only when present) ── */}
                {hasPlan &&
                  ((planStatus === 'NeedsChanges' && plan.reviewRemarks) ||
                    plan.insightMessage) && (
                    <Stack
                      spacing={0.5}
                      direction={{ xs: 'column', sm: 'row' }}
                      sx={{ mt: 1.5, pt: 1.5, borderTop: '1px dashed', borderColor: 'divider' }}
                    >
                      {planStatus === 'NeedsChanges' && plan.reviewRemarks && (
                        <Alert
                          severity="warning"
                          icon={<Iconify icon="mdi:alert-circle-outline" />}
                          sx={{
                            flex: 1,
                            py: 0.75,
                            px: 1.5,
                            alignItems: 'center',
                            borderLeft: '4px solid',
                            borderColor: 'warning.main',
                          }}
                        >
                          <strong>HOD Remarks:</strong> {plan.reviewRemarks}
                        </Alert>
                      )}
                      {plan.insightMessage && (
                        <Alert
                          severity={plan.insightSeverity === 'error' ? 'error' : 'warning'}
                          icon={<Iconify icon="mdi:information-outline" />}
                          sx={{ flex: 1, py: 0.75, px: 1.5, alignItems: 'center' }}
                        >
                          {plan.insightMessage}
                        </Alert>
                      )}
                    </Stack>
                  )}
              </Box>
            );
          })}
        </Stack>
      )}

      {/* Card action overflow menu — View / Edit / Homework driven by the selected plan's status */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={closeCardMenu}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            if (menuPlan) onViewDetails(menuPlan);
            closeCardMenu();
          }}
        >
          <Iconify icon="mdi:eye-outline" width={18} sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        {['Draft', 'NeedsChanges', 'Rejected'].includes(menuPlan?.status) && (
          <MenuItem
            onClick={() => {
              if (menuPlan) onEditLesson(menuPlan);
              closeCardMenu();
            }}
          >
            <Iconify icon="mdi:pencil-outline" width={18} sx={{ mr: 1 }} />
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
            <Iconify icon="mdi:book-plus-outline" width={18} sx={{ mr: 1 }} />
            Create Homework
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};

export default DailyTimelineTab;
