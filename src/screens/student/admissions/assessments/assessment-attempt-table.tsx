import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  AssessmentAttempt,
  ApplicationAssessment,
  ManagedApplicationAssessment,
} from 'src/redux/student/admissions/admission-assessment-types';

import { useMemo } from 'react';
import { Label } from 'src/components/label';
import { fDateTime } from 'src/utils/format-time';
import { useResponsive } from 'src/hooks/use-responsive';
import { LoadingButton } from 'src/components/loading-button';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { Stack, Button, MenuItem, Typography } from '@mui/material';

import { assessmentActionLabels } from './assessment-action-model';
import { useAssessmentPermissions } from './use-assessment-permissions';
import { AssessmentResultEntry as ResultEntry } from './assessment-result-entry';
import { AssessmentSubjectScoreHistory } from './assessment-subject-score-history';

import type { AssessmentAction } from './assessment-action-model';
import type { useAssessmentQuickActions } from './use-assessment-quick-actions';

type QuickActions = ReturnType<typeof useAssessmentQuickActions>;
type EditableProps = {
  assessment: ManagedApplicationAssessment;
  quick: QuickActions;
  disabled: boolean;
  readOnly: boolean;
  onAction: (action: AssessmentAction) => void;
};
type Props =
  | EditableProps
  | {
      assessment: ApplicationAssessment;
      readOnly: true;
      disabled?: boolean;
      quick?: never;
      onAction?: never;
    };

const outcomeLabels = {
  pending: 'Pending',
  passed: 'Passed',
  failed: 'Failed',
  absent: 'Absent',
  retake: 'Retake allowed',
  waived: 'Waived',
};
const attendanceLabels = { pending: 'Pending', present: 'Present', absent: 'Absent' };

