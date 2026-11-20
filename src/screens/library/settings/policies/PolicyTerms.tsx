import type { FormikProps } from 'formik';

import { GlobalIcons } from 'src/utils/icons';
import CustomSelect from 'src/components/custom-select';
import { Grid, Switch, FormControlLabel } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';

import { PolicyField } from './PolicyField';
import { PolicyDateMode } from './PolicyDateMode';

import type { PolicyValues } from './policy-form';

export function PolicyTerms({ formik }: { formik: FormikProps<PolicyValues> }) {
  return (
    <FormSectionCard
      title="Borrowing and Renewal Terms"
      icon={GlobalIcons.issueBook}
      descriptionTooltip="Manual policies require explicitly entered school dates. Automatic policies use saved durations and the Library calendar. A zero borrowing or reservation limit prevents that action."
    >
      <Grid container spacing={2}>
        <Grid size={12}>
          <PolicyDateMode formik={formik} />
        </Grid>
        {(
          [
            { name: 'maxBooksAtTime', label: 'Concurrent loan limit' },
            { name: 'reservationLimit', label: 'Reservation limit' },
            { name: 'maxRenewals', label: 'Renewal limit' },
          ] as const
        ).map((field) => (
          <Grid size={{ xs: 12, sm: 6 }} key={field.name}>
            <PolicyField formik={formik} {...field} numeric />
          </Grid>
        ))}
        {formik.values.dueDateMode === 1 && (
          <>
            {(
              [
                { name: 'loanDays', label: 'Loan duration (days)' },
                { name: 'renewalDays', label: 'Renewal duration (days)' },
                { name: 'pickupWindowDays', label: 'Hold pickup window (days)' },
              ] as const
            ).map((field) => (
              <Grid size={{ xs: 12, sm: 6 }} key={field.name}>
                <PolicyField formik={formik} {...field} numeric />
              </Grid>
            ))}
            <Grid size={12}>
              <ShakingTextField
                error={Boolean(formik.touched.dayCountingMode && formik.errors.dayCountingMode)}
              >
                <CustomSelect
                  label="Day counting"
                  required
                  value={formik.values.dayCountingMode}
                  options={[
                    { id: 0, name: 'Calendar days' },
                    { id: 1, name: 'Library open days' },
                  ]}
                  labelKey="name"
                  valueKey="id"
                  fullWidth
                  size="small"
                  disabled={formik.isSubmitting}
                  onChange={(value) => formik.setFieldValue('dayCountingMode', Number(value))}
                />
              </ShakingTextField>
            </Grid>
            <Grid size={12}>
              <FormControlLabel
                label="Move a due date on a closed day to the next open day"
                control={
                  <Switch
                    checked={formik.values.moveDueDateToNextOpenDay}
                    disabled={formik.isSubmitting}
                    onChange={(_, checked) =>
                      formik.setFieldValue('moveDueDateToNextOpenDay', checked)
                    }
                  />
                }
              />
            </Grid>
          </>
        )}
      </Grid>
    </FormSectionCard>
  );
}
