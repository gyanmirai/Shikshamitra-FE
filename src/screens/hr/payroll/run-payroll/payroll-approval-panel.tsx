import type {
  PayrollBatch,
  PayrollMonth,
  PayrollBatchAction,
  PayrollApprovalSettings,
} from 'src/redux/runPayroll/payroll-approval-api';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { RouterLink } from 'src/routes/components';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { formatPayrollCurrency } from 'src/utils/payroll-currency';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { normalizeHrFailure } from 'src/screens/hr/recovery/hr-failure';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Alert,
  Stack,
  Table,
  Button,
  TableRow,
  MenuItem,
  TextField,
  TableCell,
  TableBody,
  TableHead,
  Typography,
  DialogActions,
  LinearProgress,
  TableContainer,
} from '@mui/material';
import {
  useSubmitPayrollMutation,
  usePayrollSubmissionQuery,
  usePayrollSubmissionsQuery,
  useResolvePayrollSubmissionMutation,
  useSubmitPayrollSectionReviewsMutation,
} from 'src/redux/runPayroll/payroll-approval-api';

import { PayrollReviewSheetButtons } from './payroll-review-sheet-buttons';

const actionLabels: Record<PayrollBatchAction, string> = {
  finalize: 'Finalize batch',
  withdraw: 'Withdraw batch',
  return: 'Return to HR',
  'return-stale': 'Return for fresh review',
  review: 'Mark section reviewed',
};

type Selection = {
  employeeIds: string[];
  previewRunId: string;
  netPay: number;
};

type Feedback = {
  kind: 'error' | 'success' | 'warning';
  text: string;
  workflowIssue?: boolean;
};

function approvalError(error: unknown): Feedback {
  const code = parseApiProblemDetail(error).errorCode;
  return {
    kind: 'error',
    text:
      code === 'PAYROLL_SECTION_ROUTE_MISSING'
        ? 'Some selected staff have no configured school section. Check their assignments or ask a workflow manager to add the section.'
        : code === 'PAYROLL_SECTION_ROUTE_AMBIGUOUS'
          ? 'Some selected staff match several configured school sections. Resolve their assignments before sending them for review.'
          : normalizeHrFailure(error).message,
    workflowIssue: [
      'PAYROLL_APPROVER_UNAVAILABLE',
      'PAYROLL_WORKFLOW_NOT_ACTIVE',
      'PAYROLL_SECTION_ROUTE_MISSING',
      'PAYROLL_SECTION_ROUTE_AMBIGUOUS',
    ].includes(code ?? ''),
  };
}

