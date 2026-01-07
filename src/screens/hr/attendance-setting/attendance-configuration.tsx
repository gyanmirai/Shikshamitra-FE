'use client';

import type dayjs from 'dayjs';

import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
// Icons
import { Scrollbar } from 'src/components/scrollbar';
// Date Pickers
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
// UI Components
import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  Switch,
  Divider,
  Collapse,
  MenuItem,
  TextField,
  Typography,
  CardContent,
  DialogActions,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';

import { INITIAL_ATTENDANCE_CONFIG } from './types';

import type { AttendanceConfiguration } from './types';

// Validation Schema
const validationSchema = Yup.object().shape({
  shiftTiming: Yup.object({
    startTime: Yup.string().required('Required'),
    endTime: Yup.string().required('Required'),
    breakDuration: Yup.number()
      .min(0, 'Must be positive')
      .required('Required')
      .typeError('Must be a number'),
  }),
  dailyRules: Yup.object({
    hoursBasedPayPercentage: Yup.number()
      .min(1, 'Min 1 hour')
      .required('Required')
      .typeError('Must be a number'),
  }),
  lateEarlyRules: Yup.object({
    graceTime: Yup.number()
      .min(0, 'Must be positive')
      .required('Required')
      .typeError('Must be a number'),
    maxLateAllowedPerMonth: Yup.number()
      .min(0, 'Must be positive')
      .required('Required')
      .typeError('Must be a number'),
    penaltyType: Yup.string()
      .oneOf(['none', 'deduct_half_day', 'deduct_full_day'])
      .required('Required'),
  }),
  overtime: Yup.object({
    enabled: Yup.boolean().required('Required'),
    rate: Yup.string().when('enabled', {
      is: true,
      then: (schema) => schema.oneOf(['1.5x', '2.0x', 'flat']).required('Required'),
      otherwise: (schema) => schema.notRequired(),
    }),
    minOvertimeMinutes: Yup.number().when('enabled', {
      is: true,
      then: (schema) =>
        schema.min(0, 'Must be positive').required('Required').typeError('Must be a number'),
      otherwise: (schema) => schema.notRequired(),
    }),
  }),
});

