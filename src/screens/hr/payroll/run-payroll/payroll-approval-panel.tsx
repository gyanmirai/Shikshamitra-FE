import type {
  PayrollBatch,
  PayrollMonth,
  PayrollBatchAction,
  PayrollApprovalSettings,
} from 'src/redux/runPayroll/payroll-approval-api';

import { useState } from 'react';
import { formatPayrollCurrency } from 'src/utils/payroll-currency';
import { normalizeHrFailure } from 'src/screens/hr/recovery/hr-failure';
import {
  useSubmitPayrollMutation,
  usePayrollSubmissionQuery,
  usePayrollSubmissionsQuery,
  useResolvePayrollSubmissionMutation,
} from 'src/redux/runPayroll/payroll-approval-api';
import {
  Alert, Stack, Table, Button, Dialog, TableRow, MenuItem,
  TextField, TableCell, TableBody,
  TableHead, Typography, DialogTitle, DialogActions, DialogContent, LinearProgress,
  TableContainer,
} from '@mui/material';

import { PayrollReviewSheetButtons } from './payroll-review-sheet-buttons';

const actionLabels: Record<PayrollBatchAction, string> = {
  finalize: 'Finalize batch',
  withdraw: 'Withdraw batch',
  return: 'Return to HR',
  'return-stale': 'Return for fresh review',
};

type Selection = {
  employeeIds: string[];
  previewRunId: string;
  netPay: number;
};

