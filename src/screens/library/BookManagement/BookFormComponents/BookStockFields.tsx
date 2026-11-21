import type { FormikProps } from 'formik';

import { Grid } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import { BookPriceField } from './BookPriceField';
import { resizeDraftCopies } from './book-form-model';

import type { BookFormValues } from '../Components/type';

export function BookStockFields({
  formik,
  disabled,
}: {
  formik: FormikProps<BookFormValues>;
  disabled: boolean;
}) {
  return (
    <Grid container spacing={2}>
      {(
        [
          { name: 'numberOfCopies', label: 'Number of copies', decimals: 0, required: true },
          { name: 'numberOfPages', label: 'Number of pages', decimals: 0, required: false },
        ] as const
      ).map(({ name, label, decimals, required }) => {
        const error = Boolean(formik.touched[name] && formik.errors[name]);
        const countLocked = name === 'numberOfCopies' && Boolean(formik.values.id);
        return (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={name}>
            <ShakingTextField error={error}>
              <NumericFormatCustom
                name={name}
                label={label}
                required={required}
                fullWidth
                size="small"
                value={formik.values[name]}
                disabled={disabled || countLocked}
                decimalScale={decimals}
                prefix=""
                roundToWholeRupees={false}
                onBlur={formik.handleBlur}
                error={error}
                helperText={
                  error
                    ? formik.errors[name]
                    : countLocked
                      ? 'Add or remove rows in Manage Copies.'
                      : undefined
                }
                onValueChange={(values, source) => {
                  if (source.source !== 'event') return;
                  formik.setFieldValue(name, values.value);
                  if (name === 'numberOfCopies')
                    formik.setFieldValue(
                      'copies',
                      resizeDraftCopies(formik.values.copies, Number(values.value))
                    );
                }}
              />
            </ShakingTextField>
          </Grid>
        );
      })}
      <BookPriceField formik={formik} disabled={disabled} />
    </Grid>
  );
}
