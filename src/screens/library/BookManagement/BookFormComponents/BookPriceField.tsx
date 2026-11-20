import type { FormikProps } from 'formik';

import { Grid } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import type { BookFormValues } from '../Components/type';

export function BookPriceField({
  formik,
  disabled,
}: {
  formik: FormikProps<BookFormValues>;
  disabled: boolean;
}) {
  const error = Boolean((formik.touched.price || formik.submitCount > 0) && formik.errors.price);
  const historic = Boolean(formik.initialValues.id && formik.initialValues.price.startsWith('-'));
  return (
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <ShakingTextField error={error}>
        <NumericFormatCustom
          id="catalogue-price"
          name="price"
          label="Price per book"
          fullWidth
          size="small"
          value={formik.values.price}
          disabled={disabled}
          prefix=""
          allowNegative
          valueIsNumericString
          roundToWholeRupees={false}
          // Keep pasted subcent drafts intact; final validation rejects them without rounding.
          isAllowed={({ value }) => value.split('.')[0].replace(/^0+/, '').length <= 16}
          onValueChange={({ value }, source) => {
            if (source.source === 'event') formik.setFieldValue('price', value);
          }}
          onBlur={formik.handleBlur}
          error={error}
          helperText={
            error
              ? formik.errors.price
              : historic
                ? 'Keep the saved negative price unchanged, enter a nonnegative price, or leave blank for Unknown.'
                : 'Blank means Unknown. Acquisition cost is recorded in Stock Receiving.'
          }
        />
      </ShakingTextField>
    </Grid>
  );
}
