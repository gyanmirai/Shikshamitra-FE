import type { FormikProps } from 'formik';
import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import { Grid, Alert, Checkbox, Typography, FormControlLabel } from '@mui/material';

import type { AdmissionOfferingFormValues } from './admission-offering-model';
import { ADMISSION_DATE_FORMAT } from './admission-date-formats';

type Props = {
  formik: FormikProps<AdmissionOfferingFormValues>;
  cycle: AdmissionCycle;
};

export function AdmissionOfferingWindowFields({ formik, cycle }: Props) {
  const minDate = dayjs(cycle.startDate);
  const maxDate = dayjs(cycle.endDate);
  const openError = formik.touched.openDate ? String(formik.errors.openDate ?? '') : '';
  const closeError = formik.touched.closeDate ? String(formik.errors.closeDate ?? '') : '';

  return (
    <Grid container spacing={1.5}>
      <Grid size={12}>
        <Typography variant="subtitle2">Admission window</Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={formik.values.useCycleDates}
              onChange={(_, checked) => {
                formik.setFieldValue('useCycleDates', checked);
                if (checked) {
                  formik.setFieldValue('openDate', null);
                  formik.setFieldValue('closeDate', null);
                }
              }}
            />
          }
          label="Use Admission Cycle dates"
        />
      </Grid>
      {formik.values.useCycleDates ? (
        <Grid size={12}>
          <Alert severity="info">
            Effective window: {minDate.format('DD MMM YYYY')} to {maxDate.format('DD MMM YYYY')}.
            Changes to the cycle window automatically apply to this offering.
          </Alert>
        </Grid>
      ) : (
        <>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DatePicker
              label="Applications open *"
              format={ADMISSION_DATE_FORMAT}
              value={formik.values.openDate}
              minDate={minDate}
              maxDate={maxDate}
              onChange={(value) => formik.setFieldValue('openDate', value)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  error: Boolean(openError),
                  helperText: openError || `From ${minDate.format('DD MMM YYYY')}`,
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DatePicker
              label="Applications close *"
              format={ADMISSION_DATE_FORMAT}
              value={formik.values.closeDate}
              minDate={formik.values.openDate ?? minDate}
              maxDate={maxDate}
              onChange={(value) => formik.setFieldValue('closeDate', value)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  error: Boolean(closeError),
                  helperText: closeError || `Up to ${maxDate.format('DD MMM YYYY')}`,
                },
              }}
            />
          </Grid>
        </>
      )}
    </Grid>
  );
}
