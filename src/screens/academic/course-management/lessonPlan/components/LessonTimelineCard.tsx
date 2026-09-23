'use client';

import type { Dayjs } from 'dayjs';

import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Grid,
  Chip,
  Stack,
  Alert,
  Paper,
  Button,
  Tooltip,
  Typography,
  IconButton,
  LinearProgress,
} from '@mui/material';

import { getLessonStatusConfig } from './lessonTimelineConfig';

type LessonTimelineCardProps = {
  slot: any;
  selectedDate: Dayjs;
  onAddLesson: (date: Dayjs, prefill?: any) => void;
  onEditLesson: (plan: any) => void;
  onViewDetails: (plan: any) => void;
  onSubmitDiary: (plan: any) => void;
  onSubmitPlan: (planId: string) => void;
  openCardMenu: (event: React.MouseEvent<HTMLElement>, plan: any) => void;
};

export const LessonTimelineCard: React.FC<LessonTimelineCardProps> = ({
  slot,
  selectedDate,
  onAddLesson,
  onEditLesson,
  onViewDetails,
  onSubmitDiary,
  onSubmitPlan,
  openCardMenu,
}) => {
  const theme = useTheme();
  const hasPlan = Boolean(slot.lessonPlan);
  const plan = slot.lessonPlan;

  const statusConfig = getLessonStatusConfig(slot);
  const planStatus = statusConfig.label;

  const normalizedPlan = hasPlan
    ? {
        ...plan,
        status: plan.status || plan.planStatus || planStatus,
        planStatus: plan.planStatus || plan.status || planStatus,
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

  // Palette color accents mapping
  const accentColorMap: Record<string, string> = {
    primary: theme.palette.primary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main,
    grey: theme.palette.divider,
  };

  const cardAccentColor = accentColorMap[statusConfig.accentPaletteKey] || theme.palette.divider;
  const completionPercentage = Number(
    plan?.plannedCompletionPercentage ?? plan?.actualCompletionPercentage ?? 0
  );

  // Show progress ONLY when meaningful (> 0%) or for explicit in-progress lessons with completion
  const shouldShowProgress = hasPlan && completionPercentage > 0;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, sm: 2.25 },
        borderRadius: 2,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        borderLeft: `5px solid ${cardAccentColor}`,
        bgcolor: statusConfig.cardBg(theme),
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
              {/* Period Box styled dynamically by lesson state */}
              <Box
                sx={{
                  px: 1.75,
                  py: 1,
                  borderRadius: 1.5,
                  bgcolor: statusConfig.periodBg(theme),
                  color: statusConfig.periodTextColor,
                  textAlign: 'center',
                  minWidth: 84,
                  border: (t) =>
                    `1px solid ${varAlpha(
                      statusConfig.accentPaletteKey === 'grey'
                        ? t.vars.palette.grey['500Channel']
                        : t.vars.palette[statusConfig.accentPaletteKey].mainChannel,
                      0.25
                    )}`,
                }}
              >
                <Typography variant="subtitle2" fontWeight={800} fontSize={13}>
                  {slot.periodName || 'Period'}
                </Typography>
              </Box>

              <Stack spacing={0.25}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Iconify icon="solar:clock-circle-bold" width={14} color="text.secondary" />
                  <Typography variant="body2" fontWeight={700} color="text.primary">
                    {slot.startTime || '08:00 AM'} – {slot.endTime || '08:40 AM'}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Chip
                    size="small"
                    label={`Grade ${slot.standardName || ''}${slot.divisionName ? `-${slot.divisionName}` : ''}`}
                    variant="outlined"
                    sx={{ height: 20, fontSize: 11, fontWeight: 600 }}
                  />
                </Stack>
              </Stack>
            </Stack>
          )}
        </Grid>

        {/* Slot Details (Plan Info or Empty Prompt) */}
        <Grid size={{ xs: 12, md: 5.5 }}>
          {hasPlan ? (
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                  {slot.subjectName || plan.subjectName || 'Subject'} —{' '}
                  {plan.chapterName || 'Curriculum'}
                </Typography>

                {/* Active Indicator Pulse for In Progress */}
                {statusConfig.activeIndicator && (
                  <Chip
                    size="small"
                    icon={<Iconify icon="solar:play-circle-bold" width={12} />}
                    label="Active Lesson"
                    color="info"
                    variant="filled"
                    sx={{ height: 20, fontSize: 10, fontWeight: 700, px: 0.5 }}
                  />
                )}

                {/* Primary Status Badge */}
                <Label
                  color={statusConfig.badgeColor}
                  variant={statusConfig.badgeVariant}
                  startIcon={<Iconify icon={statusConfig.icon} width={14} />}
                  sx={{ fontWeight: 700 }}
                >
                  {statusConfig.label}
                </Label>

                {/* Secondary HOD Status Badge */}
                {statusConfig.secondaryHodStatus && (
                  <Label
                    color={statusConfig.secondaryHodStatus.color}
                    variant={statusConfig.secondaryHodStatus.variant}
                    startIcon={<Iconify icon={statusConfig.secondaryHodStatus.icon} width={13} />}
                    sx={{ fontWeight: 600 }}
                  >
                    {statusConfig.secondaryHodStatus.label}
                  </Label>
                )}

                {plan.isAiGenerated && (
                  <Label
                    color="secondary"
                    variant="soft"
                    startIcon={<Iconify icon="solar:stars-minimalistic-bold" width={12} />}
                  >
                    AI Generated
                  </Label>
                )}
              </Stack>

              {plan.topic && (
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
                  Topic: <strong>{plan.topic}</strong>
                </Typography>
              )}

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

              {/* Progress Section (Only shown when completion > 0%) */}
              {shouldShowProgress && (
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Completion: {completionPercentage}%
                  </Typography>
                  <Box sx={{ width: 120 }}>
                    <LinearProgress
                      variant="determinate"
                      value={completionPercentage}
                      color={statusConfig.progressColor}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                </Stack>
              )}
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
              {statusConfig.label === 'Draft' || statusConfig.stateKey === 'draft' ? (
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  startIcon={<Iconify icon="solar:plain-bold" width={16} />}
                  onClick={() => onSubmitPlan(plan.id || plan.Id)}
                >
                  Submit
                </Button>
              ) : null}

              {['Approved', 'completed', 'inProgress'].includes(statusConfig.stateKey) ||
              planStatus === 'Approved' ? (
                <Tooltip
                  title={
                    plan?.diaryStatus === 1 || plan?.diaryStatus === 'Submitted'
                      ? 'Diary already submitted'
                      : ''
                  }
                  arrow
                >
                  <Box component="span">
                    <Button
                      variant="contained"
                      size="small"
                      color="success"
                      disabled={plan?.diaryStatus === 1 || plan?.diaryStatus === 'Submitted'}
                      startIcon={<Iconify icon="solar:notebook-bookmark-bold" width={16} />}
                      onClick={() => normalizedPlan && onSubmitDiary(normalizedPlan)}
                    >
                      Record Diary
                    </Button>
                  </Box>
                </Tooltip>
              ) : null}

              {statusConfig.stateKey === 'submitted' || planStatus === 'Submitted' ? (
                <Button
                  variant="outlined"
                  size="small"
                  disabled
                  startIcon={<Iconify icon="solar:clock-circle-bold" width={16} />}
                >
                  Pending HOD
                </Button>
              ) : null}

              {planStatus !== 'Submitted' && statusConfig.stateKey !== 'submitted' && (
                <IconButton
                  size="small"
                  title="More actions"
                  onClick={(e) => normalizedPlan && openCardMenu(e, normalizedPlan)}
                  sx={{
                    border: (t) => `1px solid ${t.palette.divider}`,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Iconify icon="eva:more-vertical-fill" width={18} />
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

      {/* Footer: HOD remarks & Insights */}
      {hasPlan &&
        ((plan.reviewRemarks && ['needsChanges', 'rejected'].includes(statusConfig.stateKey)) ||
          plan.insightMessage) && (
          <Stack
            spacing={1}
            direction={{ xs: 'column', sm: 'row' }}
            sx={{ mt: 1.5, pt: 1.5, borderTop: (t) => `1px dashed ${t.palette.divider}` }}
          >
            {plan.reviewRemarks && ['needsChanges', 'rejected'].includes(statusConfig.stateKey) && (
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
                <strong>{plan.reviewedByName?.trim() || 'Reviewer'} requested:</strong>{' '}
                {plan.reviewRemarks}
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
};

export default LessonTimelineCard;
