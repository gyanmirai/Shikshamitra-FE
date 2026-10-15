import type { FormikProps } from 'formik';

import dayjs from 'dayjs';
import { Stack } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import DatePickerCalendarHeader from '../date-picker-calendar-header';

import type { AcademicYearFormValues } from './academic-year-form-model';

export const AcademicYearDateFields = ({
  formik,
}: {
  formik: FormikProps<AcademicYearFormValues>;
}) => (
  <Stack spacing={2}>
    {(['startDate', 'endDate'] as const).map((name) => (
      <DatePicker
        key={name}
        label={name === 'startDate' ? 'Start date' : 'End date'}
        value={formik.values[name]}
        format="DD-MMM-YYYY"
        views={['year', 'month', 'day']}
        openTo="day"
        slots={{ calendarHeader: DatePickerCalendarHeader }}
        minDate={name === 'endDate' ? dayjs(formik.values.startDate).add(1, 'day') : undefined}
        onChange={(value) => formik.setFieldValue(name, value)}
        slotProps={{
          textField: {
            fullWidth: true,
            size: 'small',
            error: formik.touched[name] && Boolean(formik.errors[name]),
            helperText:
              formik.touched[name] && typeof formik.errors[name] === 'string'
                ? formik.errors[name]
                : undefined,
          },
        }}
      />
    ))}
  </Stack>
);
