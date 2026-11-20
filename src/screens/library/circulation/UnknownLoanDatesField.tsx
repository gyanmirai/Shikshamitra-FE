import type { FormikProps } from 'formik';

import { TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

import type { ReturnValues } from './return-form';

export function UnknownLoanDatesField({
  formik,
  disabled,
}: {
  formik: FormikProps<ReturnValues>;
  disabled: boolean;
}) {
  const error = Boolean(
    formik.touched.unknownOriginalDatesReason && formik.errors.unknownOriginalDatesReason
  );
  return (
    <ShakingTextField error={error}>
      <TextField
        label="Return with unconfirmed original dates: reason"
        name="unknownOriginalDatesReason"
        required
        fullWidth
        size="small"
        multiline
        minRows={2}
        disabled={disabled}
        value={formik.values.unknownOriginalDatesReason || ''}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        inputProps={{ maxLength: 500 }}
        error={error}
        helperText={
          error
            ? formik.errors.unknownOriginalDatesReason
            : 'Explain how the physical return was verified. This does not confirm or replace the original dates.'
        }
      />
    </ShakingTextField>
  );
}
