import type { FormikProps } from 'formik';

import dayjs from 'dayjs';
import { Grid } from '@mui/material';
import { datePickerToDateTimeOffset } from 'src/utils/dateConvertor';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';

import type { CalendarDayFormValues } from '../types';

interface CalendarDayDateFieldsProps {
  formik: Pick<
    FormikProps<CalendarDayFormValues>,
    'values' | 'touched' | 'errors' | 'setFieldValue' | 'setFieldTouched'
  >;
  isVacation: boolean;
  calendarId: string;
  academicMediumId?: string;
}

export function CalendarDayDateFields({
  formik,
  isVacation,
  calendarId,
  academicMediumId,
}: CalendarDayDateFieldsProps) {
  if (isVacation) {
    const dateError = formik.touched.date ? formik.errors.date : undefined;
    const endDateError = formik.touched.endDate ? formik.errors.endDate : undefined;
    const rangeError = dateError || endDateError;

    return (
      <Grid size={{ xs: 12 }}>
        <CustomDateRangePicker
          required
          label="Vacation dates *"
          title="Select vacation dates"
          value={[
            formik.values.date ? dayjs(formik.values.date) : null,
            formik.values.endDate ? dayjs(formik.values.endDate) : null,
          ]}
          dateFormat="DD/MM/YYYY"
          error={Boolean(rangeError)}
          helperText={rangeError as string | undefined}
          onChange={([startDate, endDate]) => {
            formik.setFieldValue('date', datePickerToDateTimeOffset(startDate));
            formik.setFieldValue('endDate', datePickerToDateTimeOffset(endDate));
            formik.setFieldTouched('date', true, false);
            formik.setFieldTouched('endDate', true, false);
          }}
        />
      </Grid>
    );
  }

  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <DatePicker
        label="Date *"
        calendarId={calendarId}
        academicMediumId={academicMediumId}
        format="DD-MM-YYYY"
        value={formik.values.date ? dayjs(formik.values.date) : null}
        blockedDayTypes={[]}
        onChange={(value) => formik.setFieldValue('date', datePickerToDateTimeOffset(value))}
        slotProps={{
          textField: {
            fullWidth: true,
            size: 'small',
            error: formik.touched.date && Boolean(formik.errors.date),
            helperText: formik.touched.date && (formik.errors.date as string),
          },
        }}
      />
    </Grid>
  );
}
