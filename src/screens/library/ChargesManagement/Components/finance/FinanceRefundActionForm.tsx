import { skipToken } from '@reduxjs/toolkit/query';
import { LoadingButton } from 'src/components/loading-button';
import { Stack, Alert, Button, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useGetFinanceRoutingOptionsQuery } from 'src/redux/finance/financeRoutingApi';

import { financeAmount } from './FinanceAssessmentSummary';
import { useFinanceRefundAction } from './useFinanceRefundAction';
import { FinanceRefundActionFields } from './FinanceRefundActionFields';

import type { FinanceActionProps } from './finance-flow-types';
import type { FinanceRefundAction, FinanceRefundRecord } from './finance-refund-action-types';

export function FinanceRefundActionForm({
  row,
  action,
  onComplete,
  onClose,
  onCheckStatus,
  ...props
}: FinanceActionProps & {
  row: FinanceRefundRecord;
  action: FinanceRefundAction;
  onComplete: () => void;
  onClose: () => void;
  onCheckStatus: () => void;
}) {
  const routing = action === 'approve' || action === 'recordPayout';
  const options = useGetFinanceRoutingOptionsQuery(
    routing ? { academicYearId: row.academicYearId, operation: 'refund' } : skipToken,
    { refetchOnMountOrArgChange: true }
  );
  const state = useFinanceRefundAction({
    row,
    action,
    onComplete,
    disabled:
      props.disabled ||
      (routing && (options.isFetching || options.isError || !options.currentData)),
    onBusyChange: props.onBusyChange,
    onDirtyChange: props.onDirtyChange,
  });
  const method = row.refundMethod || '';
  const title = {
    approve: 'Approve Refund',
    reject: 'Reject Refund',
    recordPayout: 'Record Refund Payment',
    returnPayout: 'Return Refund Payment',
  }[action];
  const button = {
    approve: method === 'Cash' ? 'Approve and pay cash' : 'Confirm approval',
    reject: 'Reject refund',
    recordPayout: 'Record payment',
    returnPayout: 'Confirm return',
  }[action];
  const payoutKnown = (row.allowedPayoutMethods || []).includes(method);
  const needsMethod = action === 'approve' || action === 'recordPayout';
  const unsupported = needsMethod && (!payoutKnown || !method);
  return (
    <FormSectionCard
      title={title}
      icon="mdi:cash-refund"
      descriptionTooltip="Finance checks the actual request, recorded billing year, current permissions and independent reviewer rules before changing money. Recording payment completes this typed payout atomically."
    >
      <Stack spacing={2}>
        <Typography variant="body2">
          {row.payerName || row.studentName || 'Payer name not recorded'} · {row.voucherNumber}
        </Typography>
        <Typography variant="body2">
          Original receipt: {row.originalReceiptNumber || 'Not recorded'}
        </Typography>
        <Typography variant="body2">
          Requested: {financeAmount(row.totalAmount, row.currency)} · Calculated:{' '}
          {financeAmount(row.calculatedAmount, row.currency)}
        </Typography>
        {needsMethod && (
          <Typography variant="body2">
            Payout method: {method || 'Unavailable'} · Approved:{' '}
            {financeAmount(row.approvedAmount, row.currency)}
          </Typography>
        )}
        {action === 'approve' && method === 'Cash' && (
          <Alert severity="warning">
            Approving this cash refund records the cash payment in the same action. A second payout
            is not required.
          </Alert>
        )}
        {unsupported && (
          <Alert severity="warning">
            The saved payout method is unavailable in this request’s recorded policy. Finance review
            is required.
          </Alert>
        )}
        {options.isError && (
          <Alert
            severity="error"
            action={<Button onClick={() => options.refetch()}>Retry routing</Button>}
          >
            {parseApiProblemDetail(options.error).detail}
          </Alert>
        )}
        <FinanceRefundActionFields
          state={state}
          action={action}
          method={method}
          options={options.currentData}
          routingUnavailable={options.isFetching || options.isError || !options.currentData}
        />
        {state.error && <Alert severity="error">{state.error}</Alert>}
        {state.uncertain && (
          <Alert severity="warning">
            The outcome is not confirmed.{' '}
            {action === 'recordPayout'
              ? 'Retry the same saved payment.'
              : 'Check the saved request status before attempting another action.'}
          </Alert>
        )}
        <Stack direction="row" spacing={1}>
          <Button disabled={state.working || state.uncertain} onClick={onClose}>
            Cancel
          </Button>
          {state.uncertain && action !== 'recordPayout' ? (
            <Button onClick={onCheckStatus}>Check saved status</Button>
          ) : (
            <LoadingButton
              size="small"
              type="button"
              onClick={() => state.formik.submitForm()}
              variant="contained"
              loading={state.working}
              disabled={
                props.disabled ||
                state.working ||
                unsupported ||
                (routing && (options.isFetching || options.isError || !options.currentData))
              }
            >
              {state.uncertain ? 'Retry previous payment' : button}
            </LoadingButton>
          )}
        </Stack>
      </Stack>
    </FormSectionCard>
  );
}
