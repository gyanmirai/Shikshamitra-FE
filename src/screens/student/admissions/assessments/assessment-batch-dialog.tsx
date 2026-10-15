import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AssessmentRosterItem } from 'src/redux/student/admissions/admission-assessment-roster-api';

import { useRef, useState } from 'react';
import { Label } from 'src/components/label';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { FormBusyRegion } from 'src/components/form-busy-region';
import CustomizableTable from 'src/components/customizabaleTable';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Stack,
  Alert,
  Button,
  TextField,
  Typography,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  admissionAssessmentsApi,
  useRecordAssessmentResultMutation,
  useRecordAssessmentAttendanceMutation,
} from 'src/redux/student/admissions/admission-assessments-api';
import {
  admissionApplicationsApi,
  useLazyGetAdmissionApplicationQuery,
  useAdvanceAdmissionApplicationWorkflowMutation,
} from 'src/redux/student/admissions/admission-applications-api';

import { continueAssessment } from './assessment-continue-command';
import { latestAssessmentAttempt } from './assessment-action-model';
import {
  runAssessmentBatch,
  assessmentBatchWriteIntent,
  validateAssessmentBatchValue,
  assessmentBatchIntentApplied,
} from './assessment-batch-model';

import type { AssessmentContinueRetry } from './assessment-continue-command';
import type {
  AssessmentBatchValue,
  AssessmentBatchAction,
  AssessmentBatchResult,
  AssessmentBatchWriteIntent,
} from './assessment-batch-model';

