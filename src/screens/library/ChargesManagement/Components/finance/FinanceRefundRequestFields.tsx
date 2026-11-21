import ShakingTextField from 'src/components/shaking-text-field';
import { Stack, Button, MenuItem, TextField } from '@mui/material';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import { financeAmount } from './FinanceAssessmentSummary';

import type { useFinanceRefundRequest, FinanceRefundRequestProps } from './useFinanceRefundRequest';

export function FinanceRefundRequestFields({
  state,
  data,
}: {
  state: ReturnType<typeof useFinanceRefundRequest>;
  data: FinanceRefundRequestProps['data'];
}) {
  const { formik, locked } = state;
  const change = (index: number, field: 'allocationId' | 'amount', value: string) =>
    formik.setFieldValue(`lines.${index}.${field}`, value);
  return (
    <Stack spacing={2}>
      {formik.values.lines.map((line, index) => {
        const touched = formik.submitCount > 0 || formik.touched.lines?.[index];
        const error = formik.errors.lines?.[index];
        const errors = typeof error === 'object' ? error : {};
        return (
          <Stack key={index} spacing={1}>
            <ShakingTextField error={Boolean(touched && errors.allocationId)}>
              <TextField
                fullWidth
                select
                required
                size="small"
                label="Paid receipt"
                value={line.allocationId}
                disabled={locked}
                onChange={(event) => change(index, 'allocationId', event.target.value)}
                error={Boolean(touched && errors.allocationId)}
                helperText={touched && errors.allocationId}
              >
                {data.sources.map((source) => (
                  <MenuItem key={source.sourceAllocationId} value={source.sourceAllocationId}>
                    {source.receiptNumber} — available{' '}
                    {financeAmount(source.availableAmount, data.receivable.currency)}
                  </MenuItem>
                ))}
              </TextField>
            </ShakingTextField>
            <ShakingTextField error={Boolean(touched && errors.amount)}>
              <NumericFormatCustom
                fullWidth
                required
                size="small"
                label="Refund amount"
                name={`lines.${index}.amount`}
                value={line.amount}
                valueIsNumericString
                roundToWholeRupees={false}
                decimalScale={2}
                disabled={locked}
                onValueChange={(value, origin) => {
                  if (origin.source === 'event') change(index, 'amount', value.value);
                }}
                error={Boolean(touched && errors.amount)}
                helperText={touched && errors.amount}
              />
            </ShakingTextField>
            {formik.values.lines.length > 1 && (
              <Button
                disabled={locked}
                onClick={() =>
                  formik.setFieldValue(
                    'lines',
                    formik.values.lines.filter((_, item) => item !== index)
                  )
                }
              >
                Remove receipt
              </Button>
            )}
          </Stack>
        );
      })}
      {formik.values.lines.length < data.sources.length && (
        <Button
          disabled={locked}
          onClick={() =>
            formik.setFieldValue('lines', [
              ...formik.values.lines,
              { allocationId: '', amount: '' },
            ])
          }
        >
          Add receipt
        </Button>
      )}
      {typeof formik.errors.lines === 'string' && <span role="alert">{formik.errors.lines}</span>}
      <ShakingTextField error={Boolean(formik.touched.method && formik.errors.method)}>
        <TextField
          fullWidth
          select
          required
          size="small"
          name="method"
          label="Payout method"
          value={formik.values.method}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          disabled={locked}
          error={Boolean(formik.touched.method && formik.errors.method)}
          helperText={formik.touched.method && formik.errors.method}
        >
          {data.allowedPayoutMethods.map((method) => (
            <MenuItem key={method} value={method}>
              {method}
            </MenuItem>
          ))}
        </TextField>
      </ShakingTextField>
      <ShakingTextField error={Boolean(formik.touched.reason && formik.errors.reason)}>
        <TextField
          fullWidth
          required
          size="small"
          multiline
          minRows={2}
          name="reason"
          label="Refund reason"
          value={formik.values.reason}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          disabled={locked}
          slotProps={{ htmlInput: { maxLength: 1000 } }}
          error={Boolean(formik.touched.reason && formik.errors.reason)}
          helperText={formik.touched.reason && formik.errors.reason}
        />
      </ShakingTextField>
    </Stack>
  );
}
