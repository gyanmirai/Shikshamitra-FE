import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import React, { memo } from 'react';
import { useFormikContext } from 'formik';
import { useSelector } from 'react-redux';
import { DateTimePicker } from '@mui/x-date-pickers';
import ShakingTextField from 'src/components/shaking-text-field';
import { Grid, Checkbox, TextField, FormControlLabel } from '@mui/material';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import type { ISchoolWiseAnnouncementFormValues } from '../../type';

const SchedulingSection = () => {
  const { values, errors, touched, setFieldValue, setFieldTouched } =
    useFormikContext<ISchoolWiseAnnouncementFormValues>();
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const calculateDuration = (
    start: dayjs.Dayjs | null,
    end: dayjs.Dayjs | null,
    field: 'startDate' | 'endDate'
  ) => {
    if (!start || !end) return;

    const diffInHours = end.diff(start, 'hour');
    const diffInDays = end.diff(start, 'day');

    if (diffInHours >= 24) {
      setFieldValue('durationUnit', 'days');
      setFieldValue('duration', Math.max(0, diffInDays));
    } else {
      setFieldValue('durationUnit', 'hours');
      setFieldValue('duration', Math.max(0, diffInHours));
    }
  };

  return (
    <SectionCard title="Scheduling">
      {/* Start Date */}
      <Grid size={{ xs: 12, md: 6 }}>
        <ShakingTextField error={!!(touched.startDate && errors.startDate)}>
          <DateTimePicker
            label="Start Date-Time *"
            format="DD/MM/YYYY hh:mm"
            value={values.startDate}
            onChange={(newValue) => {
              setFieldValue('startDate', newValue);
              setFieldTouched('startDate', false);
              if (newValue && values.endDate) {
                calculateDuration(dayjs(newValue), dayjs(values.endDate), 'startDate');
              }
            }}
            minDate={dayjs(currentYear?.startDate)}
            maxDate={dayjs(currentYear?.endDate)}
            sx={{ minWidth: 180, width: '100%' }}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                error: !!(touched.startDate && errors.startDate),
                helperText: touched.startDate && (errors.startDate as string),
              },
            }}
          />
        </ShakingTextField>
      </Grid>

      {/* End Date */}
      <Grid size={{ xs: 12, md: 6 }}>
        <ShakingTextField error={!!(touched.endDate && errors.endDate)}>
          <DateTimePicker
            label="End Date-Time *"
            format="DD/MM/YYYY hh:mm"
            minDate={dayjs(currentYear?.startDate)}
            maxDate={dayjs(currentYear?.endDate)}
            value={values.endDate}
            onChange={(newValue) => {
              setFieldValue('endDate', newValue);
              setFieldTouched('endDate', false);
              if (newValue && values.startDate) {
                calculateDuration(dayjs(values.startDate), dayjs(newValue), 'endDate');
              }
            }}
            sx={{ minWidth: 180, width: '100%' }}
            slotProps={{
              textField: {
                size: 'small',
                error: !!(touched.endDate && errors.endDate),
                helperText: touched.endDate && (errors.endDate as string),
              },
            }}
          />
        </ShakingTextField>
      </Grid>

      {/* Duration (Read Only) */}
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label={
            values.duration
              ? `Duration (in ${values.durationUnit === 'days' ? 'days' : 'hours'}) *`
              : 'Duration *'
          }
          name="duration"
          type="number"
          value={values.duration}
          disabled
          InputProps={{
            inputProps: { min: 0 },
          }}
          error={touched.duration && Boolean(errors.duration)}
          helperText={touched.duration && errors.duration}
          size="small"
        />
      </Grid>

      {/* Acknowledgement Checkbox */}
      {(values.notification_preferences.includes('In-App') ||
        values.notification_preferences.includes('inApp')) && (
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={values.isAllowAcknoledgement}
                onChange={(e) => setFieldValue('isAllowAcknoledgement', e.target.checked)}
              />
            }
            label="Allow Acknowledgement? (checkbox → recipients click “I’ve read this”)"
          />
        </Grid>
      )}
    </SectionCard>
  );
};

/**
 * Memoization Justification:
 * Isolates DatePicker re-renders. Date pickers are expensive to re-render.
 */
export default memo(SchedulingSection);