export function PayrollApprovalPanel({
  period, settings, canSubmit, canSelfFinalize, canExport, selection, onSubmitted, approvalSettingsHref,
}: {
  period: PayrollMonth;
  settings: PayrollApprovalSettings;
  canSubmit: boolean;
  canSelfFinalize: boolean;
  canExport: boolean;
  approvalSettingsHref?: string;
  selection: Selection | null;
  onSubmitted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [confirmation, setConfirmation] = useState<{
    key: string;
    action: PayrollBatchAction;
    batch: PayrollBatch;
  } | null>(null);
  const [send, setSend] = useState<{
    key: string;
    selfFinalize: boolean;
    settingsVersion: number;
    selection: Selection;
  } | null>(null);
  const [previousSubmissionId, setPreviousSubmissionId] = useState('');
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState<Feedback>();
  const batches = usePayrollSubmissionsQuery(period, { refetchOnFocus: true, refetchOnMountOrArgChange: true });
  const detail = usePayrollSubmissionQuery(selectedId, {
    skip: !selectedId || !open, refetchOnFocus: true, refetchOnMountOrArgChange: true,
  });
  const [submit, submitState] = useSubmitPayrollMutation();
  const [submitSections, sectionSubmitState] = useSubmitPayrollSectionReviewsMutation();
  const sectionMode = settings.mode === 'SectionReview';
  const submitting = submitState.isLoading || sectionSubmitState.isLoading;
  const manualMode = settings.mode === 'Legacy';
  const batchLabel = sectionMode
    ? 'Section review batches'
    : manualMode
      ? 'Payroll batches'
      : 'Approval batches';
  const [resolve, resolveState] = useResolvePayrollSubmissionMutation();
  const visibleBatches = batches.isError ? [] : (batches.currentData ?? []);
  const pending = visibleBatches.filter((batch) => batch.state === 'Pending');
  const current = detail.isError || batches.isError ? undefined : detail.currentData;
  const selectionChanged = Boolean(
    send &&
    (!selection ||
      send.selection.previewRunId !== selection.previewRunId ||
      send.selection.employeeIds.join(',') !== selection.employeeIds.join(','))
  );
  const settingsChanged = Boolean(send && send.settingsVersion !== settings.version);
  const canConfirmSend = canSubmit && (!send?.selfFinalize || canSelfFinalize) &&
    !selectionChanged && !settingsChanged;
  const beginSend = (selfFinalize: boolean) => {
    if (!selection) return;
    setPreviousSubmissionId('');
    setFeedback(undefined);
    setSend({ key: crypto.randomUUID(), selection, selfFinalize, settingsVersion: settings.version });
  };
  const sendSelected = async () => {
    if (!send || submitting || !canConfirmSend) return;
    setFeedback(undefined);
    try {
      const request = {
        ...period,
        previewRunId: send.selection.previewRunId,
        employeeIds: send.selection.employeeIds,
        expectedSettingsVersion: send.settingsVersion,
        commandKey: send.key,
      };
      const results = sectionMode
        ? await submitSections(request).unwrap()
        : [
            await submit({
              ...request,
              selfFinalize: send.selfFinalize,
              previousSubmissionId: previousSubmissionId || undefined,
            }).unwrap(),
          ];
      setSend(null);
      onSubmitted();
      setSelectedId(results[0]?.id ?? '');
      setOpen(true);
      setFeedback({
        kind: 'success',
        text: sectionMode
          ? `Sent ${results.length} ${results.length === 1 ? 'batch' : 'batches'} for section review.`
          : send.selfFinalize ? 'Batch is ready for your final confirmation.' : 'Batch sent for approval.',
      });
    } catch (caught) {
      setFeedback(approvalError(caught));
    }
  };
  const resolveBatch = async () => {
    if (!confirmation || resolveState.isLoading) return;
    setFeedback(undefined);
    try {
      const result = await resolve({
        id: confirmation.batch.id, action: confirmation.action,
        expectedVersion: confirmation.batch.version, commandKey: confirmation.key,
        reason: reason.trim() || undefined,
      }).unwrap();
      setConfirmation(null);
      setFeedback(result.reasonCode === 'EvidenceChanged'
        ? { kind: 'warning', text: 'Payroll figures changed. The entire batch was returned to HR for fresh review.' }
        : { kind: 'success', text: result.state === 'Finalized' ? `${result.staffCount} staff finalized.` : `Batch ${result.state.toLowerCase()}.` });
    } catch (caught) {
      setFeedback(approvalError(caught));
    }
  };
  const reasonsRequired = confirmation?.action === 'withdraw' || confirmation?.action === 'return';
  const actionsAllowed = current && !detail.isFetching;
  const paused = settings.mode === 'Paused';
  const needsApprover = settings.mode === 'Active' && !settings.approverId;
  const workflowLink = approvalSettingsHref ? (
    <Button component={RouterLink} size="small" color="inherit" href={approvalSettingsHref}>
      Open approval settings
    </Button>
  ) : undefined;
  const contactAdmin = approvalSettingsHref ? '' : ' Contact your payroll administrator.';
  const feedbackAlert = feedback && (
    <Alert severity={feedback.kind} action={feedback.workflowIssue ? workflowLink : undefined}>
      {feedback.text}{feedback.workflowIssue ? contactAdmin : ''}
    </Alert>
  );

  if (manualMode && !visibleBatches.length) return null;

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" alignItems="center">
        <Button
          size="small"
          variant={!canSubmit && pending.length ? 'contained' : 'text'}
          onClick={() => {
            setFeedback(undefined);
            setSelectedId((id) =>
              visibleBatches.some((batch) => batch.id === id)
                ? id
                : pending[0]?.id || visibleBatches[0]?.id || ''
            );
            setOpen(true);
          }}
        >
          {batchLabel}
          {pending.length ? ` (${pending.length} pending)` : ''}
        </Button>
        {(sectionMode || settings.mode === 'Active') &&
          !needsApprover &&
          canSubmit &&
          selection && (
            <Button variant="contained" size="small" onClick={() => beginSend(false)}>
              {sectionMode ? 'Send for section review' : 'Send for approval'}
            </Button>
          )}
        {settings.mode === 'Active' && canSelfFinalize && settings.allowSelfFinalization && selection && (
          <Button variant="outlined" size="small" onClick={() => beginSend(true)}>
            Prepare to finalize myself
          </Button>
        )}
        {!manualMode && canExport && selection && (
          <PayrollReviewSheetButtons selection={{ ...period, previewRunId: selection.previewRunId, employeeIds: selection.employeeIds }} />
        )}
      </Stack>
      {(paused || needsApprover) && (
        <Alert severity="warning" action={workflowLink}>
          {paused
            ? 'Payroll approval is paused. New submissions and finalization are unavailable. Pending batches can still be returned or withdrawn.'
            : 'Payroll has no designated approver. Assign an approver before sending reviewed staff.'}
          {contactAdmin}
        </Alert>
      )}
      {batches.isError && (
        <Alert severity="error">
          Payroll batches could not be loaded.{' '}
          <Button onClick={() => batches.refetch()}>Retry</Button>
        </Alert>
      )}

      <CustomDialog
        open={open && !confirmation}
        handleClose={() => {
          setOpen(false);
          setFeedback(undefined);
        }}
        maxWidth="md"
        title={
          sectionMode
            ? 'Section Review Batches'
            : manualMode
              ? 'Payroll Batches'
              : 'Payroll Approval Batches'
        }
        hasForm={false}
        guardUnsavedChanges={false}
      >
        <DialogScrollContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {(batches.isFetching || detail.isFetching) && (
              <LinearProgress aria-label="Loading payroll batches" />
            )}
            {!confirmation && feedbackAlert}
            {batches.isError && (
              <Alert severity="error">Approval batches could not be loaded.</Alert>
            )}
            {visibleBatches.length ? (
              <TextField
                select
                label="Batch"
                value={visibleBatches.some((batch) => batch.id === selectedId) ? selectedId : ''}
                onChange={(event) => setSelectedId(event.target.value)}
              >
                {visibleBatches.map((batch) => (
                  <MenuItem key={batch.id} value={batch.id}>
                    {batch.stageName && `${batch.stageName} · `}
                    {batch.state === 'Pending'
                      ? batch.stageId
                        ? 'Awaiting section review'
                        : 'Pending finalization'
                      : batch.state}
                    {' · '}
                    {batch.staffCount} staff{' · '}
                    {formatPayrollCurrency(batch.netPay)}
                    {!batch.stageId && ` · ${batch.id.slice(0, 8)}`}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              !batches.isFetching &&
              !batches.isError && <Typography>No payroll batches for this month.</Typography>
            )}
            {detail.isError && (
              <Alert severity="error">
                Batch details could not be loaded.{' '}
                <Button onClick={() => detail.refetch()}>Retry</Button>
              </Alert>
            )}
            {current && (
              <>
                {current.submission.isStale && (
                  <Alert severity="warning">Payroll evidence changed. Return the whole batch for fresh review.</Alert>
                )}
                {current.submission.stageName && (
                  <Typography variant="subtitle2">
                    {current.submission.stageName}
                    {current.submission.reviewerRoleName &&
                      ` · ${current.submission.reviewerRoleName}`}
                  </Typography>
                )}
                <Typography variant="subtitle2">
                  {current.submission.staffCount} staff ·{' '}
                  {formatPayrollCurrency(current.submission.netPay)} net pay
                </Typography>
                {current.submission.resolvedByName && (
                  <Typography variant="body2" color="text.secondary">
                    Decision recorded by {current.submission.resolvedByName}
                    {current.submission.resolvedAt &&
                      ` · ${fDateTime(current.submission.resolvedAt)}`}
                  </Typography>
                )}
                {current.submission.resolutionReason && (
                  <Alert severity={current.submission.state === 'Returned' ? 'warning' : 'info'}>
                    {current.submission.resolutionReason}
                  </Alert>
                )}
                <TableContainer>
                  <Table size="small" aria-label="Staff in payroll approval batch">
                    <TableHead><TableRow>
                      <TableCell>Staff</TableCell><TableCell align="right">Payable days</TableCell>
                      <TableCell align="right">Earnings</TableCell><TableCell align="right">Deductions</TableCell>
                      <TableCell align="right">Net pay</TableCell>
                    </TableRow></TableHead>
                    <TableBody>
                      {current.items.map((row) => (
                        <TableRow key={row.employeeId}>
                          <TableCell>{row.employeeName} ({row.employeeIdentifier})</TableCell>
                          <TableCell align="right">{row.payableDays}</TableCell>
                          <TableCell align="right">{formatPayrollCurrency(row.totalEarnings)}</TableCell>
                          <TableCell align="right">{formatPayrollCurrency(row.totalDeduction)}</TableCell>
                          <TableCell align="right">{formatPayrollCurrency(row.netPay)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {canExport && current.submission.state === 'Pending' && !current.submission.isStale && (
                  <PayrollReviewSheetButtons key={selectedId} disabled={!actionsAllowed} selection={{ submissionId: selectedId, version: current.submission.version }} />
                )}
              </>
            )}
          </Stack>
        </DialogScrollContent>
        <DialogActions sx={{ flexWrap: 'wrap' }}>
          <Button
            startIcon={<Iconify icon="mdi:close" />}
            onClick={() => {
              setOpen(false);
              setFeedback(undefined);
            }}
          >
            Close
          </Button>
          {actionsAllowed &&
            current.submission.allowedActions.map((action) => (
              <Button
                key={action}
                variant={action === 'finalize' || action === 'review' ? 'contained' : 'text'}
                onClick={() => {
                  setReason('');
                  setFeedback(undefined);
                  setConfirmation({ key: crypto.randomUUID(), action, batch: current.submission });
                }}
              >
                {action === 'finalize' && current.submission.isStale ? 'Return changed batch' : actionLabels[action]}
              </Button>
            ))}
        </DialogActions>
      </CustomDialog>

      {send && (
        <CustomDialog
          open
          handleClose={() => setSend(null)}
          disableClose={submitting}
          hasForm={false}
          guardUnsavedChanges={false}
          maxWidth="sm"
          title={
            sectionMode
              ? 'Send Payroll for Section Review'
              : send.selfFinalize
                ? 'Prepare Self-Finalization'
                : 'Send Payroll for Approval'
          }
        >
          <DialogScrollContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography>
                {send.selection.employeeIds.length} reviewed staff ·{' '}
                {formatPayrollCurrency(send.selection.netPay)} net pay
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {sectionMode
                  ? 'Staff are grouped by school section and sent to eligible reviewers. HR locks payroll after review.'
                  : send.selfFinalize ? 'You will confirm the batch in Approval batches.' : 'The school’s designated principal or admin will receive this batch.'}
              </Typography>
              {!sectionMode &&
                Boolean(batches.currentData?.some((batch) => batch.allowedActions.length === 0 && ['Returned', 'Withdrawn'].includes(batch.state))) && (
                  <TextField select label="Resubmitting a previous batch?" value={previousSubmissionId} onChange={(event) => setPreviousSubmissionId(event.target.value)}>
                    <MenuItem value="">New batch</MenuItem>
                    {batches.currentData?.filter((batch) => ['Returned', 'Withdrawn'].includes(batch.state)).map((batch) => (
                      <MenuItem key={batch.id} value={batch.id}>{batch.state} · {batch.staffCount} staff · {batch.id.slice(0, 8)}</MenuItem>
                    ))}
                  </TextField>
                )}
              {(selectionChanged || settingsChanged) && (
                <Alert severity="warning">
                  {settingsChanged
                    ? 'Approval settings changed. Close this confirmation and start the handoff again.'
                    : 'The payroll selection changed. Close this confirmation and review the selected staff.'}
                </Alert>
              )}
              {feedbackAlert}
            </Stack>
          </DialogScrollContent>
          <DialogActions>
            <Button
              startIcon={<Iconify icon="mdi:close" />}
              onClick={() => setSend(null)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<Iconify icon="mdi:send-outline" />}
              onClick={sendSelected}
              loading={submitting}
              disabled={!canConfirmSend}
            >
              {send.selfFinalize ? 'Create batch for myself' : 'Confirm and send'}
            </Button>
          </DialogActions>
        </CustomDialog>
      )}

      {confirmation && (
        <ConfirmDialog
          open
          onClose={() => setConfirmation(null)}
          disableCancel={resolveState.isLoading}
          icon="warning"
          title={
            confirmation.action === 'finalize' && confirmation.batch.isStale
              ? 'Return Changed Batch'
              : actionLabels[confirmation.action]
          }
          content={
            <Stack spacing={2}>
              <Typography>
                {confirmation.batch.staffCount} staff ·{' '}
                {formatPayrollCurrency(confirmation.batch.netPay)} net pay
              </Typography>
              {confirmation.action === 'finalize' && !confirmation.batch.isStale && (
                <Typography>Finalization issues payslips for everyone in this batch together.</Typography>
              )}
              {confirmation.action === 'review' && (
                <Typography>
                  Mark this section’s payroll figures and payable days reviewed. HR will lock
                  payroll.
                </Typography>
              )}
              {reasonsRequired && (
                <TextField
                  required
                  label="Reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  slotProps={{ htmlInput: { maxLength: 500 } }}
                  fullWidth
                  multiline
                />
              )}
              {feedbackAlert}
            </Stack>
          }
          action={
            <Button
              variant="contained"
              onClick={resolveBatch}
              loading={resolveState.isLoading}
              disabled={reasonsRequired && !reason.trim()}
              startIcon={<Iconify icon="mdi:check" />}
            >
              {confirmation.action === 'finalize'
                ? confirmation.batch.isStale
                  ? 'Return changed batch'
                  : 'Confirm finalization'
                : actionLabels[confirmation.action]}
            </Button>
          }
        />
      )}
    </Stack>
  );
}
