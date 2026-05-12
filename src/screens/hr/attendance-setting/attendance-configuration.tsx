'use client';

import type { RootState } from 'src/redux/store';

import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useGetAttendanceConfigurationQuery,
  useSaveAttendanceConfigurationMutation,
} from 'src/redux/hr/attendanceApi';
import {
  Box,
  Card,
  Grid,
  Button,
  Switch,
  Slider,
  Collapse,
  TextField,
  Typography,
  DialogActions,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';

import { INITIAL_ATTENDANCE_CONFIG } from './types';

import type { AttendanceConfiguration } from './types';

// ─── Validation Schema ────────────────────────────────────────────────────────
const validationSchema = Yup.object().shape({
  shiftTiming: Yup.object({
    startTime: Yup.string().required('Required'),
    endTime: Yup.string().required('Required'),
    breakDuration: Yup.number().min(0).required('Required').typeError('Must be a number'),
  }),
  dailyRules: Yup.object({
    hoursBasedPayPercentage: Yup.number()
      .min(0, 'Min 0%')
      .max(100, 'Max 100%')
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

// ─── Component ────────────────────────────────────────────────────────────────
const AttendanceConfigurationScreen = () => {
  const { currentYear: academicYearId } = useSelector((state: RootState) => state.globalState);

  const [saveAttendanceConfiguration, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useSaveAttendanceConfigurationMutation,
    options: { skip: !academicYearId?.id },
    popupConfig: { error: false },
  });

  const { data: attendanceConfiguration } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAttendanceConfigurationQuery,
    params: { academicYearId: academicYearId?.id },
    options: { skip: !academicYearId?.id },
    popupConfig: { error: false },
  });

  const formik = useFormik<AttendanceConfiguration>({
    initialValues: INITIAL_ATTENDANCE_CONFIG,
    validationSchema,
    onSubmit: async (values) => {
      if (!academicYearId?.id) {
        shikshaMitraToast.error({ message: 'Please select an academic year before saving' });
        return;
      }

      try {
        await saveAttendanceConfiguration({
          academicYearId: academicYearId.id,
          body: {
            dailyRules: {
              hoursBasedPayPercentage: values.dailyRules.hoursBasedPayPercentage,
            },
            lateEarlyRules: {
              graceTime: values.lateEarlyRules.graceTime,
              maxLateAllowedPerMonth: values.lateEarlyRules.maxLateAllowedPerMonth,
              penaltyType: values.lateEarlyRules.penaltyType,
            },
            overtime: {
              enabled: values.overtime.enabled,
              rate: values.overtime.rate,
              minOvertimeMinutes: values.overtime.minOvertimeMinutes,
            },
          },
        }).unwrap();
        shikshaMitraToast.success({ message: 'Attendance configuration saved successfully' });
      } catch (error) {
        console.error('Failed to save attendance configuration:', error);
        shikshaMitraToast.error({ message: 'Failed to save attendance configuration' });
      }
    },
  });

  const { values, touched, errors, handleChange, setFieldValue, resetForm } = formik;

  React.useEffect(() => {
    if (!attendanceConfiguration?.dailyRules) {
      return;
    }

    resetForm({
      values: {
        ...INITIAL_ATTENDANCE_CONFIG,
        dailyRules: {
          hoursBasedPayPercentage: attendanceConfiguration.dailyRules.hoursBasedPayPercentage,
        },
        lateEarlyRules: {
          ...INITIAL_ATTENDANCE_CONFIG.lateEarlyRules,
          graceTime:
            attendanceConfiguration.lateEarlyRules?.graceTime ??
            INITIAL_ATTENDANCE_CONFIG.lateEarlyRules.graceTime,
          maxLateAllowedPerMonth:
            attendanceConfiguration.lateEarlyRules?.maxLateAllowedPerMonth ??
            INITIAL_ATTENDANCE_CONFIG.lateEarlyRules.maxLateAllowedPerMonth,
          penaltyType:
            attendanceConfiguration.lateEarlyRules?.penaltyType ??
            INITIAL_ATTENDANCE_CONFIG.lateEarlyRules.penaltyType,
        },
        overtime: {
          enabled:
            attendanceConfiguration.overtime?.enabled ?? INITIAL_ATTENDANCE_CONFIG.overtime.enabled,
          rate: attendanceConfiguration.overtime?.rate ?? INITIAL_ATTENDANCE_CONFIG.overtime.rate,
          minOvertimeMinutes:
            attendanceConfiguration.overtime?.minOvertimeMinutes ??
            INITIAL_ATTENDANCE_CONFIG.overtime.minOvertimeMinutes,
        },
      },
    });
  }, [attendanceConfiguration, resetForm]);

  const getFieldStatus = (field: string) => {
    const parts = field.split('.');
    const touchedVal = parts.reduce((obj: any, key) => obj?.[key], touched);
    const errorVal = parts.reduce((obj: any, key) => obj?.[key], errors);
    return {
      error: Boolean(touchedVal && errorVal),
      helperText: touchedVal && errorVal ? String(errorVal) : '',
    };
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Attendance Configuration"
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Attendance Management', href: hrPaths.attendance.biometricAttendance },
          { name: 'Settings', href: hrPaths.attendance.setting.root },
          { name: 'Attendance Configuration' },
        ]}
        description="Define and manage various leave types available to employees, such as sick leave, casual leave, and paid time off."
      />

      <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <form
            onSubmit={formik.handleSubmit}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <Scrollbar sx={{ p: 2, height: '100%' }}>
              <Grid container spacing={2}>
                {/* ══════════════════════════════════════════════════
                    SECTION 1 · Daily Punch Rules
                ══════════════════════════════════════════════════ */}
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: '8px',
                      mb: 1.5,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Box sx={{ p: 2, pb: 2 }}>
                      <Typography variant="h6" fontWeight={700}>
                        Daily Punch Rules
                      </Typography>
                      <Typography variant="caption" color="text.secondary" mb={0.5} display="block">
                        Configure how daily attendance hours are calculated for pay.
                      </Typography>
                    </Box>

                    <Box sx={{ p: 2, pt: 0 }}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <ShakingTextField
                            error={getFieldStatus('dailyRules.hoursBasedPayPercentage').error}
                          >
                            <TextField
                              fullWidth
                              size="small"
                              label="Hours Based Pay Percentage"
                              name="dailyRules.hoursBasedPayPercentage"
                              type="number"
                              value={values.dailyRules.hoursBasedPayPercentage}
                              onChange={(e) => {
                                const v = e.target.value;
                                if (v === '') {
                                  setFieldValue('dailyRules.hoursBasedPayPercentage', '');
                                  return;
                                }
                                const n = Number(v);
                                if (n >= 0 && n <= 100) {
                                  setFieldValue('dailyRules.hoursBasedPayPercentage', n);
                                }
                              }}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <Typography variant="body2" color="text.secondary">
                                      %
                                    </Typography>
                                  </InputAdornment>
                                ),
                                inputProps: { min: 0, max: 100 },
                              }}
                              error={getFieldStatus('dailyRules.hoursBasedPayPercentage').error}
                              helperText={
                                getFieldStatus('dailyRules.hoursBasedPayPercentage').helperText ||
                                `Minimum percentage of hours required for full day pay`
                              }
                            />
                          </ShakingTextField>
                        </Grid>

                        <Grid
                          size={{ xs: 12, md: 8 }}
                          sx={{ display: 'flex', alignItems: 'center' }}
                        >
                          <Box sx={{ width: '100%', px: 1 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              mb={0.5}
                              display="block"
                            >
                              Minimum Hours for Full Pay
                            </Typography>
                            <Slider
                              value={Number(values.dailyRules.hoursBasedPayPercentage) || 0}
                              min={0}
                              max={100}
                              valueLabelDisplay="auto"
                              valueLabelFormat={(v) => `${v}%`}
                              onChange={(_, val) =>
                                setFieldValue('dailyRules.hoursBasedPayPercentage', val)
                              }
                              sx={{
                                '& .MuiSlider-thumb': { width: 14, height: 14 },
                                '& .MuiSlider-rail': { opacity: 0.2 },
                              }}
                            />
                            <Typography variant="caption" color="text.disabled">
                              Minimum percentage of hours required for full day pay
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                </Grid>

                {/* ══════════════════════════════════════════════════
                    SECTION 2 · Late Entry & Early Exit
                ══════════════════════════════════════════════════ */}
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: '8px',
                      mb: 1.5,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Box sx={{ p: 2, pb: 1 }}>
                      <Typography variant="h6" fontWeight={700}>
                        Late Entry &amp; Early Exit
                      </Typography>
                      <Typography variant="caption" color="text.secondary" mb={0.5} display="block">
                        Set grace periods, monthly limits, and penalty actions for late arrivals.
                      </Typography>
                    </Box>

                    <Box sx={{ p: 2, pt: 2 }}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <ShakingTextField
                            error={getFieldStatus('lateEarlyRules.graceTime').error}
                          >
                            <TextField
                              fullWidth
                              size="small"
                              label="Grace Time (Minutes)"
                              name="lateEarlyRules.graceTime"
                              type="number"
                              value={values.lateEarlyRules.graceTime}
                              onChange={handleChange}
                              InputProps={{
                                inputProps: { min: 0 },
                              }}
                              error={getFieldStatus('lateEarlyRules.graceTime').error}
                              helperText={
                                getFieldStatus('lateEarlyRules.graceTime').helperText ||
                                'Allowed delay before marking late'
                              }
                            />
                          </ShakingTextField>
                        </Grid>

                        {/* Max Late Allowed Per Month */}
                        <Grid size={{ xs: 12, md: 4 }}>
                          <ShakingTextField
                            error={getFieldStatus('lateEarlyRules.maxLateAllowedPerMonth').error}
                          >
                            <TextField
                              fullWidth
                              size="small"
                              label="Max Late Allowed / Month"
                              name="lateEarlyRules.maxLateAllowedPerMonth"
                              type="number"
                              value={values.lateEarlyRules.maxLateAllowedPerMonth}
                              onChange={handleChange}
                              InputProps={{
                                inputProps: { min: 0 },
                              }}
                              error={getFieldStatus('lateEarlyRules.maxLateAllowedPerMonth').error}
                              helperText={
                                getFieldStatus('lateEarlyRules.maxLateAllowedPerMonth')
                                  .helperText || 'Maximum late entries allowed per month'
                              }
                            />
                          </ShakingTextField>
                        </Grid>

                        {/* Penalty Action */}
                        <Grid size={{ xs: 12, md: 4 }}>
                          <ShakingTextField
                            error={getFieldStatus('lateEarlyRules.penaltyType').error}
                          >
                            <CustomSelect
                              name="lateEarlyRules.penaltyType"
                              label="Penalty Action"
                              options={[
                                { id: 'none', name: 'No Penalty' },
                                { id: 'deduct_half_day', name: 'Deduct Half Day' },
                                { id: 'deduct_full_day', name: 'Deduct Full Day' },
                              ]}
                              labelKey="name"
                              valueKey="id"
                              value={values.lateEarlyRules.penaltyType}
                              onChange={(val) => setFieldValue('lateEarlyRules.penaltyType', val)}
                              error={getFieldStatus('lateEarlyRules.penaltyType').error}
                              helperText={
                                getFieldStatus('lateEarlyRules.penaltyType').helperText ||
                                'Action taken when monthly limit is exceeded'
                              }
                              formControlProps={{ fullWidth: true }}
                            />
                          </ShakingTextField>
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                </Grid>

                {/* ══════════════════════════════════════════════════
                    SECTION 3 · Overtime & Holiday Rules
                ══════════════════════════════════════════════════ */}
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: '8px',
                      mb: 1.5,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Box sx={{ p: 2, pb: 1 }}>
                      <Typography variant="h6" fontWeight={700}>
                        Overtime &amp; Holiday Rules
                      </Typography>
                      <Typography variant="caption" color="text.secondary" mb={0.5} display="block">
                        Configure overtime calculation rates and minimum qualifying duration.
                      </Typography>
                    </Box>

                    <Box sx={{ p: 2, pt: 2 }}>
                      <Grid container spacing={2}>
                        {/* Enable Overtime Toggle */}
                        <Grid size={{ xs: 12 }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={values.overtime.enabled}
                                onChange={(e) =>
                                  setFieldValue('overtime.enabled', e.target.checked)
                                }
                                size="small"
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  Enable Overtime Calculation
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Automatically calculate overtime pay for extra hours worked.
                                </Typography>
                              </Box>
                            }
                          />
                        </Grid>

                        {/* Collapsible OT fields */}
                        <Grid size={{ xs: 12 }}>
                          <Collapse in={values.overtime.enabled} timeout={280}>
                            <Grid container spacing={2} pt={1}>
                              {/* Overtime Rate */}
                              <Grid size={{ xs: 12, md: 6 }}>
                                <ShakingTextField error={getFieldStatus('overtime.rate').error}>
                                  <CustomSelect
                                    name="overtime.rate"
                                    label="Overtime Rate"
                                    options={[
                                      { id: '1.5x', name: '1.5x (Standard Rate)' },
                                      { id: '2.0x', name: '2.0x (Double Pay)' },
                                      { id: 'flat', name: 'Flat Rate (Fixed Amount)' },
                                    ]}
                                    labelKey="name"
                                    valueKey="id"
                                    value={values.overtime.rate}
                                    onChange={(val) => setFieldValue('overtime.rate', val)}
                                    error={getFieldStatus('overtime.rate').error}
                                    helperText={
                                      getFieldStatus('overtime.rate').helperText ||
                                      'Rate multiplier for overtime hours'
                                    }
                                    formControlProps={{ fullWidth: true }}
                                  />
                                </ShakingTextField>
                              </Grid>

                              {/* Min Overtime Minutes */}
                              <Grid size={{ xs: 12, md: 6 }}>
                                <ShakingTextField
                                  error={getFieldStatus('overtime.minOvertimeMinutes').error}
                                >
                                  <TextField
                                    fullWidth
                                    size="small"
                                    label="Min Duration for OT (Minutes)"
                                    name="overtime.minOvertimeMinutes"
                                    type="number"
                                    value={values.overtime.minOvertimeMinutes}
                                    onChange={handleChange}
                                    InputProps={{
                                      inputProps: { min: 0 },
                                    }}
                                    error={getFieldStatus('overtime.minOvertimeMinutes').error}
                                    helperText={
                                      getFieldStatus('overtime.minOvertimeMinutes').helperText ||
                                      'Minimum overtime duration to qualify for OT pay'
                                    }
                                  />
                                </ShakingTextField>
                              </Grid>
                            </Grid>
                          </Collapse>
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Scrollbar>

            {/* ── Footer Actions ── */}
            <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => formik.resetForm()}
                startIcon={<Iconify icon={GlobalIcons.resetIcon} />}
              >
                Reset
              </Button>
              <LoadingButton
                variant="contained"
                size="small"
                type="submit"
                loading={isUpdateLoading}
                startIcon={<Iconify icon="mdi:content-save" />}
              >
                Submit
              </LoadingButton>
            </DialogActions>
          </form>
        </Box>
      </Card>
    </Box>
  );
};

export default AttendanceConfigurationScreen;
