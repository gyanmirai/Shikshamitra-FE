import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  AssessmentAttempt,
  ApplicationAssessment,
  ManagedApplicationAssessment,
} from 'src/redux/student/admissions/admission-assessment-types';

import { useMemo } from 'react';
import { Label } from 'src/components/label';
import { fDateTime } from 'src/utils/format-time';
import CustomSelect from 'src/components/custom-select';
import { LoadingButton } from 'src/components/loading-button';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { Box, Stack, Button, MenuItem, Typography } from '@mui/material';

import { assessmentActionLabels } from './assessment-action-model';
import { normalizeAssessmentDateTime } from './assessment-date-time';
import { useAssessmentPermissions } from './use-assessment-permissions';

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

function ResultEntry({
  assessment,
  quick,
  disabled,
}: Pick<EditableProps, 'assessment' | 'quick' | 'disabled'>) {
  const { formik } = quick;
  return (
    <Box component="form" noValidate onSubmit={formik.handleSubmit} sx={{ minWidth: 220 }}>
      <Stack direction="row" spacing={1} alignItems="flex-start">
        {assessment.policy.scoringEnabled ? (
          <NumericFormatCustom
            fullWidth
            size="small"
            prefix=""
            roundToWholeRupees={false}
            decimalScale={2}
            name="marks"
            label={`Marks / ${assessment.policy.totalMarks}`}
            value={formik.values.marks}
            disabled={disabled || !quick.canRecordResult}
            onBlur={formik.handleBlur}
            onValueChange={({ floatValue }) => quick.changeResult('marks', floatValue ?? '')}
            error={Boolean(formik.touched.marks && formik.errors.marks)}
            helperText={formik.touched.marks ? formik.errors.marks : undefined}
          />
        ) : (
          <CustomSelect
            label="Result"
            value={formik.values.outcome}
            disabled={disabled || !quick.canRecordResult}
            options={[
              { value: 'passed', label: 'Passed' },
              { value: 'failed', label: 'Failed' },
            ]}
            onChange={(value) => quick.changeResult('outcome', String(value))}
            error={Boolean(formik.touched.outcome && formik.errors.outcome)}
            helperText={formik.touched.outcome ? formik.errors.outcome : undefined}
          />
        )}
        <LoadingButton
          type="submit"
          size="small"
          variant="contained"
          loading={formik.isSubmitting}
          aria-label={`Save result for attempt ${quick.attempt?.attemptNumber}`}
          disabled={disabled || !quick.canRecordResult}
        >
          Save
        </LoadingButton>
      </Stack>
    </Box>
  );
}

/** Embedded attempt records within Applicant 360; the surrounding journey owns its footer. */
export function AssessmentAttemptTable({
  assessment,
  quick,
  disabled = false,
  readOnly,
  onAction,
}: Props) {
  const permissions = useAssessmentPermissions();
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
      minWidth: 150,
      isFilter: false,
      render: (_, row) => (
        <Stack spacing={0.25} sx={{ overflowWrap: 'anywhere' }}>
          <Typography variant="subtitle2">Attempt {row.attemptNumber}</Typography>
          <Typography variant="caption" color="text.secondary">
            {fDateTime(row.createdAt)}
          </Typography>
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
      minWidth: 170,
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
          {row.sessionStartsAt && (
            <Typography variant="caption" color="text.secondary">
              {fDateTime(normalizeAssessmentDateTime(row.sessionStartsAt))}
              {row.sessionEndsAt
                ? ` – ${fDateTime(normalizeAssessmentDateTime(row.sessionEndsAt))}`
                : ''}
            </Typography>
          )}
          {row.sessionLocation && (
            <Typography variant="caption" color="text.secondary">
              {row.sessionLocation}
            </Typography>
          )}
        </Stack>
      ),
    },
    {
      id: 'attendance',
      label: 'Attendance',
      filterType: 'enum',
      minWidth: readOnly ? 110 : 165,
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
      minWidth: readOnly ? 110 : 240,
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
          />
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
      minWidth: 110,
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
      minWidth: 64,
      width: 64,
      align: 'right',
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
        return actions.length ? (
          <ThreeDotsActions
            moreLabel={`More actions for attempt ${row.attemptNumber}`}
            sx={{ justifyContent: 'flex-end' }}
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
        ) : null;
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
