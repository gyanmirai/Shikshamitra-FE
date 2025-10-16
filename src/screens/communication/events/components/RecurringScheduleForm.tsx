import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Box,
  Grid,
  Radio,
  Button,
  TextField,
  Typography,
  DialogActions,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

interface RecurringScheduleFormProps {
  initialValues: any;
  onSubmit: (values: any) => void;
  onClose: (e: any, isSubmit: boolean) => void;
}

const getValidationSchema = (currentYear: any) =>
  Yup.object({
    type: Yup.string().required(),
    isRecurring: Yup.boolean(),

    repeatFrequency: Yup.string().required('Repeat frequency is required'),

    meetingDate: Yup.mixed().when('repeatFrequency', {
      is: (val: string) => val === 'Monthly',
      then: (schema) =>
        schema
          .required('Meeting date is required')
          .test('is-valid-dayjs', 'Meeting date must be valid', (value) =>
            value ? dayjs(value as any).isValid() : false
          ),
      otherwise: (schema) => schema.nullable(),
    }),

    meetingTime: Yup.mixed().when('repeatFrequency', {
      is: (val: string) => ['Daily', 'Weekly', 'Custom', 'Monthly'].includes(val),
      then: (schema) => schema.required('Meeting time is required'),
      otherwise: (schema) => schema.nullable(),
    }),
    startDate: Yup.mixed()
      .required('Start Date is required')
      .test(
        'is-valid-dayjs',
        'Start Date must be a valid date',
        (value) => value && dayjs(value as Dayjs).isValid()
      )
      .test(
        'min-date',
        (value) =>
          `Start Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as Dayjs).isSameOrAfter(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        (value) =>
          `Start Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as Dayjs).isSameOrBefore(dayjs(currentYear.endDate), 'day')
      ),
    repeatUntil: Yup.mixed()
      .required('Last Date is required')
      .test(
        'is-valid-dayjs',
        'Last Date must be a valid date',
        (value) => value && dayjs(value as Dayjs).isValid()
      )
      .test('is-after-start-date', 'Last Date cannot be before Start Date', function (value) {
        const { startDate } = this.parent;
        if (!value || !startDate) return true;
        return dayjs(value as Dayjs).isSameOrAfter(dayjs(startDate), 'day');
      })
      .test(
        'min-date',
        (value) =>
          `Last Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as Dayjs).isSameOrAfter(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        (value) =>
          `Last Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as Dayjs).isSameOrBefore(dayjs(currentYear.endDate), 'day')
      ),

    // ✅ Weekly specific: at least one day required
    customDays: Yup.array().when('repeatFrequency', {
      is: (val: string) => val === 'Weekly',
      then: (schema) =>
        schema
          .of(
            Yup.string().oneOf([
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
              'Sunday',
            ])
          )
          .min(1, 'At least one day must be selected')
          .required('At least one day must be selected'),
      otherwise: (schema) => schema.nullable(),
    }),

    // ✅ Custom interval fields
    customInterval: Yup.string().when('repeatFrequency', {
      is: (val: string) => val === 'Custom',
      then: (schema) =>
        schema
          .oneOf(['days', 'weeks', 'months'], 'Invalid interval type')
          .required('Repeat Every is required'),
      otherwise: (schema) => schema.nullable(),
    }),

    customIntervalCount: Yup.number().when('repeatFrequency', {
      is: (val: string) => val === 'Custom',
      then: (schema) =>
        schema
          .typeError('Interval must be a number')
          .required('Interval count is required')
          .min(1, 'Interval must be at least 1'),
      otherwise: (schema) => schema.nullable(),
    }),

    // ✅ For "Custom" weekly → must select days
    customDaysForCustom: Yup.array().when(['repeatFrequency', 'customInterval'], {
      is: (repeatFrequency: string, customInterval: string) =>
        repeatFrequency === 'Custom' && customInterval === 'weeks',
      then: (schema) =>
        schema
          .of(
            Yup.string().oneOf([
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
              'Sunday',
            ])
          )
          .min(1, 'At least one day must be selected')
          .required('At least one day must be selected'),
      otherwise: (schema) => schema.nullable(),
    }),

    monthlyOption: Yup.string().when(['repeatFrequency', 'customInterval'], {
      is: (repeatFrequency: string, customInterval: string) =>
        repeatFrequency === 'Custom' && customInterval === 'months',
      then: (schema) => schema.required('Monthly option is required'),
      otherwise: (schema) => schema.nullable(),
    }),
    onDay: Yup.number()
      .nullable()
      .transform((value, originalValue) => (originalValue === '' ? null : value))
      .when(['repeatFrequency', 'monthlyOption'], {
        is: (repeatFrequency: string, monthlyOption: string) =>
          repeatFrequency === 'Monthly' && monthlyOption === 'onDay',
        then: (schema) =>
          schema
            .required('Day of month is required')
            .min(1, 'Day must be at least 1')
            .max(31, 'Day cannot exceed 31'),
        otherwise: (schema) => schema.nullable(),
      }),

    onTheWeek: Yup.string().when(['repeatFrequency', 'monthlyOption'], {
      is: (repeatFrequency: string, customInterval: string, monthlyOption: string) =>
        repeatFrequency === 'Custom' && customInterval === 'months' && monthlyOption === 'onThe',
      then: (schema) =>
        schema
          .oneOf(['First', 'Second', 'Third', 'Fourth', 'Last'])
          .required('Week position is required'),
      otherwise: (schema) => schema.nullable(),
    }),

    onTheDay: Yup.string().when(['repeatFrequency', 'customInterval', 'monthlyOption'], {
      is: (repeatFrequency: string, customInterval: string, monthlyOption: string) =>
        repeatFrequency === 'Custom' && customInterval === 'months' && monthlyOption === 'onThe',
      then: (schema) =>
        schema
          .oneOf(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
          .required('Day of week is required'),
      otherwise: (schema) => schema.nullable(),
    }),
  });

