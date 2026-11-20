import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Alert, Stack, Button, Typography } from '@mui/material';

import { financeAmount } from './FinanceAssessmentSummary';

import type { useFinanceCollectionForm } from './useFinanceCollectionForm';

export function FinanceCollectionConfirmation({
  state,
  currency,
  disabled,
  canCollect,
}: {
  state: ReturnType<typeof useFinanceCollectionForm>;
  currency: string;
  disabled: boolean;
  canCollect: boolean;
}) {
  const { review, mutation, uncertain, error, frozen, cancel, submit } = state;
  return (
    <ConfirmDialog
      open={review}
      title="Confirm payment"
      disableCancel={mutation.isLoading || uncertain}
      bodyBusy={mutation.isLoading}
      onClose={cancel}
      content={
        <Stack spacing={1}>
          <Typography>
            {financeAmount(frozen.current?.payments[0].amount || '0', currency)}
          </Typography>
          <Typography>School receipt date: {frozen.current?.schoolReceiptDate}</Typography>
          {error && <Alert severity="error">{error}</Alert>}
          {uncertain && (
            <Alert severity="warning">
              The payment outcome is not confirmed. Retry this same payment to retrieve its result.
            </Alert>
          )}
        </Stack>
      }
      action={
        <Button
          variant="contained"
          onClick={submit}
          disabled={mutation.isLoading || disabled || !canCollect}
        >
          {uncertain ? 'Retry same payment' : 'Record payment'}
        </Button>
      }
    />
  );
}
