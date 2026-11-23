import type { Dayjs } from 'dayjs';
import type {
  AssignmentHead,
  AssignmentPreview,
  OptionalServiceStopResult,
} from 'src/redux/finance/studentFeeAssignment';

import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { fDate } from 'src/utils/format-time';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import { formatNumber } from 'src/utils/formate_number';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { FormSectionCard } from 'src/components/form-section-card';
import { DetailField } from 'src/screens/finance/components/detail-view';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Alert, Stack, Button, Divider, TextField, Typography, DialogActions } from '@mui/material';
import {
  assignmentError,
  useAssignmentOptionalServiceStopMutation,
  useAssignmentOptionalServiceStopPreviewMutation,
} from 'src/redux/finance/studentFeeAssignment';

import { optionalServiceStatus } from './optionalServiceStatus';
import AssignmentFeeHeadSummary from './AssignmentFeeHeadSummary';
import OptionalFeeServiceRestart from './OptionalFeeServiceRestart';

import type { FeeHeadProration } from './assignmentReviewPresentation';

export default function OptionalFeeServiceStops({
  assignment,
  disabled,
  onSaved,
  onBusyChange,
  disabledReason,
  feeHeadProration,
  canRestart,
}: {
  assignment: AssignmentPreview;
  disabled?: boolean;
  onSaved?: () => void;
  onBusyChange?: (busy: boolean) => void;
  disabledReason?: string;
  feeHeadProration?: Map<string, FeeHeadProration>;
  canRestart?: boolean;
}) {
  const [head, setHead] = useState<AssignmentHead>();
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
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
  const hasUnavailableOptions = heads.some(
    (item) => !item.included && (!canRestart || item.isOneTime)
  );
  const blocker = disabled
    ? disabledReason || 'This action is unavailable while another change is pending.'
    : undefined;
  const minDate = head?.servicePeriod?.startDate
    ? dayjs(head.servicePeriod.startDate.slice(0, 10))
    : undefined;
  const maxDate = head?.servicePeriod?.endDate
    ? dayjs(head.servicePeriod.endDate.slice(0, 10))
    : undefined;
  const validDate =
    endDate?.isValid() &&
    minDate &&
    maxDate &&
    !endDate.isBefore(minDate, 'day') &&
    !endDate.isAfter(maxDate, 'day');

  if (!heads.length) return null;

  const submit = async () => {
    if (pending.current || !head || !endDate || !validDate || !reason.trim()) return;
    pending.current = true;
    setError('');
    const body = {
      studentId: assignment.studentId,
      academicYearId: assignment.academicYearId,
      feeHeadId: head.feeHeadId,
      lastServiceDate: endDate.subtract(1, 'day').format('YYYY-MM-DD'),
      reason: reason.trim(),
      requestId,
    };
    try {
      if (!quote?.previewToken) {
        setQuote(await preview(body).unwrap());
      } else {
        await stop({ ...body, previewToken: quote.previewToken }).unwrap();
        setHead(undefined);
        shikshaMitraToast.success({ message: 'Service cancellation saved.' });
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
      descriptionTooltip="Manage recurring optional services and review their saved fee amounts and service dates."
    >
      <Stack spacing={1.5} divider={<Divider flexItem />}>
        {hasUnavailableOptions && (
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
          const { stopped, label, latestPeriod } = optionalServiceStatus(item, cancelledAmount > 0);
          const servicePeriod = latestPeriod ?? item.servicePeriod;
          const supportsStop = item.included && !item.isOneTime && label !== 'Ended';
          const stopBlocker = stopped ? 'This service has already been cancelled.' : blocker;
          const stopLabel = `Cancel service for ${item.feeHeadName}`;
          const unavailableReason =
            !servicePeriod?.startDate || !servicePeriod?.endDate
              ? 'Service dates are unavailable for this fee.'
              : undefined;
          const showCancel = supportsStop && !unavailableReason;
          const showEnable = canRestart && !item.isOneTime && (stopped || !item.included);
          const dates =
            item.included && !stopped && servicePeriod?.startDate && servicePeriod.endDate
              ? `${fDate(servicePeriod.startDate)} – ${fDate(servicePeriod.endDate)}`
              : undefined;
          return (
            <AssignmentFeeHeadSummary
              key={item.feeHeadId}
              head={item}
              currency={assignment.currency}
              calculation={feeHeadProration?.get(item.feeHeadId)}
              status={
                label ? (
                  <Label color={stopped || label === 'Ended' ? 'default' : 'success'}>
                    {label}
                  </Label>
                ) : !item.included ? (
                  <Label>Not selected</Label>
                ) : undefined
              }
              serviceDetails={
                item.included && (
                  <>
                    {dates && (
                      <DetailField
                        label={
                          latestPeriod &&
                          (item.originalOptionalServiceEndDate ||
                            (item.optionalServicePeriods?.length ?? 0) > 1)
                            ? 'Restarted service dates'
                            : 'Service dates'
                        }
                        value={dates}
                      />
                    )}
                    {stopped && item.optionalServiceEndDate && (
                      <DetailField
                        label="Cancellation effective date"
                        value={fDate(item.optionalServiceEndDate)}
                      />
                    )}
                    {item.originalOptionalServiceEndDate && latestPeriod && (
                      <DetailField
                        label="Original cancellation date"
                        value={fDate(item.originalOptionalServiceEndDate)}
                      />
                    )}
                    {cancelledAmount > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        {formatNumber(cancelledAmount, assignment.currency)} cancelled
                      </Typography>
                    )}
                    {supportsStop && unavailableReason && (
                      <Typography variant="caption" color="text.secondary">
                        {unavailableReason}
                      </Typography>
                    )}
                  </>
                )
              }
              actions={
                (showEnable || showCancel) && (
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    {showEnable && (
                      <OptionalFeeServiceRestart
                        assignment={assignment}
                        head={item}
                        disabledReason={blocker}
                        onSaved={onSaved}
                        onBusyChange={onBusyChange}
                      />
                    )}
                    {showCancel && (
                      <CustomTooltip title={stopBlocker || stopLabel} describeChild>
                        <span
                          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Keep the disabled action's explanation reachable by keyboard.
                          tabIndex={stopBlocker ? 0 : undefined}
                          style={{ display: 'inline-flex' }}
                        >
                          <Button
                            variant="outlined"
                            color="inherit"
                            size="small"
                            aria-label={stopLabel}
                            startIcon={<Iconify icon={GlobalIcons.cancel} />}
                            disabled={Boolean(stopBlocker)}
                            onClick={() => {
                              setHead({
                                ...item,
                                servicePeriod: servicePeriod
                                  ? {
                                      ...item.servicePeriod,
                                      feeHeadId: item.feeHeadId,
                                      source: item.servicePeriod?.source ?? 'ManualOverride',
                                      startDate: servicePeriod.startDate,
                                      endDate: servicePeriod.endDate,
                                    }
                                  : undefined,
                              });
                              setEndDate(null);
                              setReason('');
                              setQuote(undefined);
                              setError('');
                              setRequestId(globalThis.crypto.randomUUID());
                            }}
                          >
                            Cancel service
                          </Button>
                        </span>
                      </CustomTooltip>
                    )}
                  </Stack>
                )
              }
            />
          );
        })}
      </Stack>
      <CustomDialog
        open={Boolean(head)}
        title={`Cancel ${head?.feeHeadName ?? 'Optional Fee'} Service`}
        handleClose={() => setHead(undefined)}
        disableClose={busy}
        hasUnsavedChanges={Boolean(endDate || reason)}
        hasForm={false}
      >
        <DialogScrollContent>
          <Stack spacing={2}>
            {quote ? (
              <Alert severity="warning">
                Service ends on {fDate(endDate)}.{' '}
                {quote.installmentCount
                  ? `${quote.installmentCount} ${quote.installmentCount === 1 ? 'installment' : 'installments'} totaling ${formatNumber(quote.cancelledAmount, assignment.currency)} will be deducted.`
                  : 'There are no installments eligible for cancellation.'}
                {quote.installmentCount > 0 && (
                  <>
                    {' '}
                    Outstanding fees decrease by{' '}
                    {formatNumber(
                      quote.outstandingReduction ?? quote.cancelledAmount,
                      assignment.currency
                    )}
                    .
                    {!!quote.prepaidCredit && (
                      <>
                        {' '}
                        Prepaid service credit is{' '}
                        {formatNumber(quote.prepaidCredit, assignment.currency)}.
                      </>
                    )}
                  </>
                )}
              </Alert>
            ) : (
              <>
                <DatePicker
                  label="Cancellation effective date"
                  format="DD/MM/YYYY"
                  minDate={minDate}
                  maxDate={maxDate}
                  value={endDate}
                  onChange={setEndDate}
                  disabled={busy}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      size: 'small',
                      helperText: 'Choose the first day the service is no longer provided.',
                    },
                  }}
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
            startIcon={<Iconify icon={quote ? GlobalIcons.back : GlobalIcons.cancel} />}
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
            startIcon={<Iconify icon={quote ? GlobalIcons.submit : GlobalIcons.eye} />}
            disabled={!validDate || !reason.trim() || busy}
            onClick={submit}
          >
            {quote ? 'Confirm cancellation' : 'Preview cancellation'}
          </Button>
        </DialogActions>
      </CustomDialog>
    </FormSectionCard>
  );
}
