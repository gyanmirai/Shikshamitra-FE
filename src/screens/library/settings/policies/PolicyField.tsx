import type { FormikProps } from 'formik';

import dayjs from 'dayjs';
import { TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import type { PolicyValues } from './policy-form';

export function PolicyField({
  formik,
  name,
  label,
  numeric,
  date,
  required = true,
  helperText,
}: {
  formik: FormikProps<PolicyValues>;
  name: keyof PolicyValues;
  label: string;
  numeric?: boolean;
  date?: boolean;
  required?: boolean;
  helperText?: string;
}) {
  const error = Boolean(formik.touched[name] && formik.errors[name]);
  const shared = {
    name,
    label,
    required,
    fullWidth: true,
    size: 'small' as const,
    disabled: formik.isSubmitting,
    error,
    helperText: error ? String(formik.errors[name]) : helperText,
    onBlur: formik.handleBlur,
  };
  return (
    <ShakingTextField error={required && error}>
      {date ? (
        <DatePicker
          label={label}
          value={formik.values[name] ? dayjs(String(formik.values[name])) : null}
          disabled={formik.isSubmitting}
          onChange={(value) =>
            formik.setFieldValue(name, value?.isValid() ? value.format('YYYY-MM-DD') : '')
          }
          slotProps={{ textField: shared }}
        />
      ) : numeric ? (
        <NumericFormatCustom
          {...shared}
          value={String(formik.values[name])}
          decimalScale={0}
          allowNegative={false}
          onValueChange={(value, source) => {
            if (source.source === 'event') formik.setFieldValue(name, value.value);
          }}
        />
      ) : (
        <TextField {...shared} value={formik.values[name]} onChange={formik.handleChange} />
      )}
    </ShakingTextField>
  );
}
