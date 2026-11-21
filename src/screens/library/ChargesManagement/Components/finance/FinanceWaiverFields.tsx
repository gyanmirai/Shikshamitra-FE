import { Stack, Alert, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { FinanceWaiverAction } from 'src/redux/library/charges-management/finance-corrections.types';

import type { useFinanceWaiverForm } from './useFinanceWaiverForm';

export type FinanceWaiverFormState = ReturnType<typeof useFinanceWaiverForm>;

export function FinanceWaiverFields({
  form,
  action,
}: {
  form: FinanceWaiverFormState;
  action: FinanceWaiverAction;
}) {
  const { formik, locked, decision, change, command } = form;
  const reversal = action === FinanceWaiverAction.Reverse;
  const error = (field: 'amount' | 'reason') =>
    formik.touched[field] || formik.submitCount > 0 ? formik.errors[field] : undefined;
  return (
    <Stack spacing={2}>
      {!decision && (
        <ShakingTextField error={Boolean(error('amount'))}>
          <NumericFormatCustom
            fullWidth
            size="small"
            required
            valueIsNumericString
            roundToWholeRupees={false}
            decimalScale={2}
            label={reversal ? 'Reversal amount' : 'Waiver amount'}
            name="amount"
            value={formik.values.amount}
            disabled={locked}
            error={Boolean(error('amount'))}
            helperText={error('amount')}
            onBlur={() => formik.setFieldTouched('amount', true)}
            onValueChange={(value, source) => {
              if (source.source === 'event') change('amount', value.value);
            }}
          />
        </ShakingTextField>
      )}
      <ShakingTextField error={Boolean(error('reason'))}>
        <TextField
          fullWidth
          size="small"
          required
          multiline
          minRows={2}
          name="reason"
          label={decision ? 'Decision reason' : reversal ? 'Reversal reason' : 'Waiver reason'}
          value={formik.values.reason}
          disabled={locked}
          slotProps={{ htmlInput: { maxLength: 1000 } }}
          onChange={(event) => change('reason', event.target.value)}
          onBlur={formik.handleBlur}
          error={Boolean(error('reason'))}
          helperText={error('reason')}
        />
      </ShakingTextField>
      {command.error && <Alert severity="error">{command.error}</Alert>}
      {command.uncertain && (
        <Alert severity="warning">
          The waiver outcome is not confirmed. Retry the previous action before editing or closing.
        </Alert>
      )}
    </Stack>
  );
}
