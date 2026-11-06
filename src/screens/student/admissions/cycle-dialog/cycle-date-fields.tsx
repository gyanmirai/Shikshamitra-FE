import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import dayjs from 'dayjs';
import { Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import ShakingTextField from 'src/components/shaking-text-field';

import { ADMISSION_DATE_FORMAT } from '../admission-date-formats';

export function CycleDateFields({ formik }: { formik: FormikProps<CreateUpdateAdmissionCycle> }) {
  return (
    <>
      <Grid size={{ xs: 12, sm: 6 }}>
        <ShakingTextField error={Boolean(formik.touched.startDate && formik.errors.startDate)}>
          <DatePicker
            label="Applications open"
            format={ADMISSION_DATE_FORMAT}
            value={formik.values.startDate ? dayjs(formik.values.startDate) : null}
            onChange={async (value) => {
              await formik.setFieldTouched('startDate', true, false);
              await formik.setFieldValue(
                'startDate',
                value?.isValid() ? value.format('YYYY-MM-DD') : '',
                true
              );
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                required: true,
                name: 'startDate',
                error: Boolean(formik.touched.startDate && formik.errors.startDate),
                helperText: formik.touched.startDate ? formik.errors.startDate : undefined,
              },
            }}
          />
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <ShakingTextField error={Boolean(formik.touched.endDate && formik.errors.endDate)}>
          <DatePicker
            label="Applications close"
            format={ADMISSION_DATE_FORMAT}
            value={formik.values.endDate ? dayjs(formik.values.endDate) : null}
            onChange={async (value) => {
              await formik.setFieldTouched('endDate', true, false);
              await formik.setFieldValue(
                'endDate',
                value?.isValid() ? value.format('YYYY-MM-DD') : '',
                true
              );
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                required: true,
                name: 'endDate',
                error: Boolean(formik.touched.endDate && formik.errors.endDate),
                helperText: formik.touched.endDate ? formik.errors.endDate : undefined,
              },
            }}
          />
        </ShakingTextField>
      </Grid>
    </>
  );
}
