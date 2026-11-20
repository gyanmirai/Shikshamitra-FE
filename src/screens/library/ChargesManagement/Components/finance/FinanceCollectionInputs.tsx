import type { FormikProps } from 'formik';

import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import { Grid, MenuItem, TextField } from '@mui/material';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { PaymentMethod, PaymentMethodLabels } from 'src/enums/finance-payment-method';

import type { FinanceCollectionValues } from './FinancePaymentFields';

export function FinanceCollectionInputs({
  formik,
  disabled,
  paymentMethods,
}: {
  formik: FormikProps<FinanceCollectionValues>;
  disabled: boolean;
  paymentMethods: number[];
}) {
  return (
    <Grid container spacing={1}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <NumericFormatCustom
          fullWidth
          size="small"
          required
          label="Amount to collect"
          name="amount"
          value={formik.values.amount}
          roundToWholeRupees={false}
          decimalScale={2}
          onValueChange={(value) => formik.setFieldValue('amount', value.value)}
          disabled={disabled}
          error={Boolean(formik.touched.amount && formik.errors.amount)}
          helperText={formik.touched.amount && formik.errors.amount}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          select
          required
          size="small"
          label="Payment method"
          name="paymentMethod"
          value={formik.values.paymentMethod}
          disabled={disabled}
          onChange={(event) => {
            formik.setFieldValue('paymentMethod', event.target.value);
            formik.setFieldValue('details', {});
            formik.setFieldValue('bankAccountId', '');
          }}
          error={Boolean(formik.touched.paymentMethod && formik.errors.paymentMethod)}
          helperText={formik.touched.paymentMethod && formik.errors.paymentMethod}
        >
          {paymentMethods
            .filter((method) => method in PaymentMethodLabels)
            .map((method) => (
              <MenuItem key={method} value={String(method)}>
                {PaymentMethodLabels[method as PaymentMethod]}
              </MenuItem>
            ))}
        </TextField>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DatePicker
          label="School receipt date"
          value={formik.values.schoolReceiptDate ? dayjs(formik.values.schoolReceiptDate) : null}
          disabled={disabled}
          onChange={(date) =>
            formik.setFieldValue(
              'schoolReceiptDate',
              date?.isValid() ? date.format('YYYY-MM-DD') : ''
            )
          }
          slotProps={{
            textField: {
              size: 'small',
              fullWidth: true,
              required: true,
              error: Boolean(formik.touched.schoolReceiptDate && formik.errors.schoolReceiptDate),
              helperText: formik.touched.schoolReceiptDate && formik.errors.schoolReceiptDate,
            },
          }}
        />
      </Grid>
    </Grid>
  );
}
