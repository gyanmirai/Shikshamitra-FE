import type {
  AssessmentAttempt,
  ApplicationAssessment,
  ManagedApplicationAssessment,
} from 'src/redux/student/admissions/admission-assessment-types';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { Box, Stack, Button, Divider, MenuItem, Typography } from '@mui/material';

import { AssessmentResultEntry } from './assessment-result-entry';
import { formatAssessmentSchedule } from './assessment-date-time';
import { assessmentActionLabels } from './assessment-action-model';
import { useAssessmentPermissions } from './use-assessment-permissions';

import type { AssessmentAction } from './assessment-action-model';
import type { useAssessmentQuickActions } from './use-assessment-quick-actions';

const outcomeLabels = {
  pending: 'Result pending',
  passed: 'Passed',
  failed: 'Failed',
  absent: 'Absent',
  retake: 'Retake allowed',
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
  if (!readOnly && attempt.attemptNumber === lastNumber && assessment.canWaive && permissions.waive)
    actions.push('waive');
  const status =
    attempt.status === 'cancelled'
      ? 'Cancelled'
      : attempt.status === 'pendingReview'
        ? 'Awaiting review'
        : outcomeLabels[attempt.outcome];
  const schedule = formatAssessmentSchedule(
    attempt.slotStartsAt ?? attempt.sessionStartsAt,
    attempt.slotEndsAt ?? attempt.sessionEndsAt
  );
  const resultFormId = `assessment-result-${assessment.applicationId}-${assessment.stageInstanceId}`;
  return (
    <Box
      component="article"
      aria-label={`Assessment attempt ${attempt.attemptNumber}`}
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
              moreLabel={`More actions for attempt ${attempt.attemptNumber}`}
              placement="bottom-right"
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
                      ? 'Record attendance with notes'
                      : action === 'result'
                        ? 'Record result with notes'
                        : assessmentActionLabels[action]}
                  </MenuItem>
                ))
              }
            />
          )}
        </Stack>
        <Divider />
        <Stack spacing={1}>
          <Typography variant="subtitle1">
            {attempt.sessionName ||
              (attempt.sessionId ? 'Scheduled session' : 'No session required')}
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
        <Divider />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(0, 1.3fr)' },
            gap: 2,
          }}
        >
          <Stack spacing={1}>
            <Typography variant="subtitle2">Attendance</Typography>
            <Stack
              direction="row"
              spacing={1}
              justifyContent="space-between"
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
                      aria-label={`Mark attempt ${attempt.attemptNumber} ${value}`}
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
                    ? 'Not required'
                    : attendanceLabels[attempt.attendance]}
                </Label>
              )}
              {canAttend && attempt.attendance !== 'pending' && (
                <Button
                  size="small"
                  variant="outlined"
                  aria-label={`Change attendance for attempt ${attempt.attemptNumber}`}
                  disabled={disabled || quick?.formik.dirty}
                  onClick={() => onAction?.('attendance')}
                >
                  Change
                </Button>
              )}
            </Stack>
          </Stack>
          <Stack
            spacing={1}
            sx={{
              borderStyle: 'solid',
              borderWidth: 0,
              borderLeftWidth: { xs: 0, md: 1 },
              borderTopWidth: { xs: 1, md: 0 },
              borderColor: 'divider',
              pl: { md: 2 },
              pt: { xs: 2, md: 0 },
              minWidth: 0,
            }}
          >
            <Typography variant="subtitle2">Result</Typography>
            {pendingResult && quick && assessment.policy ? (
              <AssessmentResultEntry
                assessment={{ ...assessment, policy: assessment.policy }}
                quick={quick}
                disabled={disabled}
                formId={resultFormId}
                inlineSave
              />
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
            {assessment.policy?.scoringEnabled && (
              <Typography variant="caption" color="text.secondary">
                Pass mark: {assessment.policy.passingMarks} / {assessment.policy.totalMarks}
              </Typography>
            )}
          </Stack>
        </Box>
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
                Reviewed {fDateTime(attempt.reviewedAt)}
              </Typography>
            )}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
