import type {
  AssessmentAttempt,
  ApplicationAssessment,
  ManagedApplicationAssessment,
} from 'src/redux/student/admissions/admission-assessment-types';

import { useRef, useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { Box, Stack, Button, Divider, MenuItem, Typography } from '@mui/material';

import { AssessmentResultEntry } from './assessment-result-entry';
import { formatAssessmentSchedule } from './assessment-date-time';
import { ADMISSION_DATE_TIME_FORMAT } from '../admission-date-formats';
import { useAssessmentPermissions } from './use-assessment-permissions';
import { AssessmentSubjectScoreHistory } from './assessment-subject-score-history';
import { canWaiveAssessment, assessmentActionLabels } from './assessment-action-model';

import type { AssessmentAction } from './assessment-action-model';
import type { useAssessmentQuickActions } from './use-assessment-quick-actions';

const outcomeLabels = {
  pending: 'Result Pending',
  passed: 'Passed',
  failed: 'Failed',
  absent: 'Absent',
  retake: 'Retake Allowed',
  waived: 'Waived',
};
const attendanceLabels = { pending: 'Pending', present: 'Present', absent: 'Absent' };

type Props = { attempt: AssessmentAttempt } & (
  | {
      assessment: ManagedApplicationAssessment;
      quick: ReturnType<typeof useAssessmentQuickActions>;
      disabled: boolean;
      readOnly: boolean;
      onAction: (action: AssessmentAction) => void;
    }
  | {
      assessment: ApplicationAssessment;
      readOnly: true;
      disabled?: boolean;
      quick?: never;
      onAction?: never;
    }
);

export function AssessmentAttemptCard({
  assessment,
  attempt,
  quick,
  disabled = false,
  readOnly,
  onAction,
}: Props) {
  const permissions = useAssessmentPermissions();
  const menuAnchor = useRef<HTMLButtonElement>(null);
  const [opensAbove, setOpensAbove] = useState(false);
  const latest = attempt.id === quick?.attempt?.id;
  const editable = !readOnly && latest && Boolean(quick);
  const canAttend = editable && quick?.canRecordAttendance;
  const pendingResult = editable && attempt.status === 'pending';
  const lastNumber = Math.max(...assessment.attempts.map((item) => item.attemptNumber));
  const actions: AssessmentAction[] = [];
  if (editable) {
    if (assessment.canRecordAttendance && permissions.attendance) actions.push('attendance');
    if (assessment.canRecordResult && permissions.results) actions.push('result');
    if (assessment.canRetake && permissions.book) actions.push('retake');
    if (assessment.canCancel && permissions.book) actions.push('cancel');
  }
  if (!readOnly && attempt.attemptNumber === lastNumber && permissions.waive && canWaiveAssessment(assessment))
    actions.push('waive');
  const status =
    attempt.status === 'cancelled'
      ? 'Cancelled'
      : attempt.status === 'pendingReview'
        ? 'Awaiting Review'
        : outcomeLabels[attempt.outcome];
  const schedule = formatAssessmentSchedule(
    attempt.slotStartsAt ?? attempt.sessionStartsAt,
    attempt.slotEndsAt ?? attempt.sessionEndsAt
  );
  const resultFormId = `assessment-result-${assessment.applicationId}-${assessment.stageInstanceId}`;
  return (
    <Box
      component="article"
      aria-label={`Assessment Attempt ${attempt.attemptNumber}`}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1.5,
        p: { xs: 1.5, sm: 2 },
        minWidth: 0,
        overflowWrap: 'anywhere',
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
            <Iconify icon="mdi:calendar-outline" width={22} color="text.secondary" />
            <Typography variant="subtitle1">Attempt {attempt.attemptNumber}</Typography>
            <Label
              color={
                attempt.status === 'cancelled'
                  ? 'default'
                  : attempt.status === 'pendingReview' || attempt.outcome === 'pending'
                    ? 'warning'
                    : attempt.outcome === 'passed'
                      ? 'success'
                      : attempt.outcome === 'failed' || attempt.outcome === 'absent'
                        ? 'error'
                        : 'default'
              }
            >
              {status}
            </Label>
          </Stack>
          {actions.length > 0 && (
            <ThreeDotsActions
              moreLabel={`More Actions for Attempt ${attempt.attemptNumber}`}
              placement={opensAbove ? 'bottom-right' : 'top-right'}
              onClickThreeDots={(event) => {
                menuAnchor.current = event.currentTarget;
                setOpensAbove(false);
              }}
              popoverSlotProps={{
                paper: { sx: { mt: opensAbove ? -1 : 1 } },
                transition: {
                  onEntering: (paper: HTMLElement) => {
                    const trigger = menuAnchor.current;
                    const viewport = trigger?.ownerDocument.defaultView;
                    if (!trigger || !viewport) return;
                    const anchor = trigger.getBoundingClientRect();
                    const drawer = trigger.closest('[role="dialog"]')?.getBoundingClientRect();
                    const below = Math.min(viewport.innerHeight, drawer?.bottom ?? Infinity) - anchor.bottom;
                    const above = anchor.top - Math.max(0, drawer?.top ?? 0);
                    const gap = Math.abs(Number.parseFloat(viewport.getComputedStyle(paper).marginTop)) || 0;
                    setOpensAbove(below < paper.offsetHeight + gap + 16 && above > below);
                  },
                },
              }}
              actions={({ popover }) =>
                actions.map((action) => (
                  <MenuItem
                    key={action}
                    disabled={disabled || quick?.formik.dirty}
                    onClick={() => {
                      popover.onClose();
                      onAction?.(action);
                    }}
                  >
                    {action === 'attendance'
                      ? 'Record Attendance with Notes'
                      : action === 'result'
                        ? 'Record Result with Notes'
                        : assessmentActionLabels[action]}
                  </MenuItem>
                ))
              }
            />
          )}
        </Stack>
        <Stack
          direction="row"
          spacing={2}
          flexWrap="wrap"
          justifyContent="space-between"
          alignItems="flex-start"
          useFlexGap
        >
        <Stack spacing={1} sx={{ flex: '1 1 220px', minWidth: 0 }}>
          <Typography variant="subtitle1">
            {attempt.sessionName ||
              (attempt.sessionId ? 'Scheduled Session' : 'No Session Required')}
          </Typography>
          <Stack direction="row" gap={2} flexWrap="wrap" useFlexGap>
            {schedule && (
              <>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Iconify icon="mdi:calendar-outline" width={18} color="text.secondary" />
                  <Typography variant="body2">{schedule.date}</Typography>
                </Stack>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Iconify icon="mdi:clock-outline" width={18} color="text.secondary" />
                  <Typography variant="body2">{schedule.time}</Typography>
                </Stack>
              </>
            )}
            {attempt.sessionLocation && (
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                <Iconify icon="mdi:map-marker-outline" width={18} color="text.secondary" />
                <Typography variant="body2">{attempt.sessionLocation}</Typography>
              </Stack>
            )}
          </Stack>
        </Stack>
          <Stack spacing={1} sx={{ minWidth: 0, maxWidth: '100%' }}>
            <Typography variant="subtitle2">Attendance</Typography>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
            >
              {canAttend && attempt.attendance === 'pending' ? (
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap alignItems="center">
                  <Label color="warning">Pending</Label>
                  {(['present', 'absent'] as const).map((value) => (
                    <Button
                      key={value}
                      size="small"
                      variant="outlined"
                      aria-label={`Mark Attempt ${attempt.attemptNumber} ${attendanceLabels[value]}`}
                      disabled={disabled || quick?.formik.dirty}
                      onClick={() => quick?.recordAttendance(value)}
                    >
                      {attendanceLabels[value]}
                    </Button>
                  ))}
                </Stack>
              ) : (
                <Label
                  color={
                    attempt.attendance === 'present'
                      ? 'success'
                      : attempt.attendance === 'absent'
                        ? 'error'
                        : 'warning'
                  }
                >
                  {assessment.policy?.attendanceRequired === false &&
                  attempt.attendance === 'pending'
                    ? 'Not Required'
                    : attendanceLabels[attempt.attendance]}
                </Label>
              )}
              {canAttend && attempt.attendance !== 'pending' && (
                <Button
                  size="small"
                  variant="outlined"
                  aria-label={`Change Attendance for Attempt ${attempt.attemptNumber}`}
                  disabled={disabled || quick?.formik.dirty}
                  onClick={() => onAction?.('attendance')}
                >
                  Change
                </Button>
              )}
            </Stack>
          </Stack>
        </Stack>
        <Divider />
          <Stack spacing={1} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2">Result</Typography>
            {pendingResult && quick && assessment.policy ? (
              <AssessmentResultEntry
                assessment={{ ...assessment, policy: assessment.policy }}
                quick={quick}
                disabled={disabled}
                formId={resultFormId}
                inlineSave
              />
            ) : attempt.effectiveProfile ? (
              <AssessmentSubjectScoreHistory attempt={attempt} />
            ) : (
              <Typography variant="body2">
                {(assessment.policy?.scoringEnabled ?? attempt.marks != null) &&
                attempt.marks != null
                  ? assessment.policy?.totalMarks != null
                    ? `${attempt.marks} / ${assessment.policy.totalMarks}`
                    : attempt.marks
                  : outcomeLabels[attempt.outcome]}
              </Typography>
            )}
            {!attempt.effectiveProfile && assessment.policy?.scoringEnabled && (
              <Typography variant="caption" color="text.secondary">
                Pass Mark: {assessment.policy.passingMarks} / {assessment.policy.totalMarks}
              </Typography>
            )}
          </Stack>
        {(attempt.notes || attempt.reviewNotes || attempt.reviewedAt) && (
          <Stack spacing={0.5}>
            {attempt.notes && (
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {attempt.notes}
              </Typography>
            )}
            {attempt.reviewNotes && (
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                Review: {attempt.reviewNotes}
              </Typography>
            )}
            {attempt.reviewedAt && (
              <Typography variant="caption" color="text.secondary">
                Reviewed {fDateTime(attempt.reviewedAt, ADMISSION_DATE_TIME_FORMAT)}
              </Typography>
            )}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
