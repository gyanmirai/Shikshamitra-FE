import type { FinanceExternalWaiver } from 'src/redux/library/charges-management/finance-external.types';

import { Box, Alert, Button } from '@mui/material';
import { FinanceWaiverAction } from 'src/redux/library/charges-management/finance-corrections.types';

import { FinanceWaiverFields } from './FinanceWaiverFields';

import type { FinanceWaiverFormState } from './FinanceWaiverFields';

export function FinanceWaiverDraft({
  form,
  action,
  disabled,
}: {
  form: FinanceWaiverFormState;
  action: FinanceWaiverAction;
  disabled: boolean;
}) {
  return (
    <>
      <FinanceWaiverFields form={form} action={action} />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button type="button" size="small" disabled={disabled} onClick={form.cancel}>
          Clear draft
        </Button>
        <Button
          type="button"
          size="small"
          variant="contained"
          disabled={disabled || !form.available}
          onClick={() => form.formik.submitForm()}
        >
          {action === FinanceWaiverAction.Reverse ? 'Review reversal' : 'Submit waiver'}
        </Button>
      </Box>
    </>
  );
}

export function FinanceWaiverResult({ result }: { result: FinanceExternalWaiver | null }) {
  if (!result) return null;
  return (
    <Alert severity={result.state === 0 ? 'info' : 'success'}>
      {result.state === 0
        ? 'Last action: pending approval. The waiver request awaits independent review.'
        : result.state === 2
          ? 'The waiver request was rejected.'
          : 'The waiver action was recorded. Original evidence is retained.'}
    </Alert>
  );
}