const RecurringScheduleForm: React.FC<RecurringScheduleFormProps> = ({
  initialValues,
  onSubmit,
  onClose,
}) => {
  const theme = useTheme();
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const formik = useFormik({
    initialValues: {
      repeatFrequency: initialValues?.repeatFrequency || 'Daily',
      meetingDate: initialValues?.meetingDate || dayjs(),
      meetingTime: initialValues?.meetingTime || null,
      startDate: initialValues?.startDate || null,
      repeatUntil: initialValues?.repeatUntil || null,
      customInterval: initialValues?.customInterval || '',
      customIntervalCount: initialValues?.customIntervalCount ?? 1,
      customDays: initialValues?.customDays || [],
      monthlyOption: initialValues?.monthlyOption || 'onDay',
      day: initialValues?.day || '',
      onDay:
        initialValues?.onDay ??
        (initialValues?.meetingDate ? dayjs(initialValues.meetingDate).date() : dayjs().date()),
      onTheWeek: initialValues?.onTheWeek || 'First',
      onTheDay: initialValues?.onTheDay || 'Monday',
    },
    validationSchema: getValidationSchema(currentYear),
    onSubmit: (values) => onSubmit(values),
  });

  useEffect(() => {
    formik.resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.repeatFrequency, formik.values.customInterval]);

  const renderRecurringFields = () => {
    switch (formik.values.repeatFrequency) {
      case 'Daily':
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={!!(formik.touched.meetingTime && formik.errors.meetingTime)}>
                <TimePicker
                  label="Meeting Time *"
                  format="HH:mm"
                  name="meetingTime"
                  value={formik.values.meetingTime}
                  onChange={(newValue) => formik.setFieldValue('meetingTime', newValue)}
                  views={['hours', 'minutes']}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      error: formik.touched.meetingTime && Boolean(formik.errors.meetingTime),
                      helperText:
                        formik.touched.meetingTime && (formik.errors.meetingTime as string),
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={!!(formik.touched.repeatUntil && formik.errors.repeatUntil)}>
                <DatePicker
                  label="Last Date *"
                  name="repeatUntil"
                  format="DD/MM/YYYY"
                  value={formik.values.repeatUntil}
                  onChange={(newValue) => formik.setFieldValue('repeatUntil', newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      error: formik.touched.repeatUntil && Boolean(formik.errors.repeatUntil),
                      helperText:
                        formik.touched.repeatUntil && (formik.errors.repeatUntil as string),
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>
          </Grid>
        );

      case 'Weekly':
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <ShakingTextField
                error={!!(formik.touched.startDate && formik.errors.startDate) || false}
              >
                <DatePicker
                  label="Start Date *"
                  format="DD/MM/YYYY"
                  value={dayjs(formik.values.startDate)}
                  onChange={(newValue) => {
                    formik.setFieldValue('startDate', newValue);
                  }}
                  minDate={dayjs(currentYear?.startDate)}
                  maxDate={dayjs(currentYear?.endDate)}
                  sx={{ minWidth: 180, width: '100%' }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      error: !!(formik.touched.startDate && formik.errors.startDate) || false,
                      helperText:
                        formik.touched.startDate && formik.errors.startDate
                          ? String(formik.errors.startDate)
                          : undefined,
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <ShakingTextField error={!!(formik.touched.day && formik.errors.day)}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: 2,
                  }}
                >
                  {[
                    { short: 'S', value: 'Sunday' },
                    { short: 'M', value: 'Monday' },
                    { short: 'T', value: 'Tuesday' },
                    { short: 'W', value: 'Wednesday' },
                    { short: 'T', value: 'Thursday' },
                    { short: 'F', value: 'Friday' },
                    { short: 'S', value: 'Saturday' },
                  ].map((day, idx) => {
                    const isSelected = formik.values.customDays?.includes(day.value);
                    return (
                      <Box
                        key={idx}
                        onClick={() => {
                          const newValue = isSelected
                            ? formik.values.customDays.filter((d: any) => d !== day.value)
                            : [...(formik.values.customDays || []), day.value];
                          formik.setFieldValue('customDays', newValue);
                        }}
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          bgcolor: isSelected ? theme.palette.primary.main : 'transparent',
                          color: isSelected ? '#fff' : 'black',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Typography variant="body2" fontWeight={500}>
                          {day.short}
                        </Typography>
                      </Box>
                    );
                  })}
                  {formik.touched.customDays && formik.errors.customDays && (
                    <FormHelperText
                      error
                      sx={{
                        fontSize: '10px !important',
                        marginBottom: 8,
                        marginLeft: ' 10px !important',
                        bottom: 0,
                      }}
                    >
                      {String(formik.errors.customDays)}
                    </FormHelperText>
                  )}
                </Box>
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={!!(formik.touched.meetingTime && formik.errors.meetingTime)}>
                <TimePicker
                  label="Meeting Time *"
                  format="HH:mm"
                  name="meetingTime"
                  value={formik.values.meetingTime}
                  onChange={(newValue) => formik.setFieldValue('meetingTime', newValue)}
                  views={['hours', 'minutes']}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      error: formik.touched.meetingTime && Boolean(formik.errors.meetingTime),
                      helperText:
                        formik.touched.meetingTime && (formik.errors.meetingTime as string),
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={!!(formik.touched.repeatUntil && formik.errors.repeatUntil)}>
                <DatePicker
                  label="Last Date *"
                  name="repeatUntil"
                  format="DD/MM/YYYY"
                  value={formik.values.repeatUntil}
                  onChange={(newValue) => formik.setFieldValue('repeatUntil', newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      error: formik.touched.repeatUntil && Boolean(formik.errors.repeatUntil),
                      helperText:
                        formik.touched.repeatUntil && (formik.errors.repeatUntil as string),
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>
          </Grid>
        );

      case 'Monthly':
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <ShakingTextField
                error={!!(formik.touched.startDate && formik.errors.startDate) || false}
              >
                <DatePicker
                  label="Start Date *"
                  format="DD/MM/YYYY"
                  value={dayjs(formik.values.startDate)}
                  onChange={(newValue) => {
                    formik.setFieldValue('startDate', newValue);
                  }}
                  minDate={dayjs(currentYear?.startDate)}
                  maxDate={dayjs(currentYear?.endDate)}
                  sx={{ minWidth: 180, width: '100%' }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      error: !!(formik.touched.startDate && formik.errors.startDate) || false,
                      helperText:
                        formik.touched.startDate && formik.errors.startDate
                          ? String(formik.errors.startDate)
                          : undefined,
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>
            {/* On Day Option */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControlLabel
                value="onDay"
                control={<Radio />}
                label="On day"
                checked={formik.values.monthlyOption === 'onDay'}
                onChange={() => formik.setFieldValue('monthlyOption', 'onDay')}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <ShakingTextField error={!!(formik.touched.onDay && formik.errors.onDay)}>
                <TextField
                  size="small"
                  name="onDay"
                  type="number"
                  label="On Day *"
                  fullWidth
                  disabled={formik.values.monthlyOption !== 'onDay'}
                  value={formik.values.onDay ?? dayjs(formik.values.meetingDate).date()}
                  onChange={(e) => formik.setFieldValue('onDay', e.target.value)}
                  error={!!(formik.touched.onDay && formik.errors.onDay)}
                  helperText={
                    formik.touched.onDay && formik.errors.onDay
                      ? String(formik.errors.onDay)
                      : undefined
                  }
                />
              </ShakingTextField>
            </Grid>

            {/* On The Option */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControlLabel
                value="onThe"
                control={<Radio />}
                label="On the"
                checked={formik.values.monthlyOption === 'onThe'}
                onChange={() => formik.setFieldValue('monthlyOption', 'onThe')}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <ShakingTextField error={!!(formik.touched.onTheWeek && formik.errors.onTheWeek)}>
                <CustomSelect
                  options={[
                    { value: 'First', label: 'First' },
                    { value: 'Second', label: 'Second' },
                    { value: 'Third', label: 'Third' },
                    { value: 'Fourth', label: 'Fourth' },
                    { value: 'Last', label: 'Last' },
                  ]}
                  disabled={formik.values.monthlyOption !== 'onThe'}
                  label="On Week *"
                  value={formik.values.onTheWeek || 'First'}
                  onChange={(val) => formik.setFieldValue('onTheWeek', val)}
                  formControlProps={{ fullWidth: true }}
                />
              </ShakingTextField>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <ShakingTextField
                error={!!(formik.touched.monthlyOption && formik.errors.monthlyOption)}
              >
                <CustomSelect
                  options={[
                    { value: 'Monday', label: 'Monday' },
                    { value: 'Tuesday', label: 'Tuesday' },
                    { value: 'Wednesday', label: 'Wednesday' },
                    { value: 'Thursday', label: 'Thursday' },
                    { value: 'Friday', label: 'Friday' },
                    { value: 'Saturday', label: 'Saturday' },
                    { value: 'Sunday', label: 'Sunday' },
                  ]}
                  disabled={formik.values.monthlyOption !== 'onThe'}
                  label="On Day *"
                  value={formik.values.onTheDay || 'Monday'}
                  onChange={(val) => formik.setFieldValue('onTheDay', val)}
                  formControlProps={{ fullWidth: true }}
                />
              </ShakingTextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={!!(formik.touched.meetingTime && formik.errors.meetingTime)}>
                <TimePicker
                  label="Meeting Time *"
                  format="HH:mm"
                  name="meetingTime"
                  value={formik.values.meetingTime}
                  onChange={(newValue) => formik.setFieldValue('meetingTime', newValue)}
                  views={['hours', 'minutes']}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      error: formik.touched.meetingTime && Boolean(formik.errors.meetingTime),
                      helperText:
                        formik.touched.meetingTime && (formik.errors.meetingTime as string),
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ShakingTextField error={!!(formik.touched.repeatUntil && formik.errors.repeatUntil)}>
                <DatePicker
                  label="Last Date *"
                  value={formik.values.repeatUntil}
                  format="DD/MM/YYYY"
                  onChange={(newValue) => formik.setFieldValue('repeatUntil', newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      error: formik.touched.repeatUntil && Boolean(formik.errors.repeatUntil),
                      helperText:
                        formik.touched.repeatUntil && (formik.errors.repeatUntil as string),
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>
          </Grid>
        );

      case 'Custom':
        return (
          <>
            {/* Repeat every */}
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.customInterval && formik.errors.customInterval)}
                >
                  <CustomSelect
                    label="Repeat Every"
                    options={[
                      { value: 'days', label: 'Day(s)' },
                      { value: 'weeks', label: 'Week(s)' },
                      { value: 'months', label: 'Month(s)' },
                    ]}
                    value={formik.values.customInterval}
                    onChange={(val) => formik.setFieldValue('customInterval', val)}
                    formControlProps={{ fullWidth: true }}
                    error={formik.touched.customInterval && Boolean(formik.errors.customInterval)}
                    helperText={
                      formik.touched.customInterval &&
                      typeof formik.errors.customInterval === 'string'
                        ? formik.errors.customInterval
                        : undefined
                    }
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={
                    !!(formik.touched.customIntervalCount && formik.errors.customIntervalCount)
                  }
                >
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Interval *"
                    value={formik.values.customIntervalCount}
                    onChange={(e) => formik.setFieldValue('customIntervalCount', e.target.value)}
                    error={
                      formik.touched.customIntervalCount &&
                      Boolean(formik.errors.customIntervalCount)
                    }
                    helperText={
                      formik.touched.customIntervalCount &&
                      (typeof formik.errors.customIntervalCount === 'string'
                        ? formik.errors.customIntervalCount
                        : undefined)
                    }
                  />
                </ShakingTextField>
              </Grid>

              {/* For weekly custom, show days */}
              {formik.values.customInterval === 'weeks' && (
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderRadius: 2,
                    }}
                  >
                    {[
                      { short: 'S', value: 'Sunday' },
                      { short: 'M', value: 'Monday' },
                      { short: 'T', value: 'Tuesday' },
                      { short: 'W', value: 'Wednesday' },
                      { short: 'T', value: 'Thursday' },
                      { short: 'F', value: 'Friday' },
                      { short: 'S', value: 'Saturday' },
                    ].map((day, idx) => {
                      const isSelected = formik.values.customDays?.includes(day.value);
                      return (
                        <Box
                          key={idx}
                          onClick={() => {
                            const newValue = isSelected
                              ? formik.values.customDays.filter((d: any) => d !== day.value)
                              : [...(formik.values.customDays || []), day.value];
                            formik.setFieldValue('customDays', newValue);
                          }}
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            bgcolor: isSelected ? theme.palette.primary.main : 'transparent',
                            color: isSelected ? '#fff' : 'black',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Typography variant="body2" fontWeight={500}>
                            {day.short}
                          </Typography>
                        </Box>
                      );
                    })}
                    {formik.touched.customDays && formik.errors.customDays && (
                      <FormHelperText
                        error
                        sx={{
                          fontSize: '10px !important',
                          marginBottom: 8,
                          marginLeft: ' 10px !important',
                          bottom: 0,
                        }}
                      >
                        {String(formik.errors.customDays)}
                      </FormHelperText>
                    )}
                  </Box>
                </Grid>
              )}

              {/* For monthly custom, show "On day" OR "On the" */}
              {formik.values.customInterval === 'months' && (
                <>
                  {/* On Day Option */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <FormControlLabel
                      value="onDay"
                      control={<Radio />}
                      label="On day"
                      checked={formik.values.monthlyOption === 'onDay'}
                      onChange={() => formik.setFieldValue('monthlyOption', 'onDay')}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <ShakingTextField error={!!(formik.touched.onDay && formik.errors.onDay)}>
                      <TextField
                        size="small"
                        name="onDay"
                        type="number"
                        label="On Day *"
                        fullWidth
                        disabled={formik.values.monthlyOption !== 'onDay'}
                        value={formik.values.onDay ?? dayjs(formik.values.meetingDate).date()}
                        onChange={(e) => formik.setFieldValue('onDay', e.target.value)}
                        error={!!(formik.touched.onDay && formik.errors.onDay)}
                        helperText={
                          formik.touched.onDay && formik.errors.onDay
                            ? String(formik.errors.onDay)
                            : undefined
                        }
                      />
                    </ShakingTextField>
                  </Grid>

                  {/* On The Option */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <FormControlLabel
                      value="onThe"
                      control={<Radio />}
                      label="On the"
                      checked={formik.values.monthlyOption === 'onThe'}
                      onChange={() => formik.setFieldValue('monthlyOption', 'onThe')}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <ShakingTextField
                      error={!!(formik.touched.onTheWeek && formik.errors.onTheWeek)}
                    >
                      <CustomSelect
                        options={[
                          { value: 'First', label: 'First' },
                          { value: 'Second', label: 'Second' },
                          { value: 'Third', label: 'Third' },
                          { value: 'Fourth', label: 'Fourth' },
                          { value: 'Last', label: 'Last' },
                        ]}
                        disabled={formik.values.monthlyOption !== 'onThe'}
                        label="On Week *"
                        value={formik.values.onTheWeek || 'First'}
                        onChange={(val) => formik.setFieldValue('onTheWeek', val)}
                        formControlProps={{ fullWidth: true }}
                      />
                    </ShakingTextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <ShakingTextField error={!!(formik.touched.onTheDay && formik.errors.onTheDay)}>
                      <CustomSelect
                        options={[
                          { value: 'Monday', label: 'Monday' },
                          { value: 'Tuesday', label: 'Tuesday' },
                          { value: 'Wednesday', label: 'Wednesday' },
                          { value: 'Thursday', label: 'Thursday' },
                          { value: 'Friday', label: 'Friday' },
                          { value: 'Saturday', label: 'Saturday' },
                          { value: 'Sunday', label: 'Sunday' },
                        ]}
                        disabled={formik.values.monthlyOption !== 'onThe'}
                        label="On Day *"
                        value={formik.values.onTheDay || 'Monday'}
                        onChange={(val) => formik.setFieldValue('onTheDay', val)}
                        formControlProps={{ fullWidth: true }}
                      />
                    </ShakingTextField>
                  </Grid>
                </>
              )}

              {/* Meeting time */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.meetingTime && formik.errors.meetingTime)}
                >
                  <TimePicker
                    label="Meeting Time *"
                    format="HH:mm"
                    value={formik.values.meetingTime}
                    onChange={(newValue) => formik.setFieldValue('meetingTime', newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        error: formik.touched.meetingTime && Boolean(formik.errors.meetingTime),
                        helperText:
                          formik.touched.meetingTime && (formik.errors.meetingTime as string),
                      },
                    }}
                  />
                </ShakingTextField>
              </Grid>

              {/* Repeat Until */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.repeatUntil && formik.errors.repeatUntil)}
                >
                  <DatePicker
                    label="Last Date *"
                    value={formik.values.repeatUntil}
                    format="DD/MM/YYYY"
                    onChange={(newValue) => formik.setFieldValue('repeatUntil', newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        error: formik.touched.repeatUntil && Boolean(formik.errors.repeatUntil),
                        helperText:
                          formik.touched.repeatUntil && (formik.errors.repeatUntil as string),
                      },
                    }}
                  />
                </ShakingTextField>
              </Grid>
            </Grid>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent sx={{ p: 2 }}>{renderRecurringFields()}</DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => onClose(null, false)}
          variant="outlined"
          size="small"
        >
          Cancel
        </Button>
        <Button
          startIcon={<Iconify icon={GlobalIcons.submit} width={20} height={20} />}
          type="submit"
          variant="contained"
          size="small"
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          Submit
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default RecurringScheduleForm;