/** Embedded attempt records within Applicant 360; the surrounding journey owns its footer. */
export function AssessmentAttemptTable({
  assessment,
  quick,
  disabled = false,
  readOnly,
  onAction,
}: Props) {
  const permissions = useAssessmentPermissions();
  const narrow = useResponsive('down', 'sm');
  const resultFormId = `assessment-result-${assessment.applicationId}-${assessment.stageInstanceId}`;
  const scoringEnabled =
    assessment.policy?.scoringEnabled ??
    assessment.attempts.some((attempt) => attempt.marks != null);
  const totalMarks = assessment.policy?.totalMarks;
  const lastNumber = Math.max(...assessment.attempts.map((item) => item.attemptNumber));
  const rows = useMemo(
    () =>
      assessment.attempts
        .map((attempt) => ({
          ...attempt,
          statusLabel:
            attempt.status === 'cancelled'
              ? 'Cancelled'
              : attempt.status === 'pendingReview'
                ? 'Awaiting review'
                : outcomeLabels[attempt.outcome],
        }))
        .sort((a, b) => b.attemptNumber - a.attemptNumber),
    [assessment.attempts]
  );
  const columns: IColumn[] = [
    {
      id: 'attemptNumber',
      isSort: false,
      label: 'Attempt',
      filterType: 'number',
      minWidth: 104,
      isFilter: false,
      render: (_, row) => (
        <Stack spacing={0.25} sx={{ overflowWrap: 'anywhere' }}>
          <Typography variant="subtitle2">Attempt {row.attemptNumber}</Typography>
          {row.notes && (
            <Typography variant="caption" sx={{ whiteSpace: 'pre-wrap' }}>
              {row.notes}
            </Typography>
          )}
          {row.reviewNotes && (
            <Typography variant="caption" sx={{ whiteSpace: 'pre-wrap' }}>
              Review: {row.reviewNotes}
            </Typography>
          )}
          {row.reviewedAt && (
            <Typography variant="caption" color="text.secondary">
              Reviewed {fDateTime(row.reviewedAt)}
            </Typography>
          )}
        </Stack>
      ),
    },
    {
      id: 'sessionName',
      label: 'Session',
      filterType: 'string',
      minWidth: 136,
      isFilter: false,
      isSort: false,
      render: (_, row) => (
        <Stack spacing={0.25} sx={{ overflowWrap: 'anywhere' }}>
          <Typography variant="body2">
            {row.sessionName ||
              (row.sessionId
                ? 'Scheduled session'
                : assessment.policy
                  ? 'No session required'
                  : 'No scheduled session')}
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'attendance',
      label: 'Attendance',
      filterType: 'enum',
      minWidth: readOnly ? 100 : 160,
      isFilter: false,
      isSort: false,
      enumOptions: Object.entries(attendanceLabels).map(([value, label]) => ({ value, label })),
      render: (_, row) =>
        !readOnly && quick && row.id === quick.attempt?.id && quick.canRecordAttendance ? (
          <Stack direction="row" spacing={0.5}>
            {(['present', 'absent'] as const).map((value) => (
              <Button
                key={value}
                size="small"
                variant="outlined"
                aria-label={`Mark attempt ${row.attemptNumber} ${value}`}
                aria-pressed={row.attendance === value}
                disabled={disabled || quick.formik.dirty}
                onClick={() => quick.recordAttendance(value)}
              >
                {attendanceLabels[value]}
              </Button>
            ))}
          </Stack>
        ) : (
          <Label
            color={
              row.attendance === 'present'
                ? 'success'
                : row.attendance === 'absent'
                  ? 'error'
                  : 'warning'
            }
          >
            {attendanceLabels[row.attendance as AssessmentAttempt['attendance']]}
          </Label>
        ),
    },
    {
      id: 'marks',
      align: 'right',
      label: scoringEnabled ? (totalMarks != null ? `Marks / ${totalMarks}` : 'Marks') : 'Result',
      filterType: 'number',
      minWidth: readOnly ? 100 : 142,
      isFilter: false,
      isSort: false,
      render: (_, row) =>
        !readOnly &&
        quick &&
        assessment.policy &&
        row.id === quick.attempt?.id &&
        row.status === 'pending' ? (
          <ResultEntry
            assessment={{ ...assessment, policy: assessment.policy }}
            quick={quick}
            disabled={disabled}
            formId={resultFormId}
          />
        ) : row.effectiveProfile ? (
          <AssessmentSubjectScoreHistory attempt={row as AssessmentAttempt} />
        ) : (
          <Typography variant="body2" textAlign="right">
            {scoringEnabled
              ? row.marks != null
                ? totalMarks != null
                  ? `${row.marks} / ${totalMarks}`
                  : row.marks
                : '—'
              : outcomeLabels[row.outcome as AssessmentAttempt['outcome']]}
          </Typography>
        ),
    },
    {
      id: 'statusLabel',
      label: 'Status',
      filterType: 'enum',
      minWidth: 80,
      width: 110,
      enumOptions: [...Object.values(outcomeLabels), 'Awaiting review', 'Cancelled'].map(
        (label) => ({ value: label, label })
      ),
      isFilter: false,
      isSort: false,
      sticky: true,
      stickyPosition: 'right',
      stickyOnMobile: false,
      render: (_, row) => (
        <Label
          color={
            row.status === 'cancelled'
              ? 'default'
              : row.outcome === 'passed'
                ? 'success'
                : row.outcome === 'failed' || row.outcome === 'absent'
                  ? 'error'
                  : row.outcome === 'pending' || row.status === 'pendingReview'
                    ? 'warning'
                    : 'default'
          }
        >
          {row.statusLabel}
        </Label>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 130,
      width: 130,
      align: 'left',
      headerSx: { minWidth: { xs: 144, sm: 130 } },
      cellSx: { minWidth: { xs: 144, sm: 130 } },
      isFilter: false,
      isSort: false,
      sticky: true,
      stickyPosition: 'right',
      excludeFromExport: true,
      render: (_, row) => {
        const latest = row.id === quick?.attempt?.id;
        const actions: AssessmentAction[] = [];
        if (!readOnly && quick) {
          if (latest && assessment.canRecordAttendance && permissions.attendance)
            actions.push('attendance');
          if (latest && assessment.canRecordResult && permissions.results) actions.push('result');
          if (latest && assessment.canRetake && permissions.book) actions.push('retake');
          if (latest && assessment.canCancel && permissions.book) actions.push('cancel');
          if (row.attemptNumber === lastNumber && assessment.canWaive && permissions.waive)
            actions.push('waive');
        }
        const showSave =
          !readOnly && quick && latest && row.status === 'pending' && assessment.policy;
        return (
          <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-start">
            {showSave && (
              <LoadingButton
                type="submit"
                form={resultFormId}
                size="small"
                variant="contained"
                loading={quick.formik.isSubmitting}
                aria-label={`Save result for attempt ${row.attemptNumber}`}
                disabled={disabled || !quick.canRecordResult}
              >
                {quick.profile ? 'Submit result' : 'Save'}
              </LoadingButton>
            )}
            {actions.length > 0 && (
              <ThreeDotsActions
                moreLabel={`More actions for attempt ${row.attemptNumber}`}
                placement={narrow ? 'bottom-right' : 'top-right'}
                sx={{
                  justifyContent: 'flex-start',
                  '& [data-testid="table-action-more"]': {
                    width: { xs: 44, sm: 30 },
                    height: { xs: 44, sm: 30 },
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
        );
      },
    },
  ];
  return (
    <CustomizableTable
      tableId={`admission-assessment-attempts-${assessment.applicationId}-${assessment.stageInstanceId}`}
      tableTitle="Assessment attempts"
      columns={readOnly ? columns.filter((column) => column.id !== 'actions') : columns}
      data={rows}
      isSearch={false}
      isFilter={false}
      isPagination={false}
      isShowedDense={false}
      wrapperProps={{ sx: { minWidth: 0, minHeight: 0 } }}
      tableContainerProps={{ 'aria-label': 'Assessment attempts', sx: { minWidth: 0 } }}
    />
  );
}
