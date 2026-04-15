'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
// Icons
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
// Date Pickers
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useSaveAttendanceConfigurationMutation } from 'src/redux/hr/attendanceApi';
// UI Components
import {
  Box,
  Card,
  Grid,
  Stack,
  Paper,
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
  // UI state for enhanced interactions (UI-only)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null); // Track which card is hovered for subtle animations
  const { currentYear: academicYearId } = useSelector((state: RootState) => state.globalState);

  const theme = useTheme();
  const [saveAttendanceConfiguration, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useSaveAttendanceConfigurationMutation,
    options: { skip: !academicYearId?.id },
  });

  const formik = useFormik<AttendanceConfiguration>({
    initialValues: INITIAL_ATTENDANCE_CONFIG,
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
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
        };

        await saveAttendanceConfiguration({ academicYearId: academicYearId.id, body: payload });
        shikshaMitraToast.success({ message: 'Attendance configuration saved successfully' });
      } catch (error) {
        console.error('Failed to save attendance configuration:', error);
        shikshaMitraToast.error({
          message: 'Failed to save attendance configuration',
        });
      }
    },
  });

  const { values, handleChange, setFieldValue, touched, errors } = formik;

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
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Attendance & Leave', href: hrPaths.attendance.importAttendance },
          { name: 'Settings', href: hrPaths.attendance.setting.root },
          { name: 'Attendance Configuration' },
        ]}
        description="Define and manage various leave types available to employees, such as sick leave, casual leave, and paid time off."
      />

      <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
        <Box display="flex" flexDirection="column" height="100%">
          <form
            onSubmit={formik.handleSubmit}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <Scrollbar sx={{ p: 2, flexGrow: 1 }}>
              <Grid container spacing={1} pb={1}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card
                    elevation={0}
                    onMouseEnter={() => setHoveredCard('daily')}
                    onMouseLeave={() => setHoveredCard(null)}
                    sx={{
                      borderRadius: 3,
                      height: '100%',
                      p: 0,
                      border: `2px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                      boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.04)}`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: hoveredCard === 'daily' ? 'translateY(-4px)' : 'translateY(0)',
                      '&:hover': {
                        boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.12)}`,
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Iconify
                            icon="material-symbols:schedule"
                            sx={{
                              width: 24,
                              height: 24,
                              color: theme.palette.success.main,
                            }}
                          />
                        </Box>
                        <Box>
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            sx={{
                              color: theme.palette.text.primary,
                              lineHeight: 1.2,
                            }}
                          >
                            Daily Punch Rules
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Configure daily attendance policies
                          </Typography>
                        </Box>
                      </Stack>

                      <Divider sx={{ mb: 2, opacity: 0.6 }} />

                      <Stack spacing={3}>
                        {(() => {
                          const { error, errorMessage } = getFieldStatus(
                            'dailyRules.hoursBasedPayPercentage'
                          );
                          return (
                            <Box>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  mb: 1.5,
                                  fontWeight: 600,
                                  color: theme.palette.text.primary,
                                }}
                              >
                                Minimum Hours for Full Pay
                              </Typography>
                              <TextField
                                fullWidth
                                size="small"
                                label="Hours Based Pay Percentage"
                                name="dailyRules.hoursBasedPayPercentage"
                                type="number"
                                value={values.dailyRules.hoursBasedPayPercentage}
                                onChange={(e) => {
                                  const { value } = e.target;
                                  if (value === '' || value === null || value === undefined) {
                                    setFieldValue('dailyRules.hoursBasedPayPercentage', '');
                                    return;
                                  }
                                  const numValue = Number(value);
                                  if (numValue >= 0 && numValue <= 100) {
                                    setFieldValue('dailyRules.hoursBasedPayPercentage', numValue);
                                  }
                                }}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ fontWeight: 500 }}
                                      >
                                        %
                                      </Typography>
                                    </InputAdornment>
                                  ),
                                }}
                                error={error}
                                helperText={
                                  errorMessage ||
                                  'Minimum percentage of hours required for full day pay'
                                }
                              />
                            </Box>
                          );
                        })()}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Section C: Late & Early Rules */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card
                    elevation={0}
                    onMouseEnter={() => setHoveredCard('late')}
                    onMouseLeave={() => setHoveredCard(null)}
                    sx={{
                      borderRadius: 3,
                      height: '100%',
                      border: `2px solid ${alpha(theme.palette.warning.main, 0.08)}`,
                      boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.04)}`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: hoveredCard === 'late' ? 'translateY(-4px)' : 'translateY(0)',
                      '&:hover': {
                        boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.12)}`,
                        borderColor: alpha(theme.palette.warning.main, 0.2),
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.warning.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Iconify
                            icon="material-symbols:timer"
                            sx={{
                              width: 24,
                              height: 24,
                              color: theme.palette.warning.main,
                            }}
                          />
                        </Box>
                        <Box>
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            sx={{
                              color: theme.palette.text.primary,
                              lineHeight: 1.2,
                            }}
                          >
                            Late Entry & Early Exit
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Set penalties and grace periods
                          </Typography>
                        </Box>
                      </Stack>

                      <Divider sx={{ mb: 2, opacity: 0.6 }} />

                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                          {(() => {
                            const { error, errorMessage } = getFieldStatus(
                              'lateEarlyRules.graceTime'
                            );
                            return (
                              <Box>
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    mb: 1.5,
                                    fontWeight: 600,
                                    color: theme.palette.text.primary,
                                  }}
                                >
                                  Grace Period
                                </Typography>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Grace Time (Minutes)"
                                  name="lateEarlyRules.graceTime"
                                  type="number"
                                  value={values.lateEarlyRules.graceTime}
                                  onChange={handleChange}
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <Typography
                                          variant="body2"
                                          color="text.secondary"
                                          sx={{ fontWeight: 500 }}
                                        >
                                          Mins
                                        </Typography>
                                      </InputAdornment>
                                    ),
                                    inputProps: {
                                      min: 0,
                                    },
                                  }}
                                  error={error}
                                  helperText={errorMessage || 'Allowed delay before marking late'}
                                />
                              </Box>
                            );
                          })()}
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          {(() => {
                            const { error, errorMessage } = getFieldStatus(
                              'lateEarlyRules.maxLateAllowedPerMonth'
                            );
                            return (
                              <Box>
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    mb: 1.5,
                                    fontWeight: 600,
                                    color: theme.palette.text.primary,
                                  }}
                                >
                                  Monthly Limit
                                </Typography>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Max Late Allowed / Month"
                                  name="lateEarlyRules.maxLateAllowedPerMonth"
                                  type="number"
                                  value={values.lateEarlyRules.maxLateAllowedPerMonth}
                                  onChange={handleChange}
                                  error={error}
                                  helperText={
                                    errorMessage || 'Maximum late entries allowed per month'
                                  }
                                  InputProps={{
                                    inputProps: {
                                      min: 0,
                                    },
                                  }}
                                />
                              </Box>
                            );
                          })()}
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          {(() => {
                            const { error, errorMessage } = getFieldStatus(
                              'lateEarlyRules.penaltyType'
                            );
                            return (
                              <Box>
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    mb: 1.5,
                                    fontWeight: 600,
                                    color: theme.palette.text.primary,
                                  }}
                                >
                                  Penalty Action
                                </Typography>
                                <TextField
                                  select
                                  fullWidth
                                  size="small"
                                  label="Penalty Action"
                                  name="lateEarlyRules.penaltyType"
                                  value={values.lateEarlyRules.penaltyType}
                                  onChange={handleChange}
                                  error={error}
                                  helperText={
                                    errorMessage || 'Action taken when monthly limit is exceeded'
                                  }
                                >
                                  <MenuItem value="none">
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                      <Typography>No Penalty</Typography>
                                    </Stack>
                                  </MenuItem>
                                  <MenuItem value="deduct_half_day">
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                      <Typography>Deduct Half Pay</Typography>
                                    </Stack>
                                  </MenuItem>
                                  <MenuItem value="deduct_full_day">
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                      <Typography>Deduct Full Day Pay</Typography>
                                    </Stack>
                                  </MenuItem>
                                </TextField>
                              </Box>
                            );
                          })()}
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Section D: Overtime & Holiday Rules */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card
                    elevation={0}
                    onMouseEnter={() => setHoveredCard('overtime')}
                    onMouseLeave={() => setHoveredCard(null)}
                    sx={{
                      borderRadius: 3,
                      height: '100%',
                      border: `2px solid ${alpha(theme.palette.info.main, 0.08)}`,
                      boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.04)}`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: hoveredCard === 'overtime' ? 'translateY(-4px)' : 'translateY(0)',
                      '&:hover': {
                        boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.12)}`,
                        borderColor: alpha(theme.palette.info.main, 0.2),
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Iconify
                            icon="material-symbols:work-history"
                            sx={{
                              width: 24,
                              height: 24,
                              color: theme.palette.info.main,
                            }}
                          />
                        </Box>
                        <Box>
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            sx={{
                              color: theme.palette.text.primary,
                              lineHeight: 1.2,
                            }}
                          >
                            Overtime & Holiday Rules
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Configure overtime calculation
                          </Typography>
                        </Box>
                      </Stack>

                      <Divider sx={{ mb: 2, opacity: 0.6 }} />

                      <Stack spacing={3}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.info.main, 0.04),
                            border: `1px solid ${alpha(theme.palette.info.main, 0.12)}`,
                          }}
                        >
                          <FormControlLabel
                            control={
                              <Switch
                                checked={values.overtime.enabled}
                                onChange={(e) =>
                                  setFieldValue('overtime.enabled', e.target.checked)
                                }
                                sx={{
                                  '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: theme.palette.info.main,
                                  },
                                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: theme.palette.info.main,
                                  },
                                }}
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="subtitle2" fontWeight={600}>
                                  Enable Overtime Calculation
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Automatically calculate overtime pay for extra hours
                                </Typography>
                              </Box>
                            }
                            sx={{ m: 0 }}
                          />
                        </Box>

                        <Collapse in={values.overtime.enabled} timeout={300}>
                          <Paper
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.background.paper, 0.6),
                              border: `1px solid ${alpha(theme.palette.grey[300], 0.3)}`,
                            }}
                          >
                            <Stack spacing={3}>
                              <Box>
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    mb: 1.5,
                                    fontWeight: 600,
                                    color: theme.palette.text.primary,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                  }}
                                >
                                  <Iconify
                                    icon="material-symbols:calculate"
                                    sx={{ width: 16, height: 16 }}
                                  />
                                  Overtime Rate
                                </Typography>
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
                                      helperText={
                                        errorMessage || 'Rate multiplier for overtime hours'
                                      }
                                    >
                                      <MenuItem value="1.5x">
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                          <Typography fontWeight={500}>1.5x</Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            (Standard Rate)
                                          </Typography>
                                        </Stack>
                                      </MenuItem>
                                      <MenuItem value="2.0x">
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                          <Typography fontWeight={500}>2.0x</Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            (Double Pay)
                                          </Typography>
                                        </Stack>
                                      </MenuItem>
                                      <MenuItem value="flat">
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                          <Typography fontWeight={500}>Flat Rate</Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            (Fixed Amount)
                                          </Typography>
                                        </Stack>
                                      </MenuItem>
                                    </TextField>
                                  );
                                })()}
                              </Box>

                              <Box>
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    mb: 1.5,
                                    fontWeight: 600,
                                    color: theme.palette.text.primary,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                  }}
                                >
                                  <Iconify
                                    icon="material-symbols:hourglass-top"
                                    sx={{ width: 16, height: 16 }}
                                  />
                                  Minimum Duration
                                </Typography>
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
                                      InputProps={{
                                        inputProps: {
                                          min: 0,
                                        },
                                      }}
                                      helperText={
                                        errorMessage ||
                                        'Minimum overtime duration to qualify for OT pay'
                                      }
                                    />
                                  );
                                })()}
                              </Box>
                            </Stack>
                          </Paper>
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
