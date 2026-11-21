import type { FormikProps } from 'formik';

import { getIn } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Grid, Stack, Typography } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import type { BorrowingRulesValues } from './borrowing-rules';

export function BorrowingRulesTable({
  formik,
  disabled,
}: {
  formik: FormikProps<BorrowingRulesValues>;
  disabled: boolean;
}) {
  return (
    <Stack spacing={2}>
      {formik.values.rules.map((rule, index) => (
        <FormSectionCard
          key={rule.role}
          title={`${rule.name} Limits`}
          icon={GlobalIcons.assigned}
          descriptionTooltip={`Maximum concurrent loans and reservations for ${rule.name.toLowerCase()} members. Zero prevents the corresponding action.`}
        >
          <Grid container spacing={2}>
            {(
              [
                { field: 'maxBooksAtTime', label: 'Borrow limit at a time' },
                { field: 'reservationLimit', label: 'Reservation limit at a time' },
              ] as const
            ).map(({ field, label }) => {
              const path = `rules.${index}.${field}`;
              const error = Boolean(getIn(formik.touched, path) && getIn(formik.errors, path));
              return (
                <Grid size={{ xs: 12, sm: 6 }} key={field}>
                  <ShakingTextField error={error}>
                    <NumericFormatCustom
                      name={path}
                      label={label}
                      required
                      fullWidth
                      size="small"
                      value={rule[field]}
                      prefix=""
                      decimalScale={0}
                      roundToWholeRupees={false}
                      disabled={disabled || formik.isSubmitting}
                      error={error}
                      helperText={error ? getIn(formik.errors, path) : 'Whole number from 0 to 99.'}
                      onBlur={formik.handleBlur}
                      onValueChange={(values, source) => {
                        if (source.source === 'event') formik.setFieldValue(path, values.value);
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              );
            })}
          </Grid>
        </FormSectionCard>
      ))}
      {disabled && (
        <Typography variant="body2" color="text.secondary">
          You can view these limits. Saving requires borrowing-rule permission.
        </Typography>
      )}
    </Stack>
  );
}
