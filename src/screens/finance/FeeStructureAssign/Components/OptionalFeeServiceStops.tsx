import type { Dayjs } from 'dayjs';
import type {
  AssignmentHead,
  AssignmentPreview,
  OptionalServiceStopResult,
} from 'src/redux/finance/studentFeeAssignment';

import dayjs from 'dayjs';
import { fDate } from 'src/utils/format-time';
import { Label } from 'src/components/label';
import { useRef, useState, useEffect } from 'react';
import { formatNumber } from 'src/utils/formate_number';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { FormSectionCard } from 'src/components/form-section-card';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Alert,
  Stack,
  Button,
  Checkbox,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';
import {
  assignmentError,
  useAssignmentOptionalServiceStopMutation,
  useAssignmentOptionalServiceStopPreviewMutation,
} from 'src/redux/finance/studentFeeAssignment';

export default function OptionalFeeServiceStops({
  assignment,
  disabled,
  onSaved,
  onBusyChange,
  disabledReason,
}: {
  assignment: AssignmentPreview;
  disabled?: boolean;
  onSaved?: () => void;
  onBusyChange?: (busy: boolean) => void;
  disabledReason?: string;
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
  useEffect(() => {
    onBusyChange?.(busy);
    return () => onBusyChange?.(false);
  }, [busy, onBusyChange]);
  const heads = assignment.heads.filter((item) => item.isOptional);
  const hasUnselected = heads.some((item) => !item.included);
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
    <FormSectionCard
      title="Optional Fee Heads"
      icon="mdi:format-list-checks"
      descriptionTooltip="Review every optional fee from the assigned structure. Stop an active recurring service to cancel eligible future installments."
    >
      <Stack spacing={1}>
        {hasUnselected && (
          <Typography variant="body2" color="text.secondary">
            Adding optional fees through this assignment requires an editable fee structure.
          </Typography>
        )}
        {heads.map((item) => {
          const lines = assignment.lines.filter((line) => line.feeHeadId === item.feeHeadId);
          const cancelledAmount = lines.reduce(
            (sum, line) => sum + (line.optionalServiceCancellationAmount ?? 0),
            0
          );
          const stopped = cancelledAmount > 0;
          const blocker = disabled
            ? disabledReason || 'This action is unavailable while another change is pending.'
            : !item.servicePeriod?.startDate || !item.servicePeriod?.endDate
              ? 'Saved service dates are unavailable for this fee.'
              : !lines.some((line) => line.outstandingAmount > 0 && !line.paidAmount)
                ? 'There are no unpaid installments available to cancel for this service.'
                : undefined;
          return (
            <Stack
              key={item.feeHeadId}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={1}
            >
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0 }}>
                <Checkbox
                  checked={item.included && !stopped}
                  disabled
                  inputProps={{ 'aria-label': item.feeHeadName }}
                />
                <div>
                  <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                    {item.feeHeadName}
                  </Typography>
                  {stopped && (
                    <Typography variant="body2" color="text.secondary">
                      {formatNumber(cancelledAmount, assignment.currency)} cancelled
                    </Typography>
                  )}
                </div>
              </Stack>
              {stopped && <Label sx={{ flexShrink: 0 }}>Service stopped</Label>}
              {!item.included && <Label sx={{ flexShrink: 0 }}>Not selected</Label>}
              {item.included && !stopped && !item.isOneTime && (
                <CustomTooltip
                  title={blocker || `Stop service for ${item.feeHeadName}`}
                  describeChild
                >
                  {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Keep the disabled action's explanation reachable by keyboard. */}
                  <span tabIndex={blocker ? 0 : undefined} style={{ display: 'inline-flex' }}>
                    <Button
                      variant="outlined"
                      color="inherit"
                      size="small"
                      aria-label={`Stop service for ${item.feeHeadName}`}
                      disabled={Boolean(blocker)}
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
                  </span>
                </CustomTooltip>
              )}
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