export function PayrollApprovalPanel({
  period, settings, canSubmit, canSelfFinalize, canExport, selection, onSubmitted,
}: {
  period: PayrollMonth;
  settings: PayrollApprovalSettings;
  canSubmit: boolean;
  canSelfFinalize: boolean;
  canExport: boolean;
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
  const [send, setSend] = useState<{ key: string; selfFinalize: boolean; selection: Selection } | null>(null);
  const [previousSubmissionId, setPreviousSubmissionId] = useState('');
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState<{ kind: 'error' | 'success' | 'warning'; text: string }>();
  const batches = usePayrollSubmissionsQuery(period, { refetchOnFocus: true, refetchOnMountOrArgChange: true });
  const detail = usePayrollSubmissionQuery(selectedId, {
    skip: !selectedId || !open, refetchOnFocus: true, refetchOnMountOrArgChange: true,
  });
  const [submit, submitState] = useSubmitPayrollMutation();
  const [resolve, resolveState] = useResolvePayrollSubmissionMutation();
  const pending = (batches.currentData ?? []).filter((batch) => batch.state === 'Pending');
  const current = detail.isError ? undefined : detail.currentData;
  const beginSend = (selfFinalize: boolean) => {
    if (!selection) return;
    setPreviousSubmissionId('');
    setFeedback(undefined);
    setSend({ key: crypto.randomUUID(), selection, selfFinalize });
  };
  const sendSelected = async () => {
    if (!send) return;
    setFeedback(undefined);
    try {
      const result = await submit({
        ...period,
        previewRunId: send.selection.previewRunId,
        employeeIds: send.selection.employeeIds,
        expectedSettingsVersion: settings.version,
        selfFinalize: send.selfFinalize,
        commandKey: send.key,
        previousSubmissionId: previousSubmissionId || undefined,
      }).unwrap();
      setSend(null);
      onSubmitted();
      setSelectedId(result.id);
      setOpen(true);
      setFeedback({ kind: 'success', text: send.selfFinalize ? 'Batch is ready for your final confirmation.' : 'Batch sent for approval.' });
    } catch (caught) {
      setFeedback({ kind: 'error', text: normalizeHrFailure(caught).message });
    }
  };
  const resolveBatch = async () => {
    if (!confirmation) return;
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
      setFeedback({ kind: 'error', text: normalizeHrFailure(caught).message });
    }
  };
  const reasonsRequired = confirmation?.action === 'withdraw' || confirmation?.action === 'return';
  const selectionChanged = Boolean(send && (!selection ||
    send.selection.previewRunId !== selection.previewRunId ||
    send.selection.employeeIds.join(',') !== selection.employeeIds.join(',')));
  const actionsAllowed = current && !detail.isFetching;

  return (
    <Stack spacing={1} sx={{ px: 1, py: 0.5 }}>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
        <Button size="small" variant="outlined" onClick={() => {
          setFeedback(undefined);
          setSelectedId((id) => id || pending[0]?.id || '');
          setOpen(true);
        }}>
          Approval batches{pending.length ? ` (${pending.length} pending)` : ''}
        </Button>
        {settings.mode === 'Active' && canSubmit && (
          <Button variant="contained" size="small" disabled={!selection} onClick={() => beginSend(false)}>
            Send for approval
          </Button>
        )}
        {settings.mode === 'Active' && canSelfFinalize && settings.allowSelfFinalization && (
          <Button variant="outlined" size="small" disabled={!selection} onClick={() => beginSend(true)}>
            Prepare to finalize myself
          </Button>
        )}
        {canExport && selection && (
          <PayrollReviewSheetButtons selection={{ ...period, previewRunId: selection.previewRunId, employeeIds: selection.employeeIds }} />
        )}
      </Stack>
      {settings.mode === 'Paused' && <Alert severity="info">Payroll approval is paused. Pending batches can be returned or withdrawn.</Alert>}
      {batches.isError && <Alert severity="error">Approval batches could not be loaded. <Button onClick={() => batches.refetch()}>Retry</Button></Alert>}

      <Dialog open={open} onClose={() => { setOpen(false); setFeedback(undefined); }} fullWidth maxWidth="md" aria-labelledby="payroll-batch-title">
        <DialogTitle id="payroll-batch-title">Payroll approval batches</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {(batches.isFetching || detail.isFetching) && <LinearProgress aria-label="Loading payroll batches" />}
            {!confirmation && feedback && <Alert severity={feedback.kind}>{feedback.text}</Alert>}
            {batches.isError && <Alert severity="error">Approval batches could not be loaded.</Alert>}
            {batches.currentData?.length ? (
              <TextField select label="Batch" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
                {batches.currentData.map((batch) => (
                  <MenuItem key={batch.id} value={batch.id}>
                    {batch.state === 'Pending' ? 'Pending finalization' : batch.state}
                    {' · '}{batch.staffCount} staff{' · '}{formatPayrollCurrency(batch.netPay)}
                    {' · '}{batch.id.slice(0, 8)}
                  </MenuItem>
                ))}
              </TextField>
            ) : !batches.isFetching && !batches.isError && <Typography>No approval batches for this month.</Typography>}
            {detail.isError && <Alert severity="error">Batch details could not be loaded. <Button onClick={() => detail.refetch()}>Retry</Button></Alert>}
            {current && (
              <>
                {current.submission.isStale && <Alert severity="warning">Payroll evidence changed. Return the whole batch for fresh review.</Alert>}
                <Typography variant="subtitle2">
                  {current.submission.staffCount} staff · {formatPayrollCurrency(current.submission.netPay)} net pay
                </Typography>
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
        </DialogContent>
        <DialogActions sx={{ flexWrap: 'wrap' }}>
          <Button onClick={() => { setOpen(false); setFeedback(undefined); }}>Close</Button>
          {actionsAllowed && current.submission.allowedActions.map((action) => (
            <Button key={action} variant={action === 'finalize' ? 'contained' : 'text'} onClick={() => {
              setReason('');
              setFeedback(undefined);
              setConfirmation({ key: crypto.randomUUID(), action, batch: current.submission });
            }}>
              {action === 'finalize' && current.submission.isStale ? 'Return changed batch' : actionLabels[action]}
            </Button>
          ))}
        </DialogActions>
      </Dialog>

      {send && (
        <Dialog open onClose={submitState.isLoading ? undefined : () => setSend(null)} fullWidth maxWidth="sm" aria-labelledby="payroll-send-title">
          <DialogTitle id="payroll-send-title">{send.selfFinalize ? 'Prepare self-finalization' : 'Send payroll for approval'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography>
                {send.selection.employeeIds.length} reviewed staff · {formatPayrollCurrency(send.selection.netPay)} net pay
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {send.selfFinalize ? 'You will confirm the batch in Approval batches.' : 'The school’s designated principal or admin will receive this batch.'}
              </Typography>
              {Boolean(batches.currentData?.some((batch) => batch.allowedActions.length === 0 && ['Returned', 'Withdrawn'].includes(batch.state))) && (
                <TextField select label="Resubmitting a previous batch?" value={previousSubmissionId} onChange={(event) => setPreviousSubmissionId(event.target.value)}>
                  <MenuItem value="">New batch</MenuItem>
                  {batches.currentData?.filter((batch) => ['Returned', 'Withdrawn'].includes(batch.state)).map((batch) => (
                    <MenuItem key={batch.id} value={batch.id}>{batch.state} · {batch.staffCount} staff · {batch.id.slice(0, 8)}</MenuItem>
                  ))}
                </TextField>
              )}
              {feedback && <Alert severity={feedback.kind}>{feedback.text}</Alert>}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSend(null)} disabled={submitState.isLoading}>Cancel</Button>
            <Button variant="contained" onClick={sendSelected} loading={submitState.isLoading} disabled={selectionChanged}>
              {send.selfFinalize ? 'Create batch for myself' : 'Confirm and send'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {confirmation && (
        <Dialog open onClose={resolveState.isLoading ? undefined : () => setConfirmation(null)} fullWidth maxWidth="sm" aria-labelledby="payroll-batch-confirmation-title">
          <DialogTitle id="payroll-batch-confirmation-title">
            {confirmation.action === 'finalize' && confirmation.batch.isStale ? 'Return changed batch' : actionLabels[confirmation.action]}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography>{confirmation.batch.staffCount} staff · {formatPayrollCurrency(confirmation.batch.netPay)} net pay</Typography>
              {confirmation.action === 'finalize' && !confirmation.batch.isStale && (
                <Typography>Finalization issues payslips for everyone in this batch together.</Typography>
              )}
              {reasonsRequired && <TextField label="Reason" value={reason} onChange={(event) => setReason(event.target.value)} slotProps={{ htmlInput: { maxLength: 500 } }} fullWidth multiline />}
              {feedback && <Alert severity={feedback.kind}>{feedback.text}</Alert>}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmation(null)} disabled={resolveState.isLoading}>Cancel</Button>
            <Button variant="contained" onClick={resolveBatch} loading={resolveState.isLoading} disabled={reasonsRequired && !reason.trim()}>
              {confirmation.action === 'finalize' && !confirmation.batch.isStale ? 'Confirm finalization' : 'Confirm'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Stack>
  );
}
