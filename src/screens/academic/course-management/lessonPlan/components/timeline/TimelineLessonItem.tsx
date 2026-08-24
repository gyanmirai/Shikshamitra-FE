'use client';

import type { Dayjs } from 'dayjs';

import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Stack,
  Alert,
  Paper,
  Button,
  Chip,
  Tooltip,
  Typography,
  LinearProgress,
} from '@mui/material';

import {
  getLessonStatusConfig,
  isSlotCurrentlyActive,
  calculateSlotDuration,
} from '../lessonTimelineConfig';

type Props = {
  slot: any;
  selectedDate: Dayjs;
  onAddLesson: (date: Dayjs, prefill?: any) => void;
  onEditLesson: (plan: any) => void;
  onViewDetails: (plan: any) => void;
  onSubmitDiary: (plan: any) => void;
  onSubmitPlan: (planId: string) => void;
  onCreateHomework?: (plan: any) => void;
  canView?: boolean;
  canManage?: boolean;
};

export const TimelineLessonItem: React.FC<Props> = ({
  slot,
  selectedDate,
  onAddLesson,
  onEditLesson,
  onViewDetails,
  onSubmitDiary,
  onSubmitPlan,
  onCreateHomework,
  canView = true,
  canManage = true,
}) => {
  const theme = useTheme();
  const hasPlan = Boolean(slot.lessonPlan);
  const plan = slot.lessonPlan;

  const isNow = isSlotCurrentlyActive(slot, selectedDate);
  const statusConfig = getLessonStatusConfig(slot, selectedDate);
  const duration = calculateSlotDuration(slot.startTime, slot.endTime);
  const isManualSlot = !slot.timetableSlotId && !slot.startTime;

  const normalizedPlan = hasPlan
    ? {
        ...plan,
        status: plan.status || plan.planStatus || statusConfig.label,
        planStatus: plan.planStatus || plan.status || statusConfig.label,
        className: plan.className || plan.standardName || slot.standardName,
        divisionName: plan.divisionName || slot.divisionName,
        subjectName: plan.subjectName || slot.subjectName,
      }
    : null;

  const completionPercentage = Number(
    plan?.plannedCompletionPercentage ?? plan?.actualCompletionPercentage ?? 0
  );
  const shouldShowProgress = hasPlan && completionPercentage > 0;

  const subjectText = slot.subjectName || plan?.subjectName || 'Subject';
  const chapterText = plan?.chapterName || '';
  const classText = `Grade ${slot.standardName || ''}${
    slot.divisionName ? `-${slot.divisionName}` : ''
  }`;
  const periodText = slot.periodName || (isManualSlot ? 'Manual' : 'Period');
  const timeText = slot.startTime && slot.endTime ? `${slot.startTime} – ${slot.endTime}` : '';

  const isDiaryDone =
    plan?.diaryStatus === 1 ||
    plan?.diaryStatus === 'Submitted' ||
    statusConfig.stateKey === 'completed';

  const actionButtonSx = {
    color: 'text.primary',
    borderColor: 'divider',
    fontWeight: 600,
    fontSize: 12,
    height: 28,
    px: 1.25,
    bgcolor: 'background.paper',
    '&:hover': {
      bgcolor: 'action.hover',
      borderColor: 'text.primary',
    },
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.25, sm: 1.75 },
        mb: 1.25,
        borderRadius: 1.5,
        transition: 'all 0.15s ease',
        position: 'relative',
        bgcolor: !hasPlan
          ? 'background.neutral'
          : isNow
            ? (t) => varAlpha(t.vars.palette.info.mainChannel, 0.04)
            : 'background.paper',
        border: (t) =>
          isNow ? `1px solid ${t.palette.info.main}` : `1px solid ${t.palette.divider}`,
        boxShadow: isNow ? 'var(--shadows-2)' : 'none',
        '&:hover': {
          borderColor: isNow ? 'info.main' : 'primary.main',
          boxShadow: 'var(--shadows-2)',
        },
      }}
    >
      {/* ── Top Row: Subject / Info on Left, Status Badge on Right Corner ── */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ minWidth: 0, mb: 0.25 }}
      >
        {/* Left: NOW indicator + Subject Title */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0, flex: 1, pr: 1 }}>
          {isNow && (
            <Chip
              size="small"
              label="NOW"
              color="info"
              sx={{
                height: 18,
                fontSize: 9.5,
                fontWeight: 900,
                letterSpacing: 0.5,
                px: 0.25,
                flexShrink: 0,
              }}
            />
          )}

          <Tooltip title={subjectText} placement="top" arrow>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="text.primary"
              noWrap
              sx={{
                fontSize: 15,
                lineHeight: 1.2,
                minWidth: 0,
              }}
            >
              {subjectText}
            </Typography>
          </Tooltip>

          {plan?.isAiGenerated && (
            <Label
              color="secondary"
              variant="soft"
              startIcon={<Iconify icon="solar:stars-minimalistic-bold" width={11} />}
              sx={{ fontSize: 10, height: 18, flexShrink: 0 }}
            >
              AI
            </Label>
          )}
        </Stack>

        {/* Right Corner: Status Badge (Displayed only if plan exists / not unplanned) */}
        {hasPlan && statusConfig.stateKey !== 'unplanned' && (
          <Label
            color={statusConfig.badgeColor}
            variant="soft"
            sx={{ fontWeight: 700, fontSize: 11, height: 24, px: 1, flexShrink: 0 }}
          >
            {statusConfig.label}
          </Label>
        )}
      </Stack>

      {/* ── Main Body Row: Metadata & Progress on Left + Actions on Right ── */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={1.5}
        sx={{ minWidth: 0, mt: 0.5 }}
      >
        {/* ── Left Content Details ── */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Chapter / Lesson Name */}
          {hasPlan && chapterText && (
            <Tooltip title={chapterText} placement="top" arrow>
              <Typography
                variant="body2"
                color="text.secondary"
                noWrap
                sx={{
                  fontSize: 13,
                  lineHeight: 1.3,
                  mb: 0.5,
                  minWidth: 0,
                }}
              >
                {chapterText}
              </Typography>
            </Tooltip>
          )}

          {/* Class + Period + Time + Topic Metadata */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
            sx={{ fontSize: 12, color: 'text.secondary', mt: 0.25 }}
          >
            <Typography variant="caption" fontWeight={600} color="text.primary">
              {classText} · {periodText}
            </Typography>

            {timeText && (
              <>
                <Typography variant="caption" color="text.disabled">
                  •
                </Typography>
                <Typography variant="caption" fontWeight={500} color="text.secondary">
                  {timeText} {duration ? `(${duration})` : ''}
                </Typography>
              </>
            )}

            {hasPlan && plan?.topic && (
              <>
                <Typography variant="caption" color="text.disabled">
                  •
                </Typography>
                <Tooltip title={`Topic: ${plan.topic}`} placement="top" arrow>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    sx={{ maxWidth: { xs: 200, sm: 300 } }}
                  >
                    Topic: <strong>{plan.topic}</strong>
                  </Typography>
                </Tooltip>
              </>
            )}

            {!hasPlan && (
              <>
                <Typography variant="caption" color="text.disabled">
                  •
                </Typography>
                <Typography variant="caption" color="text.disabled" fontStyle="italic">
                  {slot.isPlanCreationBlocked
                    ? 'Period unavailable for lesson planning'
                    : 'No lesson plan assigned to this slot'}
                </Typography>
              </>
            )}
          </Stack>

          {/* Completion Progress */}
          {shouldShowProgress && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.75 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                sx={{ fontSize: 11 }}
              >
                Completion {completionPercentage}%
              </Typography>
              <Box sx={{ width: 100 }}>
                <LinearProgress
                  variant="determinate"
                  value={completionPercentage}
                  color={statusConfig.progressColor}
                  sx={{ height: 4, borderRadius: 2 }}
                />
              </Box>
            </Stack>
          )}

          {/* Feedback section inside card */}
          {hasPlan &&
            plan.reviewRemarks &&
            ['needsChanges', 'rejected'].includes(statusConfig.stateKey) && (
              <Alert
                severity={statusConfig.stateKey === 'rejected' ? 'error' : 'warning'}
                icon={<Iconify icon="solar:danger-bold" width={15} />}
                sx={{
                  mt: 1,
                  py: 0.25,
                  px: 1,
                  borderRadius: 1,
                  alignItems: 'center',
                  '& .MuiAlert-message': { fontSize: 11.5, py: 0 },
                }}
              >
                <strong>HOD requested:</strong> {plan.reviewRemarks}
              </Alert>
            )}
        </Box>

        {/* ── Right Action Buttons Area ── */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
          flexWrap="wrap"
          useFlexGap
          sx={{
            flexShrink: 0,
            ...(!canView && { display: 'none' }),
            ...(!canManage && {
              '& button:not([data-view-action="true"])': { display: 'none' },
            }),
          }}
        >
          {hasPlan ? (
            <>
              {/* Completed: NO Edit button! Only View and optional Homework */}
              {statusConfig.stateKey === 'completed' && (
                <>
                  <Button
                    data-view-action="true"
                    variant="outlined"
                    size="small"
                    color="inherit"
                    startIcon={<Iconify icon="solar:eye-bold" width={15} />}
                    onClick={() => onViewDetails(normalizedPlan)}
                    sx={actionButtonSx}
                  >
                    View
                  </Button>
                  {onCreateHomework && (
                    <Button
                      variant="outlined"
                      size="small"
                      color="inherit"
                      startIcon={<Iconify icon="solar:book-bookmark-bold" width={15} />}
                      onClick={() => onCreateHomework(normalizedPlan)}
                      sx={actionButtonSx}
                    >
                      Homework
                    </Button>
                  )}
                </>
              )}

              {statusConfig.stateKey === 'inProgress' && (
                <>
                  {!isDiaryDone && (
                    <Button
                      variant="outlined"
                      size="small"
                      color="inherit"
                      startIcon={<Iconify icon="solar:notebook-bookmark-bold" width={15} />}
                      onClick={() => normalizedPlan && onSubmitDiary(normalizedPlan)}
                      sx={actionButtonSx}
                    >
                      Record Diary
                    </Button>
                  )}
                  <Button
                    data-view-action="true"
                    variant="outlined"
                    size="small"
                    color="inherit"
                    startIcon={<Iconify icon="solar:eye-bold" width={15} />}
                    onClick={() => onViewDetails(normalizedPlan)}
                    sx={actionButtonSx}
                  >
                    View
                  </Button>
                  <Button
                    data-view-action="true"
                    variant="outlined"
                    size="small"
                    color="inherit"
                    startIcon={<Iconify icon="solar:pen-bold" width={15} />}
                    onClick={() => onEditLesson(normalizedPlan)}
                    sx={actionButtonSx}
                  >
                    Edit
                  </Button>
                </>
              )}

              {statusConfig.stateKey === 'approved' && (
                <>
                  {!isDiaryDone && (
                    <Button
                      variant="outlined"
                      size="small"
                      color="inherit"
                      startIcon={<Iconify icon="solar:notebook-bookmark-bold" width={15} />}
                      onClick={() => normalizedPlan && onSubmitDiary(normalizedPlan)}
                      sx={actionButtonSx}
                    >
                      Record Diary
                    </Button>
                  )}
                  <Button
                    data-view-action="true"
                    variant="outlined"
                    size="small"
                    color="inherit"
                    startIcon={<Iconify icon="solar:eye-bold" width={15} />}
                    onClick={() => onViewDetails(normalizedPlan)}
                    sx={actionButtonSx}
                  >
                    View
                  </Button>
                  <Button
                    data-view-action="true"
                    variant="outlined"
                    size="small"
                    color="inherit"
                    startIcon={<Iconify icon="solar:pen-bold" width={15} />}
                    onClick={() => onEditLesson(normalizedPlan)}
                    sx={actionButtonSx}
                  >
                    Edit
                  </Button>
                  {onCreateHomework && (
                    <Button
                      variant="outlined"
                      size="small"
                      color="inherit"
                      startIcon={<Iconify icon="solar:book-bookmark-bold" width={15} />}
                      onClick={() => onCreateHomework(normalizedPlan)}
                      sx={actionButtonSx}
                    >
                      Homework
                    </Button>
                  )}
                </>
              )}

              {statusConfig.stateKey === 'needsChanges' && (
                <>
                  <Button
                    data-view-action="true"
                    variant="outlined"
                    size="small"
                    color="inherit"
                    startIcon={<Iconify icon="solar:eye-bold" width={15} />}
                    onClick={() => onViewDetails(normalizedPlan)}
                    sx={actionButtonSx}
                  >
                    View
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="inherit"
                    startIcon={<Iconify icon="solar:pen-bold" width={15} />}
                    onClick={() => onEditLesson(normalizedPlan)}
                    sx={actionButtonSx}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="inherit"
                    startIcon={<Iconify icon="solar:plain-bold" width={15} />}
                    onClick={() => onSubmitPlan(plan.id || plan.Id)}
                    sx={actionButtonSx}
                  >
                    Submit
                  </Button>
                </>
              )}

              {statusConfig.stateKey === 'rejected' && (
                <>
                  <Button
                    variant="outlined"
                    size="small"
                    color="inherit"
                    startIcon={<Iconify icon="solar:eye-bold" width={15} />}
                    onClick={() => onViewDetails(normalizedPlan)}
                    sx={actionButtonSx}
                  >
                    View
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="inherit"
                    startIcon={<Iconify icon="solar:refresh-bold" width={15} />}
                    onClick={() => onEditLesson(normalizedPlan)}
                    sx={actionButtonSx}
                  >
                    Edit
                  </Button>
                </>
              )}

              {statusConfig.stateKey === 'submitted' && (
                <Button
                  data-view-action="true"
                  variant="outlined"
                  size="small"
                  color="inherit"
                  startIcon={<Iconify icon="solar:eye-bold" width={15} />}
                  onClick={() => onViewDetails(normalizedPlan)}
                  sx={actionButtonSx}
                >
                  View
                </Button>
              )}

              {statusConfig.stateKey === 'draft' && (
                <>
                  <Button
                    data-view-action="true"
                    variant="outlined"
                    size="small"
                    color="inherit"
                    startIcon={<Iconify icon="solar:pen-bold" width={15} />}
                    onClick={() => onEditLesson(normalizedPlan)}
                    sx={actionButtonSx}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="inherit"
                    startIcon={<Iconify icon="solar:plain-bold" width={15} />}
                    onClick={() => onSubmitPlan(plan.id || plan.Id)}
                    sx={actionButtonSx}
                  >
                    Submit
                  </Button>
                </>
              )}

              {statusConfig.stateKey === 'scheduled' && (
                <>
                  <Button
                    variant="outlined"
                    size="small"
                    color="inherit"
                    startIcon={<Iconify icon="solar:eye-bold" width={15} />}
                    onClick={() => onViewDetails(normalizedPlan)}
                    sx={actionButtonSx}
                  >
                    View
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="inherit"
                    startIcon={<Iconify icon="solar:pen-bold" width={15} />}
                    onClick={() => onEditLesson(normalizedPlan)}
                    sx={actionButtonSx}
                  >
                    Edit
                  </Button>
                </>
              )}
            </>
          ) : (
            /* Unplanned Slot State (NO "No Plan" badge, just clean Create Plan button) */
            canManage && (
              <Button
                size="small"
                startIcon={<Iconify icon="mdi:plus" width={15} />}
                disabled={slot.isPlanCreationBlocked}
                variant="contained"
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
            )
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default TimelineLessonItem;