const titles = {
  attendance: 'Record Attendance',
  result: 'Record Results',
  continue: 'Continue Applicants',
};
export function AssessmentBatchDialog({
  action,
  rows,
  onClose,
  onSaved,
}: {
  action: AssessmentBatchAction;
  rows: AssessmentRosterItem[];
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [values, setValues] = useState<Record<string, AssessmentBatchValue>>(() =>
    Object.fromEntries(
      rows.map((row) => [
        row.stageInstanceId,
        { attendance: '', marks: '', outcome: '', notes: '' },
      ])
    )
  );
  const [results, setResults] = useState<Record<string, AssessmentBatchResult>>({});
  const [error, setError] = useState('');
  const [validationAttempted, setValidationAttempted] = useState(false);
  const discard = useBoolean();
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const keys = useRef<Record<string, string>>({});
  const continueRetries = useRef<Record<string, AssessmentContinueRetry>>({});
  const writeIntents = useRef<Record<string, AssessmentBatchWriteIntent>>({});
  const [getAssessment] = admissionAssessmentsApi.useLazyGetApplicationAssessmentQuery();
  const [recordAttendance] = useRecordAssessmentAttendanceMutation();
  const [recordResult] = useRecordAssessmentResultMutation();
  const [getApplication] = useLazyGetAdmissionApplicationQuery();
  const [getWorkflow] = admissionApplicationsApi.useLazyGetAdmissionApplicationWorkflowQuery();
  const [advance] = useAdvanceAdmissionApplicationWorkflowMutation();
  const unsaved = Object.entries(values).some(
    ([id, value]) =>
      !results[id]?.success &&
      (value.attendance || value.marks !== '' || value.outcome || value.notes)
  );
  const pendingRows = rows.filter(
    (row) =>
      !results[row.stageInstanceId]?.success &&
      (action === 'continue' ||
        values[row.stageInstanceId].attendance ||
        values[row.stageInstanceId].marks !== '' ||
        values[row.stageInstanceId].outcome)
  );
  const submit = async () => {
    if (busyRef.current) return;
    setError('');
    setValidationAttempted(true);
    if (!pendingRows.length) {
      setError(
        'Enter attendance or results for at least one applicant. Unedited rows stay pending.'
      );
      return;
    }
    const invalid = pendingRows.find((row) =>
      validateAssessmentBatchValue(action, row, values[row.stageInstanceId])
    );
    if (invalid) {
      setError(
        `${invalid.applicantName}: ${validateAssessmentBatchValue(action, invalid, values[invalid.stageInstanceId])}`
      );
      return;
    }
    busyRef.current = true;
    setBusy(true);
    try {
      await runAssessmentBatch(
        pendingRows,
        async (row) => {
          if (action === 'continue') {
            keys.current[row.stageInstanceId] ??= crypto.randomUUID();
            continueRetries.current[row.stageInstanceId] ??= {};
            return continueAssessment(
              row,
              {
                application: (id) => getApplication(id, false).unwrap(),
                workflow: (id) => getWorkflow(id, false).unwrap(),
                assessment: (applicationId, stageInstanceId) =>
                  getAssessment({ applicationId, stageInstanceId }, false).unwrap(),
                advance: (input) => advance(input).unwrap(),
              },
              keys.current[row.stageInstanceId],
              continueRetries.current[row.stageInstanceId]
            );
          }
          const assessment = await getAssessment(
            { applicationId: row.applicationId, stageInstanceId: row.stageInstanceId },
            false
          ).unwrap();
          const attempt = latestAssessmentAttempt(assessment);
          if (!attempt || !assessment.policy || assessment.stageInstanceId !== row.stageInstanceId)
            throw new Error('This assessment changed. Refresh before retrying.');
          if (latestAssessmentAttempt(row.assessment)?.id !== attempt.id)
            throw new Error('The attempt changed. Reopen the sheet for the latest attempt.');
          const value = values[row.stageInstanceId];
          const freshError = validateAssessmentBatchValue(action, { ...row, assessment }, value);
          if (freshError) throw new Error(freshError);
          const intent = assessmentBatchWriteIntent(
            action,
            { ...row, assessment },
            attempt.id,
            value
          );
          const sentIntent = writeIntents.current[row.stageInstanceId];
          if (
            sentIntent &&
            JSON.stringify(sentIntent) === JSON.stringify(intent) &&
            assessmentBatchIntentApplied(sentIntent, attempt)
          )
            return { reconciled: true };
          if (
            action === 'attendance' ? !assessment.canRecordAttendance : !assessment.canRecordResult
          )
            throw new Error(assessment.blockers.join(' ') || 'This action is no longer available.');
          const input = {
            attemptId: attempt.id,
            concurrencyStamp: attempt.concurrencyStamp,
            notes: value.notes.trim() || undefined,
          };
          writeIntents.current[row.stageInstanceId] = intent;
          if (action === 'attendance')
            return recordAttendance({
              ...input,
              attendance: value.attendance as 'present' | 'absent',
            }).unwrap();
          return recordResult({
            ...input,
            ...(assessment.policy.scoringEnabled
              ? { marks: Number(value.marks) }
              : { outcome: value.outcome as 'passed' | 'failed' }),
          }).unwrap();
        },
        (result) => setResults((current) => ({ ...current, [result.stageInstanceId]: result }))
      );
      onSaved?.();
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };
  const patch = (id: string, change: Partial<AssessmentBatchValue>) =>
    setValues((current) => ({ ...current, [id]: { ...current[id], ...change } }));
  const columns: IColumn[] = [
    {
      id: 'applicantName',
      label: 'Applicant',
      minWidth: 200,
      isSort: false,
      render: (_, row) => (
        <Stack>
          <Typography variant="subtitle2">{row.applicantName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.applicationNumber} · {row.offeringName}
          </Typography>
        </Stack>
      ),
    },
    { id: 'stageName', label: 'Assessment stage', isSort: false, minWidth: 150 },
  ];
  if (action !== 'continue')
    columns.push({
      id: 'entry',
      label: action === 'attendance' ? 'Attendance' : 'Result',
      isSort: false,
      minWidth: 190,
      render: (_, item) => {
        const row = item as AssessmentRosterItem;
        const value = values[row.stageInstanceId];
        const disabled = busy || results[row.stageInstanceId]?.success;
        const fieldError =
          validationAttempted &&
          pendingRows.some((pendingRow) => pendingRow.stageInstanceId === row.stageInstanceId)
            ? validateAssessmentBatchValue(action, row, value)
            : '';
        if (action === 'result' && row.assessment.policy?.scoringEnabled)
          return (
            <NumericFormatCustom
              fullWidth
              size="small"
              prefix=""
              decimalScale={2}
              name={`marks-${row.stageInstanceId}`}
              label={`Marks / ${row.assessment.policy.totalMarks}`}
              value={value.marks}
              disabled={disabled}
              error={Boolean(fieldError)}
              onValueChange={({ floatValue }) =>
                patch(row.stageInstanceId, { marks: floatValue ?? '' })
              }
              helperText={fieldError || `Passing: ${row.assessment.policy.passingMarks}`}
            />
          );
        return (
          <CustomSelect
            label={action === 'attendance' ? 'Attendance' : 'Result'}
            disabled={disabled}
            error={Boolean(fieldError)}
            helperText={fieldError}
            value={action === 'attendance' ? value.attendance : value.outcome}
            options={
              action === 'attendance'
                ? [
                    { value: 'present', label: 'Present' },
                    { value: 'absent', label: 'Absent' },
                  ]
                : [
                    { value: 'passed', label: 'Passed' },
                    { value: 'failed', label: 'Failed' },
                  ]
            }
            onChange={(choice) =>
              patch(
                row.stageInstanceId,
                action === 'attendance'
                  ? { attendance: String(choice) as AssessmentBatchValue['attendance'] }
                  : { outcome: String(choice) as AssessmentBatchValue['outcome'] }
              )
            }
          />
        );
      },
    });
  if (action !== 'continue')
    columns.push({
      id: 'notes',
      label: 'Notes',
      isSort: false,
      minWidth: 170,
      render: (_, row) => (
        <TextField
          size="small"
          fullWidth
          label="Notes"
          value={values[row.stageInstanceId].notes}
          disabled={busy || results[row.stageInstanceId]?.success}
          inputProps={{ maxLength: 1024 }}
          onChange={(event) => patch(row.stageInstanceId, { notes: event.target.value })}
        />
      ),
    });
  columns.push({
    id: 'saved',
    label: 'Save status',
    isSort: false,
    minWidth: 180,
    render: (_, row) => {
      const result = results[row.stageInstanceId];
      return result ? (
        <Stack>
          <Label color={result.success ? 'success' : 'warning'}>
            {result.success ? 'Saved' : 'Needs retry'}
          </Label>
          {!result.success && <Typography variant="caption">{result.message}</Typography>}
        </Stack>
      ) : (
        'Pending'
      );
    },
  });
  const saved = Object.values(results).filter((result) => result.success).length;
  const requestClose = () => {
    if (busyRef.current) return;
    if (unsaved) discard.onTrue();
    else onClose();
  };
  return (
    <>
      <CustomDialog
        open
        title={titles[action]}
        maxWidth="lg"
        handleClose={onClose}
        hasUnsavedChanges={unsaved && saved < rows.length}
        disableClose={busy}
      >
        <DialogScrollContent>
          <Stack spacing={1.5}>
            <Typography variant="body2">
              {rows.length} selected applicants.{' '}
              {action === 'continue'
                ? 'Each application is checked again and follows its own configured workflow.'
                : action === 'attendance'
                  ? 'Only entered rows are saved. Unedited attendance stays pending.'
                  : 'Only entered rows are saved. Unedited results stay pending.'}
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {busy && <LinearProgress aria-label="Saving assessment batch" />}
            {!!saved && (
              <Alert severity="success">
                {saved} saved. Successful rows will not be submitted again.
              </Alert>
            )}
            <FormBusyRegion
              busy={busy}
              label={action === 'continue' ? 'Continuing applicants…' : 'Saving assessment batch…'}
            >
              <Box sx={{ height: { xs: 420, sm: 460 }, minHeight: 0 }}>
                <CustomizableTable
                  tableId={`assessment-batch-${action}`}
                  tableTitle={titles[action]}
                  columns={columns}
                  data={rows.map((row) => ({ ...row, id: row.stageInstanceId }))}
                  isPagination={false}
                  isSearch={false}
                  isFilter={false}
                  showToolbar={false}
                  wrapperProps={{ sx: { height: 1 } }}
                  tableContainerProps={{ sx: { height: 1 } }}
                />
              </Box>
            </FormBusyRegion>
          </Stack>
        </DialogScrollContent>
        <DialogActions>
          <Button size="small" variant="outlined" disabled={busy} onClick={requestClose}>
            Close
          </Button>
          <SubmitButton
            loading={busy}
            disabled={!pendingRows.length || busy}
            buttonText={
              Object.values(results).some((result) => !result.success)
                ? 'Submit Remaining Rows'
                : 'Submit'
            }
            onClick={submit}
          />
        </DialogActions>
      </CustomDialog>
      <ConfirmDialog
        open={discard.value}
        onClose={discard.onFalse}
        title="Discard Unsaved Entries?"
        content="Saved rows remain saved. Discard the attendance or result entries that have not been saved?"
        action={
          <Button
            size="small"
            variant="contained"
            color="error"
            onClick={() => {
              discard.onFalse();
              onClose();
            }}
          >
            Discard
          </Button>
        }
      />
    </>
  );
}
