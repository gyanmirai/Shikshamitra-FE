import type { Dayjs } from 'dayjs';
import type {
  AssignmentHead,
  AssignmentPreview,
  OptionalServiceStopResult,
} from 'src/redux/finance/studentFeeAssignment';

import dayjs from 'dayjs';
import { useRef, useState } from 'react';
import { fDate } from 'src/utils/format-time';
import { formatNumber } from 'src/utils/formate_number';
import { shikshaMitraToast } from 'src/components/toast';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { FormSectionCard } from 'src/components/form-section-card';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Alert, Button, DialogActions, Stack, TextField, Typography } from '@mui/material';
import {
  assignmentError,
  useAssignmentOptionalServiceStopMutation,
  useAssignmentOptionalServiceStopPreviewMutation,
} from 'src/redux/finance/studentFeeAssignment';

export default function OptionalFeeServiceStops({
  assignment,
  disabled,
  onSaved,
}: {
  assignment: AssignmentPreview;
  disabled?: boolean;
  onSaved?: () => void;
}) {
  const [head, setHead] = useState<AssignmentHead>();
  const [lastServiceDate, setLastServiceDate] = useState<Dayjs | null>(null);
  const [reason, setReason] = useState('');
  const [requestId, setRequestId] = useState('');
  const [quote, setQuote] = useState<OptionalServiceStopResult>();
  const [error, setError] = useState('');
  const [preview, previewState] = useAssignmentOptionalServiceStopPreviewMutation();
  const [stop, stopState] = useAssignmentOptionalServiceStopMutation();
  const pending = useRef(false);
  const busy = previewState.isLoading || stopState.isLoading;
  const heads = assignment.heads.filter(
    (item) =>
      item.included &&
      item.isOptional &&
      !item.isOneTime &&
      item.servicePeriod?.startDate &&
      item.servicePeriod?.endDate
  );
  const minDate = head?.servicePeriod?.startDate
    ? dayjs(head.servicePeriod.startDate.slice(0, 10))
    : undefined;
  const maxDate = head?.servicePeriod?.endDate
    ? dayjs(head.servicePeriod.endDate.slice(0, 10)).subtract(1, 'day')
    : undefined;
  const validDate =
    lastServiceDate?.isValid() &&
    minDate &&
    maxDate &&
    !lastServiceDate.isBefore(minDate, 'day') &&
    !lastServiceDate.isAfter(maxDate, 'day');

  if (!heads.length) return null;

  const submit = async () => {
    if (pending.current || !head || !lastServiceDate || !validDate || !reason.trim()) return;
    pending.current = true;
    setError('');
    const body = {
      studentId: assignment.studentId,
      academicYearId: assignment.academicYearId,
      feeHeadId: head.feeHeadId,
      lastServiceDate: lastServiceDate.format('YYYY-MM-DD'),
      reason: reason.trim(),
      requestId,
    };
    try {
      if (!quote?.previewToken) {
        setQuote(await preview(body).unwrap());
      } else {
        await stop({ ...body, previewToken: quote.previewToken }).unwrap();
        setHead(undefined);
        shikshaMitraToast.success({ message: 'Future unpaid installments cancelled.' });
        onSaved?.();
      }
    } catch (issue) {
      setError(assignmentError(issue));
    } finally {
      pending.current = false;
    }
  };

  return (
    <FormSectionCard title="Optional Fees" icon="mdi:format-list-checks">
      <Stack spacing={1}>
        {heads.map((item) => {
          const lines = assignment.lines.filter((line) => line.feeHeadId === item.feeHeadId);
          const cancelledAmount = lines.reduce(
            (sum, line) => sum + (line.optionalServiceCancellationAmount ?? 0),
            0
          );
          return (
            <Stack
              key={item.feeHeadId}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={1}
            >
              <div>
                <Typography variant="subtitle2">{item.feeHeadName}</Typography>
                {cancelledAmount > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {formatNumber(cancelledAmount, assignment.currency)} cancelled
                  </Typography>
                )}
              </div>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                aria-label={`Stop service for ${item.feeHeadName}`}
                disabled={
                  disabled || !lines.some((line) => line.outstandingAmount > 0 && !line.paidAmount)
                }
                onClick={() => {
                  setHead(item);
                  setLastServiceDate(null);
                  setReason('');
                  setQuote(undefined);
                  setError('');
                  setRequestId(globalThis.crypto.randomUUID());
                }}
              >
                Stop service
              </Button>
            </Stack>
          );
        })}
      </Stack>
      <CustomDialog
        open={Boolean(head)}
        title={`Stop ${head?.feeHeadName ?? 'Optional Fee'} Service`}
        handleClose={() => setHead(undefined)}
        disableClose={busy}
        hasUnsavedChanges={Boolean(lastServiceDate || reason)}
        hasForm={false}
      >
        <DialogScrollContent>
          <Stack spacing={2}>
            {quote ? (
              <Alert severity="warning">
                Cancel {quote.installmentCount} future unpaid{' '}
                {quote.installmentCount === 1 ? 'installment' : 'installments'} totaling{' '}
                {formatNumber(quote.cancelledAmount, assignment.currency)} after{' '}
                {fDate(lastServiceDate)}. Past charges and receipts will be kept.
              </Alert>
            ) : (
              <>
                <DatePicker
                  label="Last service date"
                  format="DD/MM/YYYY"
                  minDate={minDate}
                  maxDate={maxDate}
                  value={lastServiceDate}
                  onChange={setLastServiceDate}
                  disabled={busy}
                  slotProps={{ textField: { fullWidth: true, required: true, size: 'small' } }}
                />
                <TextField
                  label="Reason for stopping service"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  inputProps={{ maxLength: 500 }}
                  disabled={busy}
                  fullWidth
                  required
                  size="small"
                  multiline
                  minRows={2}
                />
              </>
            )}
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </DialogScrollContent>
        <DialogActions>
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            disabled={busy}
            onClick={() => {
              if (quote) {
                setQuote(undefined);
                setError('');
              } else {
                setHead(undefined);
              }
            }}
          >
            {quote ? 'Back' : 'Cancel'}
          </Button>
          <Button
            variant="contained"
            color="inherit"
            size="small"
            loading={busy}
            disabled={!validDate || !reason.trim() || busy}
            onClick={submit}
          >
            {quote ? 'Cancel future installments' : 'Preview cancellation'}
          </Button>
        </DialogActions>
      </CustomDialog>
    </FormSectionCard>
  );
}
