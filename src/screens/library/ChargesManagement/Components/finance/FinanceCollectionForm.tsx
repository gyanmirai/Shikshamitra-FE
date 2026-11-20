import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Alert, Stack, Button, TextField, Typography } from '@mui/material';

import { FinancePaymentFields } from './FinancePaymentFields';
import { FinanceCollectionInputs } from './FinanceCollectionInputs';
import { useFinanceCollectionForm } from './useFinanceCollectionForm';
import { FinanceCollectionConfirmation } from './FinanceCollectionConfirmation';

import type { FinanceCollectionProps } from './useFinanceCollectionCommand';

export function FinanceCollectionForm(props: FinanceCollectionProps) {
  const { disabled, canCollect } = props;
  const state = useFinanceCollectionForm(props);
  const { query, data, error, review, locked, formik, routing } = state;
  if (query.isLoading || (!data && !query.isError))
    return <Typography role="status">Loading Finance collection...</Typography>;
  if (query.isError)
    return (
      <Alert severity="error" action={<Button onClick={() => query.refetch()}>Retry</Button>}>
        {parseApiProblemDetail(query.error).detail}
      </Alert>
    );
  if (!data) return null;
  return (
    <FormSectionCard
      title="Collect payment"
      icon="mdi:cash-multiple"
      descriptionTooltip="Finance records a payment against this assessment. Pending bank instruments reserve the amount until verification."
    >
      <Stack spacing={2}>
        {data.setupIssues.map((issue) => (
          <Alert severity="warning" key={issue}>
            {issue}
          </Alert>
        ))}
        {!canCollect && (
          <Alert severity="info">Collection permission is required to record a payment.</Alert>
        )}
        {error && !review && <Alert severity="error">{error}</Alert>}
        <FinanceCollectionInputs
          formik={formik}
          disabled={locked || !data.canCollect}
          paymentMethods={data.paymentMethods}
        />
        {routing.isError && (
          <Alert severity="error">{parseApiProblemDetail(routing.error).detail}</Alert>
        )}
        <FinancePaymentFields
          formik={formik}
          disabled={locked || routing.isFetching || !data.canCollect}
          banks={routing.data?.bankAccounts || []}
        />
        <TextField
          label="Payment notes"
          name="notes"
          size="small"
          value={formik.values.notes}
          onChange={formik.handleChange}
          disabled={locked || !data.canCollect}
          multiline
          minRows={2}
        />
        <Button
          variant="contained"
          onClick={() => formik.submitForm()}
          disabled={locked || !data.canCollect || query.isFetching || routing.isFetching}
        >
          Review payment
        </Button>
        <FinanceCollectionConfirmation
          state={state}
          currency={data.receivable.currency}
          disabled={disabled}
          canCollect={canCollect}
        />
      </Stack>
    </FormSectionCard>
  );
}
