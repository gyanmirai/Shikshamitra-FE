import { Alert, Stack, Typography } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { LoadingButton } from 'src/components/loading-button';
import { FinanceWaiverAction } from 'src/redux/library/charges-management/finance-corrections.types';

import { financeAmount } from './FinanceAssessmentSummary';
import { FinanceWaiverFields } from './FinanceWaiverFields';

import type { FinanceWaiverFormState } from './FinanceWaiverFields';

export function FinanceWaiverConfirmation({
  form,
  action,
  decisionOpen,
  disabled,
}: {
  form: FinanceWaiverFormState;
  action: FinanceWaiverAction;
  decisionOpen: boolean;
  disabled: boolean;
}) {
  const reversal = action === FinanceWaiverAction.Reverse;
  const approve = action === FinanceWaiverAction.Approve;
  const title = form.decision
    ? approve
      ? 'Approve Waiver'
      : 'Reject Waiver'
    : reversal
      ? 'Confirm Waiver Reversal'
      : 'Confirm Waiver Request';
  const button = form.decision
    ? approve
      ? 'Confirm approve'
      : 'Confirm reject'
    : reversal
      ? 'Confirm reversal'
      : 'Confirm waiver';
  const input = form.review?.input;
  const currency = form.context?.receivable.currency;
  const target = (
    <Stack spacing={1}>
      <Typography variant="subtitle2">
        {form.context?.receivable.payer.displayName || 'Borrower name not recorded'}
      </Typography>
      {form.selected && (
        <>
          <Typography variant="body2">{form.selected.reason}</Typography>
          <Typography variant="body2">
            Requested amount:{' '}
            {currency
              ? financeAmount(form.selected.requestedAmount, currency)
              : String(form.selected.requestedAmount)}
          </Typography>
        </>
      )}
    </Stack>
  );
  return (
    <ConfirmDialog
      open={form.decision ? decisionOpen : Boolean(form.review)}
      title={title}
      icon="warning"
      disableCancel={form.busy || form.command.uncertain}
      onClose={form.cancel}
      content={
        form.decision ? (
          <Stack spacing={2}>
            {target}
            <FinanceWaiverFields form={form} action={action} />
          </Stack>
        ) : (
          <Stack spacing={1}>
            {target}
            {input && 'amount' in input && (
              <Typography variant="body2">
                {reversal ? 'Reversal amount' : 'Waiver amount'}:{' '}
                {currency ? financeAmount(input.amount, currency) : input.amount}
              </Typography>
            )}
            <Typography variant="body2">{input?.reason}</Typography>
            <Typography variant="body2">
              {reversal
                ? 'The original waiver remains in the record.'
                : 'A pending request is not an applied waiver or a cash payment.'}
            </Typography>
            {form.command.error && <Alert severity="error">{form.command.error}</Alert>}
            {form.command.uncertain && (
              <Alert severity="warning">
                The outcome is not confirmed. Retry this same action.
              </Alert>
            )}
          </Stack>
        )
      }
      action={
        <LoadingButton
          type="button"
          size="small"
          variant="contained"
          loading={form.busy}
          disabled={
            disabled || form.busy || (!form.command.uncertain && form.decision && !form.available)
          }
          onClick={() => {
            if (form.command.uncertain) form.retry();
            else if (form.decision) form.formik.submitForm();
            else form.confirm();
          }}
        >
          {form.command.uncertain ? 'Retry previous waiver action' : button}
        </LoadingButton>
      }
    />
  );
}
