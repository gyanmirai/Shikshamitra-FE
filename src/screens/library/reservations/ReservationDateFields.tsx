import { Grid } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';

import type { ReservationFieldState } from './reservation-form';

export function ReservationDateFields({
  formik,
  requiresExpiry,
  disabled,
}: {
  formik: ReservationFieldState;
  requiresExpiry: boolean;
  disabled: boolean;
}) {
  return (
    <FormSectionCard
      title="Request Dates"
      icon={GlobalIcons.calendar}
      descriptionTooltip="Enter school calendar dates. Policy preview determines whether an explicit request expiry is required. Pickup deadlines belong to actual allocated holds."
    >
      <Grid container spacing={2}>
        {(['requestedDate', 'requestExpiryDate'] as const).map((name) => {
          const required = name === 'requestedDate' || requiresExpiry;
          const error = formik.touched[name] ? formik.errors[name] : undefined;
          return (
            <Grid key={name} size={{ xs: 12, sm: 6 }}>
              <ShakingTextField error={Boolean(error)}>
                <DatePicker
                  label={name === 'requestedDate' ? 'Requested date' : 'Request expiry date'}
                  value={formik.values[name]}
                  format="DD-MM-YYYY"
                  disabled={disabled}
                  onChange={(value) => formik.setFieldValue(name, value)}
                  slotProps={{
                    textField: {
                      name,
                      required,
                      size: 'small',
                      fullWidth: true,
                      error: Boolean(error),
                      onBlur: () => formik.setFieldTouched(name, true),
                      helperText:
                        error ||
                        (name === 'requestExpiryDate'
                          ? 'This request expiry is separate from an allocated copy’s pickup deadline.'
                          : undefined),
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>
          );
        })}
      </Grid>
    </FormSectionCard>
  );
}
