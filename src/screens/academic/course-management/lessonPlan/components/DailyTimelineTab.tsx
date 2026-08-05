'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import {
  Box,
  Card,
  Grid,
  Stack,
  Alert,
  Menu,
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
  isReadOnly?: boolean;
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
  isReadOnly = false,
}: Props) => {
  const theme = useTheme();
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

  // Compute daily stats
  const totalSlots = slots.length;
  const plannedSlots = slots.filter((s) => !!s.lessonPlan).length;

  return (
    <Card
      sx={{
        p: { xs: 2, md: 3 },
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
      <Stack spacing={2} sx={{ mb: 3 }}>
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

            const isManualSlot = !slot.timetableSlotId && !slot.startTime;

            // Border status color mapping
            const cardAccentColor = hasPlan
              ? planStatus === 'Approved'
                ? theme.palette.success.main
                : planStatus === 'NeedsChanges'
                  ? theme.palette.warning.main
                  : planStatus === 'Rejected'
                    ? theme.palette.error.main
                    : theme.palette.info.main
              : theme.palette.divider;

            return (
              <Paper
                key={slot.timetableSlotId ?? `manual-${plan?.id ?? plan?.Id ?? index}`}
                variant="outlined"
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: 2,
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  borderLeft: `4px solid ${cardAccentColor}`,
                  bgcolor: hasPlan ? 'background.paper' : 'background.neutral',
                  boxShadow: 'var(--shadows-2)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 'var(--shadows-8)',
                    borderColor: hasPlan ? cardAccentColor : 'primary.main',
                  },
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  {/* Period & Time Slot Section */}
                  <Grid size={{ xs: 12, md: 3.5 }}>
                    {isManualSlot ? (
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            p: 1.25,
                            borderRadius: 1.5,
                            bgcolor: 'action.selected',
                            color: 'text.secondary',
                            display: 'flex',
                          }}
                        >
                          <Iconify icon="solar:pen-new-square-bold" width={22} />
                        </Box>
                        <Box>
                          <Label color="default" variant="soft" sx={{ fontWeight: 700 }}>
                            Manual Plan
                          </Label>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{ mt: 0.5 }}
                          >
                            Grade {slot.standardName}
                            {slot.divisionName ? `-${slot.divisionName}` : ''}
                          </Typography>
                        </Box>
                      </Stack>
                    ) : (
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            px: 1.75,
                            py: 1,
                            borderRadius: 1.5,
                            bgcolor: (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.1),
                            color: 'primary.main',
                            textAlign: 'center',
                            minWidth: 84,
                            border: (t) =>
                              `1px solid ${varAlpha(t.vars.palette.primary.mainChannel, 0.2)}`,
                          }}
                        >
                          <Typography variant="subtitle2" fontWeight={800} fontSize={13}>
                            {slot.periodName}
                          </Typography>
                        </Box>

                        <Stack spacing={0.25}>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <Iconify
                              icon="solar:clock-circle-bold"
                              width={14}
                              color="text.secondary"
                            />
                            <Typography variant="body2" fontWeight={700} color="text.primary">
                              {slot.startTime} – {slot.endTime}
                            </Typography>
                          </Stack>

                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <Chip
                              size="small"
                              label={`Grade ${slot.standardName}-${slot.divisionName}`}
                              variant="outlined"
                              sx={{ height: 20, fontSize: 11, fontWeight: 600 }}
                            />
                          </Stack>
                        </Stack>
                      </Stack>
                    )}
                  </Grid>

                  {/* Slot Details (Plan Info or Draft Prompt) */}
                  <Grid size={{ xs: 12, md: 5.5 }}>
                    {hasPlan ? (
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                            {slot.subjectName} — {plan.chapterName || 'Curriculum'}
                          </Typography>
                          <Label color={planStatusColor[planStatus] || 'default'} variant="soft">
                            {planStatus}
                          </Label>
                          {plan.isAiGenerated && (
                            <Label
                              color="secondary"
                              variant="soft"
                              startIcon={
                                <Iconify icon="solar:stars-minimalistic-bold" width={12} />
                              }
                            >
                              AI Generated
                            </Label>
                          )}
                        </Stack>

                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
                          Topic: <strong>{plan.topic}</strong>
                        </Typography>

                        {plan.learningObjective && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            noWrap
                            sx={{ maxWidth: 400 }}
                          >
                            Objective: {plan.learningObjective}
                          </Typography>
                        )}

                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            Completion: {plan.plannedCompletionPercentage}%
                          </Typography>
                          <Box sx={{ width: 120 }}>
                            <LinearProgress
                              variant="determinate"
                              value={plan.plannedCompletionPercentage}
                              color={
                                plan.plannedCompletionPercentage >= 100 ? 'success' : 'primary'
                              }
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                          </Box>
                        </Stack>
                      </Stack>
                    ) : (
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1.25} alignItems="center">
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: 'action.hover',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'text.disabled',
                              flexShrink: 0,
                            }}
                          >
                            <Iconify
                              icon={
                                slot.isPlanCreationBlocked
                                  ? 'solar:calendar-minimalistic-bold'
                                  : 'solar:document-add-bold'
                              }
                              width={18}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" fontStyle="italic">
                            {slot.isPlanCreationBlocked
                              ? 'This period is unavailable for lesson planning.'
                              : 'No lesson plan created for this period.'}
                          </Typography>
                        </Stack>

                        {slot.insightMessage && (
                          <Alert
                            severity={insightSeverity}
                            icon={<Iconify icon="solar:info-circle-bold" width={18} />}
                            sx={{ py: 0.5, px: 1.5, borderRadius: 1 }}
                          >
                            {slot.insightMessage}
                          </Alert>
                        )}
                      </Stack>
                    )}
                  </Grid>

                  {/* Actions Panel */}
                  <Grid size={{ xs: 12, md: 3 }}>
                    {hasPlan ? (
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                        alignItems="center"
                      >
                        {isReadOnly ? (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Iconify icon="solar:eye-bold" width={16} />}
                            onClick={() => normalizedPlan && onViewDetails(normalizedPlan)}
                          >
                            View Details
                          </Button>
                        ) : (
                          <>
                            {['Draft', 'NeedsChanges', 'Rejected'].includes(planStatus) && (
                              <Button
                                variant="contained"
                                size="small"
                                color="primary"
                                startIcon={<Iconify icon="solar:plain-bold" width={16} />}
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
                                startIcon={<Iconify icon="solar:notebook-bookmark-bold" width={16} />}
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
                                startIcon={<Iconify icon="solar:clock-circle-bold" width={16} />}
                              >
                                Pending HOD
                              </Button>
                            )}

                            {planStatus !== 'Submitted' && (
                              <IconButton
                                size="small"
                                title="More actions"
                                onClick={(e) =>
                                  normalizedPlan && openCardMenu(e.currentTarget, normalizedPlan)
                                }
                                sx={{
                                  border: (t) => `1px solid ${t.palette.divider}`,
                                  '&:hover': { bgcolor: 'action.hover' },
                                }}
                              >
                                <Iconify icon="eva:more-vertical-fill" width={18} />
                              </IconButton>
                            )}
                          </>
                        )}
                      </Stack>
                    ) : (
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                        alignItems="center"
                      >
                        {!isReadOnly && (
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
                        )}
                      </Stack>
                    )}
                  </Grid>
                </Grid>

                {/* Footer: HOD remarks & Insights */}
                {hasPlan &&
                  ((planStatus === 'NeedsChanges' && plan.reviewRemarks) ||
                    plan.insightMessage) && (
                    <Stack
                      spacing={1}
                      direction={{ xs: 'column', sm: 'row' }}
                      sx={{ mt: 1.5, pt: 1.5, borderTop: (t) => `1px dashed ${t.palette.divider}` }}
                    >
                      {planStatus === 'NeedsChanges' && plan.reviewRemarks && (
                        <Alert
                          severity="warning"
                          icon={<Iconify icon="solar:danger-bold" width={18} />}
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
                          icon={<Iconify icon="solar:info-circle-bold" width={18} />}
                          sx={{ flex: 1, py: 0.75, px: 1.5, alignItems: 'center' }}
                        >
                          {plan.insightMessage}
                        </Alert>
                      )}
                    </Stack>
                  )}
              </Paper>
            );
          })}
        </Stack>
      )}

      {/* Overflow menu */}
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
          <Iconify icon="solar:eye-bold" width={18} sx={{ mr: 1, color: 'text.secondary' }} />
          View Details
        </MenuItem>
        {['Draft', 'NeedsChanges', 'Rejected'].includes(menuPlan?.status) && (
          <MenuItem
            onClick={() => {
              if (menuPlan) onEditLesson(menuPlan);
              closeCardMenu();
            }}
          >
            <Iconify icon="solar:pen-bold" width={18} sx={{ mr: 1, color: 'primary.main' }} />
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
      </Menu>
    </Card>
  );
};

export default DailyTimelineTab;
