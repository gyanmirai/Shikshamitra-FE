import { LoadingButton } from 'src/components/loading-button';
import { Stack, Alert, Button, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

import { financeAmount } from './FinanceAssessmentSummary';
import { useFinanceRefundRequest } from './useFinanceRefundRequest';
import { FinanceRefundRequestFields } from './FinanceRefundRequestFields';

import type { FinanceRefundRequestProps } from './useFinanceRefundRequest';

export function FinanceRefundRequestForm(props: FinanceRefundRequestProps) {
  const { data, disabled } = props;
  const state = useFinanceRefundRequest(props);
  const { formik, preview, error, uncertain, working } = state;
  const { currency } = data.receivable;
  return (
    <FormSectionCard
      title="Request Refund"
      icon="mdi:cash-refund"
      descriptionTooltip="Select actual settled receipt allocations. Finance applies the recorded refund policy and checks current source access before accepting the request."
    >
      <Stack spacing={2}>
        <FinanceRefundRequestFields state={state} data={data} />
        {error && <Alert severity="error">{error}</Alert>}
        {!data.canRequest && (
          <Alert severity="warning">
            {data.setupIssues.join(' ') ||
              'This source is not currently eligible for a refund request.'}
          </Alert>
        )}
        {preview ? (
          <>
            <Typography variant="body2">
              Requested amount: {financeAmount(preview.requestedAmount, currency)}
            </Typography>
            <Typography variant="body2">
              Calculated payout: {financeAmount(preview.maximumAllowedAmount, currency)}
            </Typography>
            <Typography variant="body2">
              The recorded refund policy calculates the payable amount in whole rupees. Submitting
              this request does not record a payment.
            </Typography>
            {uncertain && (
              <Alert severity="warning">
                The outcome is not confirmed. Retry this same refund request before editing or
                closing.
              </Alert>
            )}
            <Stack direction="row" spacing={1}>
              <Button disabled={working || uncertain} onClick={state.cancel}>
                Keep editing
              </Button>
              <LoadingButton
                type="button"
                variant="contained"
                size="small"
                loading={working}
                disabled={disabled || working}
                onClick={state.submit}
              >
                {uncertain ? 'Retry previous refund request' : 'Submit refund'}
              </LoadingButton>
            </Stack>
          </>
        ) : (
          <LoadingButton
            type="button"
            onClick={() => formik.submitForm()}
            variant="contained"
            size="small"
            loading={working}
            disabled={state.locked}
          >
            Preview refund
          </LoadingButton>
        )}
      </Stack>
    </FormSectionCard>
  );
}
