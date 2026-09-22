import type { FormikProps } from 'formik';
import type { AssessmentSessionInput } from 'src/redux/student/admissions/admission-assessment-types';

import dayjs from 'dayjs';
import { Grid, TextField } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import { ADMISSION_DATE_TIME_FORMAT } from '../admission-date-formats';

type Props = { formik: FormikProps<AssessmentSessionInput>; disabled: boolean };

export function AssessmentSessionFields({ formik, disabled }: Props) {
  const feedback = (key: keyof AssessmentSessionInput) => ({
    error: Boolean(formik.touched[key] && formik.errors[key]),
    helperText: formik.touched[key] ? formik.errors[key] : undefined,
  });
  return (
    <Grid container spacing={2}>
      {(['name', 'location'] as const).map((key) => (
        <Grid key={key} size={12}>
          <TextField
            fullWidth
            required
            size="small"
            label={key === 'name' ? 'Session name' : 'Location'}
            disabled={disabled}
            {...formik.getFieldProps(key)}
            {...feedback(key)}
          />
        </Grid>
      ))}
      {(['startsAt', 'endsAt'] as const).map((key) => (
        <Grid key={key} size={{ xs: 12, sm: 6 }}>
          <DateTimePicker
            label={key === 'startsAt' ? 'Starts at' : 'Ends at'}
            format={ADMISSION_DATE_TIME_FORMAT}
            disabled={disabled}
            value={formik.values[key] ? dayjs(formik.values[key]) : null}
            onChange={(value) => {
              formik.setFieldTouched(key, true, false);
              formik.setFieldValue(key, value?.isValid() ? value.toISOString() : '');
            }}
            slotProps={{
              textField: { fullWidth: true, required: true, size: 'small', ...feedback(key) },
            }}
          />
        </Grid>
      ))}
      <Grid size={{ xs: 12, sm: 6 }}>
        <NumericFormatCustom
          fullWidth
          required
          size="small"
          label="Capacity"
          prefix=""
          decimalScale={0}
          disabled={disabled}
          value={formik.values.capacity}
          name="capacity"
          onBlur={formik.handleBlur}
          onValueChange={({ floatValue }) => formik.setFieldValue('capacity', floatValue ?? '')}
          {...feedback('capacity')}
        />
      </Grid>
    </Grid>
  );
}