const AttendanceConfigurationScreen = () => {
  const formik = useFormik<AttendanceConfiguration>({
    initialValues: INITIAL_ATTENDANCE_CONFIG,
    validationSchema,
    onSubmit: (values) => {
      // TODO: Call API to save settings
    },
  });

  const { values, handleChange, setFieldValue, touched, errors, handleSubmit } = formik;

  // Helper to handle TimePicker changes (Dayjs -> string)
  const handleTimeChange = (field: string) => (newValue: dayjs.Dayjs | null) => {
    if (newValue) {
      setFieldValue(field, newValue.format('HH:mm'));
    }
  };

  // Helper for error props - returns validation status and message
  const getFieldStatus = (field: string) => {
    const fieldParts = field.split('.');
    const touchedVal = fieldParts.reduce((obj: any, key) => obj?.[key], touched);
    const errorVal = fieldParts.reduce((obj: any, key) => obj?.[key], errors);

    return {
      error: Boolean(touchedVal && errorVal),
      errorMessage: touchedVal && errorVal ? String(errorVal) : undefined,
    };
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Attendance Configuration"
        links={[
          { name: 'HR/Staff', href: '/hr/dashboard/' },
          { name: 'Attendance & Leave Management', href: '' },
          { name: 'Setting' },
          { name: 'Attendance Configuration', href: '' },
        ]}
        sx={{ mb: 2 }}
        description="Define and manage various leave types available to employees, such as sick leave, casual leave, and paid time off."
      />

      <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
        <Box display="flex" flexDirection="column" height="100%">
          <form
            onSubmit={formik.handleSubmit}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <Scrollbar sx={{ p: 2, flexGrow: 1 }}>
              <Grid container spacing={2}>
                {/* Section A: Work Schedule */}
                {/* <Grid size={{ xs: 12, md: 6 }}>
              <Card
                elevation={0}
                sx={{ border: '1px solid #E0E0E0', borderRadius: 3, height: '100%' }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                    <AccessTimeIcon color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      Work Schedule
                    </Typography>
                  </Stack>
                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      {(() => {
                        const { error, errorMessage } = getFieldStatus('shiftTiming.startTime');
                        return (
                          <TimePicker
                            label="Shift Start Time"
                            value={dayjs(values.shiftTiming.startTime, 'HH:mm')}
                            onChange={handleTimeChange('shiftTiming.startTime')}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                size: 'small',
                                error,
                                helperText: errorMessage,
                              },
                            }}
                          />
                        );
                      })()}
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      {(() => {
                        const { error, errorMessage } = getFieldStatus('shiftTiming.endTime');
                        return (
                          <TimePicker
                            label="Shift End Time"
                            value={dayjs(values.shiftTiming.endTime, 'HH:mm')}
                            onChange={handleTimeChange('shiftTiming.endTime')}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                size: 'small',
                                error,
                                helperText: errorMessage,
                              },
                            }}
                          />
                        );
                      })()}
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      {(() => {
                        const { error, errorMessage } = getFieldStatus('shiftTiming.breakDuration');
                        return (
                          <TextField
                            fullWidth
                            size="small"
                            label="Break Duration (Minutes)"
                            name="shiftTiming.breakDuration"
                            type="number"
                            value={values.shiftTiming.breakDuration}
                            onChange={handleChange}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">min</InputAdornment>,
                            }}
                            error={error}
                            helperText={errorMessage}
                          />
                        );
                      })()}
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      {(() => {
                        const { error, errorMessage } = getFieldStatus('weeklyOff');
                        return (
                          <TextField
                            select
                            fullWidth
                            size="small"
                            label="Weekly Off Pattern"
                            name="weeklyOff"
                            value={values.weeklyOff}
                            onChange={handleChange}
                            error={error}
                            helperText={errorMessage}
                          >
                            <MenuItem value="sunday">Sunday Only</MenuItem>
                            <MenuItem value="saturday_sunday">Saturday & Sunday</MenuItem>
                            <MenuItem value="custom">Custom</MenuItem>
                          </TextField>
                        );
                      })()}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
                 </Grid> */}

                {/* Section B: Daily Attendance Rules */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card elevation={0} sx={{ borderRadius: 3, height: '100%', p: 0 }}>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                        <Typography variant="h6" fontWeight={600}>
                          Daily Punch Rules
                        </Typography>
                      </Stack>
                      <Divider sx={{ mb: 2 }} />

                      <Stack spacing={2}>
                        {(() => {
                          const { error, errorMessage } = getFieldStatus(
                            'dailyRules.hoursBasedPayPercentage'
                          );
                          return (
                            <TextField
                              fullWidth
                              size="small"
                              label="Hours Based Pay Percentage"
                              name="dailyRules.hoursBasedPayPercentage"
                              type="number"
                              value={values.dailyRules.hoursBasedPayPercentage}
                              onChange={handleChange}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                              }}
                              error={error}
                              helperText={errorMessage}
                            />
                          );
                        })()}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Section C: Late & Early Rules */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card elevation={0} sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                        <Typography variant="h6">Late Entry & Early Exit</Typography>
                      </Stack>
                      <Divider sx={{ mb: 2 }} />

                      <Grid container spacing={3} flexDirection={{ md: 'column' }}>
                        <Grid size={{ xs: 12 }}>
                          {(() => {
                            const { error, errorMessage } = getFieldStatus(
                              'lateEarlyRules.graceTime'
                            );
                            return (
                              <TextField
                                fullWidth
                                size="small"
                                label="Grace Time (Minutes)"
                                name="lateEarlyRules.graceTime"
                                type="number"
                                value={values.lateEarlyRules.graceTime}
                                onChange={handleChange}
                                error={error}
                                helperText={errorMessage || 'Allowed delay before marking late'}
                              />
                            );
                          })()}
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          {(() => {
                            const { error, errorMessage } = getFieldStatus(
                              'lateEarlyRules.maxLateAllowedPerMonth'
                            );
                            return (
                              <TextField
                                fullWidth
                                size="small"
                                label="Max Late Allowed / Month"
                                name="lateEarlyRules.maxLateAllowedPerMonth"
                                type="number"
                                value={values.lateEarlyRules.maxLateAllowedPerMonth}
                                onChange={handleChange}
                                error={error}
                                helperText={errorMessage || 'e.g. 3 times allowed'}
                              />
                            );
                          })()}
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          {(() => {
                            const { error, errorMessage } = getFieldStatus(
                              'lateEarlyRules.penaltyType'
                            );
                            return (
                              <TextField
                                select
                                fullWidth
                                size="small"
                                label="Penalty Action"
                                name="lateEarlyRules.penaltyType"
                                value={values.lateEarlyRules.penaltyType}
                                onChange={handleChange}
                                error={error}
                                helperText={errorMessage}
                              >
                                <MenuItem value="none">No Penalty</MenuItem>
                                <MenuItem value="deduct_half_day">Deduct Half Pay</MenuItem>
                                <MenuItem value="deduct_full_day">Deduct Full Day Pay</MenuItem>
                              </TextField>
                            );
                          })()}
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Section D: Overtime & Holiday Rules */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card elevation={0} sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                        <Typography variant="h6" fontWeight={600}>
                          Overtime & Holiday Rules
                        </Typography>
                      </Stack>
                      <Divider sx={{ mb: 1 }} />

                      <Stack spacing={2}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={values.overtime.enabled}
                              onChange={(e) => setFieldValue('overtime.enabled', e.target.checked)}
                            />
                          }
                          label="Enable Overtime Calculation"
                        />

                        <Collapse in={values.overtime.enabled}>
                          <Stack spacing={2} pl={2} borderLeft="2px solid #eee">
                            {(() => {
                              const { error, errorMessage } = getFieldStatus('overtime.rate');
                              return (
                                <TextField
                                  select
                                  fullWidth
                                  size="small"
                                  label="Overtime Rate"
                                  name="overtime.rate"
                                  value={values.overtime.rate}
                                  onChange={handleChange}
                                  error={error}
                                  helperText={errorMessage}
                                >
                                  <MenuItem value="1.5x">1.5x (Normal OT)</MenuItem>
                                  <MenuItem value="2.0x">2.0x (Double Pay)</MenuItem>
                                  <MenuItem value="flat">Flat Rate</MenuItem>
                                </TextField>
                              );
                            })()}
                            {(() => {
                              const { error, errorMessage } = getFieldStatus(
                                'overtime.minOvertimeMinutes'
                              );
                              return (
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Min Duration for OT (Minutes)"
                                  name="overtime.minOvertimeMinutes"
                                  type="number"
                                  value={values.overtime.minOvertimeMinutes}
                                  onChange={handleChange}
                                  error={error}
                                  helperText={errorMessage}
                                />
                              );
                            })()}
                          </Stack>
                        </Collapse>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Scrollbar>
            <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => formik.resetForm()}
                startIcon={<Iconify icon={GlobalIcons.resetIcon} />}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                size="small"
                type="submit"
                startIcon={<Iconify icon="mdi:content-save" />}
              >
                Submit
              </Button>
            </DialogActions>
          </form>
        </Box>
      </Card>
    </Box>
  );
};

export default AttendanceConfigurationScreen;
