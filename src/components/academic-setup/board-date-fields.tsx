import type { Dayjs } from 'dayjs';
import type { FormikProps } from 'formik';

import { Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';

import ShakingTextField from '../shaking-text-field';

import type { BoardFormValues } from './board-form-model';

export const BoardDateFields = ({
  formik,
  yearStart,
  yearEnd,
}: {
  formik: FormikProps<BoardFormValues>;
  yearStart: Dayjs | null;
  yearEnd: Dayjs | null;
}) => (
  <Grid container spacing={2}>
    <Grid size={{ xs: 12, sm: 6 }}>
      <ShakingTextField error={formik.touched.startDate && Boolean(formik.errors.startDate)}>
        <DatePicker
          label="Start date"
          value={formik.values.startDate}
          minDate={yearStart ?? undefined}
          maxDate={yearEnd ?? undefined}
          format="DD-MMM-YYYY"
          onChange={(value) => {
            formik.setFieldValue('startDate', value);
            if (formik.values.endDate) formik.setFieldTouched('endDate', true, false);
          }}
          slotProps={{
            textField: {
              name: 'startDate',
              required: true,
              fullWidth: true,
              size: 'small',
              helperText: formik.touched.startDate && (formik.errors.startDate as string),
              error: formik.touched.startDate && Boolean(formik.errors.startDate),
            },
          }}
        />
      </ShakingTextField>
    </Grid>
    <Grid size={{ xs: 12, sm: 6 }}>
      <ShakingTextField error={formik.touched.endDate && Boolean(formik.errors.endDate)}>
        <DatePicker
          label="End date"
          value={formik.values.endDate}
          format="DD-MMM-YYYY"
          minDate={formik.values.startDate ?? yearStart ?? undefined}
          maxDate={yearEnd ?? undefined}
          onChange={(value) => formik.setFieldValue('endDate', value)}
          slotProps={{
            textField: {
              name: 'endDate',
              required: true,
              fullWidth: true,
              size: 'small',
              helperText: formik.touched.endDate && (formik.errors.endDate as string),
              error: formik.touched.endDate && Boolean(formik.errors.endDate),
            },
          }}
        />
      </ShakingTextField>
    </Grid>
  </Grid>
);
