import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import dayjs from 'dayjs';
import { Grid } from '@mui/material';
import { useRef, useState, useEffect } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import ShakingTextField from 'src/components/shaking-text-field';
import DatePickerCalendarHeader from 'src/components/date-picker-calendar-header';

import { getMinimumClosingDate } from './cycle-date-limits';
import { ADMISSION_DATE_FORMAT } from '../admission-date-formats';

export function CycleDateField({
  name,
  value,
  onChange,
  minimumDate,
  error,
  disabled,
}: {
  name: 'startDate' | 'endDate';
  value: string;
  onChange: (value: string) => void;
  minimumDate?: string;
  error?: string;
  disabled?: boolean;
}) {
  const [draftDate, setDraftDate] = useState(() => (value ? dayjs(value) : null));
  const lastEmittedValue = useRef(value);
  useEffect(() => {
    if (value === lastEmittedValue.current) return;
    lastEmittedValue.current = value;
    setDraftDate(value ? dayjs(value) : null);
  }, [value]);

  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <ShakingTextField error={Boolean(error)}>
        <DatePicker
          label={name === 'startDate' ? 'Applications open' : 'Applications close'}
          format={ADMISSION_DATE_FORMAT}
          views={['year', 'month', 'day']}
          openTo="day"
          slots={{ calendarHeader: DatePickerCalendarHeader }}
          minDate={minimumDate ? dayjs(minimumDate) : undefined}
          disabled={disabled}
          value={draftDate}
          onChange={(date) => {
            setDraftDate(date);
            const serialized = date?.format('YYYY-MM-DD') ?? '';
            lastEmittedValue.current = serialized;
            onChange(serialized);
          }}
          slotProps={{
            textField: {
              fullWidth: true,
              size: 'small',
              required: true,
              name,
              error: Boolean(error),
              helperText: error,
            },
          }}
        />
      </ShakingTextField>
    </Grid>
  );
}

export function CycleDateFields({
  formik,
  minimumDate,
  disabled,
}: {
  formik: FormikProps<CreateUpdateAdmissionCycle>;
  minimumDate?: string;
  disabled?: boolean;
}) {
  return (['startDate', 'endDate'] as const).map((name) => (
    <CycleDateField
      key={name}
      name={name}
      value={formik.values[name]}
      minimumDate={
        name === 'startDate'
          ? minimumDate
          : getMinimumClosingDate(formik.values.startDate, minimumDate)
      }
      error={formik.touched[name] ? formik.errors[name] : undefined}
      disabled={disabled}
      onChange={(value) => {
        formik.setFieldTouched(name, true, false);
        formik.setFieldValue(name, value);
      }}
    />
  ));
}
