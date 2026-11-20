import type { FormikProps } from 'formik';

import { Grid, MenuItem, TextField } from '@mui/material';
import { PaymentMethod, PaymentMethodLabels } from 'src/enums/finance-payment-method';
import { paymentMethodsConfig } from 'src/screens/finance/FeeCollection/Components/paymentConfigMethods';

export type FinanceCollectionValues = {
  amount: string;
  paymentMethod: string;
  schoolReceiptDate: string;
  bankAccountId: string;
  notes: string;
  details: Record<string, string>;
};

type InstrumentField = {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  maxLength?: number;
};
export function financeInstrumentFields(method: string): InstrumentField[] {
  const label = PaymentMethodLabels[Number(method) as PaymentMethod];
  const fields = (paymentMethodsConfig as Record<string, InstrumentField[]>)[label] || [];
  return fields
    .filter((field) => field.name !== 'amount' && field.name !== 'bankAccount')
    .map((field) => ({
      ...field,
      name:
        method === String(PaymentMethod.UPI) && field.name === 'transactionId'
          ? 'upiTransactionId'
          : field.name,
      required:
        field.required || (method === String(PaymentMethod.CHEQUE) && field.name === 'chequeDate'),
    }));
}

export function FinancePaymentFields({
  formik,
  disabled,
  banks,
}: {
  formik: FormikProps<FinanceCollectionValues>;
  disabled: boolean;
  banks: { id: string; label: string }[];
}) {
  const nonCash =
    formik.values.paymentMethod !== '' &&
    formik.values.paymentMethod !== String(PaymentMethod.CASH);
  return (
    <Grid container spacing={1}>
      {nonCash && (
        <Grid size={{ xs: 12 }}>
          <TextField
            select
            label="Receiving school bank"
            required
            fullWidth
            size="small"
            name="bankAccountId"
            value={formik.values.bankAccountId}
            onChange={formik.handleChange}
            disabled={disabled}
            error={Boolean(formik.touched.bankAccountId && formik.errors.bankAccountId)}
            helperText={formik.touched.bankAccountId && formik.errors.bankAccountId}
          >
            {banks.map((bank) => (
              <MenuItem key={bank.id} value={bank.id}>
                {bank.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      )}
      {nonCash &&
        financeInstrumentFields(formik.values.paymentMethod).map((field) => (
          <Grid size={{ xs: 12, sm: 6 }} key={field.name}>
            <TextField
              label={field.label}
              name={`details.${field.name}`}
              required={field.required}
              fullWidth
              size="small"
              type={field.type === 'date' ? 'date' : 'text'}
              value={formik.values.details[field.name] || ''}
              slotProps={{
                inputLabel: field.type === 'date' ? { shrink: true } : undefined,
                htmlInput: { maxLength: field.maxLength },
              }}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={disabled}
            />
          </Grid>
        ))}
    </Grid>
  );
}
