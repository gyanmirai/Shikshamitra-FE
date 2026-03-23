'use client';

import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useSaveDayCalculationSettingsMutation } from 'src/redux/hr/employee-payroll-api';
import {
  Box,
  Card,
  Grid,
  Paper,
  Stack,
  Button,
  Switch,
  Divider,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

const PayrollConfiguration = () => {
  const theme = useTheme();
  const [saveDayCalculationSettings, { isLoading: saveDayCalculationSettingsLoading }] =
    useQueryAndMutation({
      type: 'mutation',
      currentQueryAndMutation: useSaveDayCalculationSettingsMutation,
    });
  const formik = useFormik({
    initialValues: {
      dayCalculationType: 'working-days', // 'working-days' | 'total-days'
      totalDayType: 'total-month-days', // 'total-month-days' | 'manual-days'
      manualDays: '',
    },
    validationSchema: Yup.object({
      manualDays: Yup.number()
        .required('Manual Days is required')
        .min(1, 'Manual Days must be at least 1')
        .max(31, 'Manual Days must be at most 31'),
    }),
    onSubmit: async (values) => {
      await saveDayCalculationSettings({ body: values, academicYearId: '' });
    },
  });

  const handleReset = () => {
    formik.resetForm();
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Payroll Configuration"
        description="Configure the payroll calculation rules, including how days are counted for salary processing."
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Payroll Management', href: hrPaths.payroll.runPayroll },
          { name: 'Settings', href: hrPaths.payroll.settings.earningComponents },
          { name: 'Payroll Configuration' },
        ]}
      />

      <Card
        sx={{
          height: '100%',
          boxShadow: theme.customShadows.z4,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <form
          onSubmit={formik.handleSubmit}
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
          <Scrollbar sx={{ flexGrow: 1 }}>
            <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto', width: '100%' }}>
              {/* Day Calculation Method Section */}
              <Box mb={5}>
                <Typography variant="h6" sx={{ mb: 0.5 }}>
                  Day Calculation Method
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Select how the system should calculate the basis for salary distribution.
                </Typography>

                <Grid container spacing={3}>
                  {/* Option 1: According to Working Days */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper
                      component="div"
                      onClick={() => formik.setFieldValue('dayCalculationType', 'working-days')}
                      sx={{
                        p: 3,
                        cursor: 'pointer',
                        height: '100%',
                        position: 'relative',
                        borderRadius: 2,
                        border: '2px solid',
                        borderColor:
                          formik.values.dayCalculationType === 'working-days'
                            ? 'success.main'
                            : 'divider',
                        bgcolor:
                          formik.values.dayCalculationType === 'working-days'
                            ? alpha(theme.palette.success.main, 0.04)
                            : 'transparent',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          bgcolor:
                            formik.values.dayCalculationType === 'working-days'
                              ? alpha(theme.palette.success.main, 0.08)
                              : alpha(theme.palette.grey[500], 0.08),
                        },
                      }}
                    >
                      <Stack spacing={2}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: 1,
                              bgcolor: 'success.main',
                              color: 'common.white',
                              display: 'flex',
                            }}
                          >
                            <Iconify icon="fluent:calendar-work-week-24-regular" width={24} />
                          </Box>
                          <Typography variant="subtitle1" fontWeight={700}>
                            According to working days
                          </Typography>
                          {formik.values.dayCalculationType === 'working-days' && (
                            <Iconify
                              icon="eva:checkmark-circle-2-fill"
                              color="success.main"
                              width={24}
                              sx={{ ml: 'auto' }}
                            />
                          )}
                        </Box>

                        <Typography variant="body2" color="text.secondary">
                          Salary is calculated based on actual working days in the month
                        </Typography>

                        <Box
                          sx={{
                            py: 0.5,
                            px: 1.5,
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                            color: 'error.main',
                            borderRadius: 0.5,
                            width: 'fit-content',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          <Iconify icon="mdi:briefcase-outline" width={16} />
                          Best for organizations with attendance tracking
                        </Box>

                        <Card
                          variant="outlined"
                          sx={{
                            p: 2,
                            mt: 2,
                            bgcolor: 'transparent',
                            borderStyle: 'dashed',
                            borderColor: 'divider',
                          }}
                        >
                          <Stack spacing={1.5}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Iconify
                                icon="eva:checkmark-square-fill"
                                color="success.main"
                                width={16}
                              />
                              <Typography
                                variant="caption"
                                fontWeight={700}
                                color="success.main"
                                sx={{ letterSpacing: 0.5 }}
                              >
                                LIVE EXAMPLE
                              </Typography>
                            </Box>

                            <Grid container spacing={2}>
                              <Grid size={{ xs: 6 }}>
                                <Typography
                                  variant="caption"
                                  display="block"
                                  color="text.secondary"
                                >
                                  Monthly Salary
                                </Typography>
                                <Typography variant="subtitle2">₹30,000</Typography>
                              </Grid>
                              <Grid size={{ xs: 6 }}>
                                <Typography
                                  variant="caption"
                                  display="block"
                                  color="text.secondary"
                                >
                                  Working Days
                                </Typography>
                                <Typography variant="subtitle2">26 days</Typography>
                              </Grid>
                              <Grid size={{ xs: 6 }}>
                                <Typography
                                  variant="caption"
                                  display="block"
                                  color="text.secondary"
                                >
                                  Present Days
                                </Typography>
                                <Typography variant="subtitle2">24 days</Typography>
                              </Grid>
                              <Grid size={{ xs: 6 }}>
                                <Typography
                                  variant="caption"
                                  display="block"
                                  color="text.secondary"
                                >
                                  Payable Salary
                                </Typography>
                                <Typography variant="subtitle2" color="success.main">
                                  ₹27,692
                                </Typography>
                              </Grid>
                            </Grid>

                            <Divider sx={{ borderStyle: 'dashed' }} />

                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontFamily: 'monospace' }}
                            >
                              Formula: (₹30,000 ÷ 26) × 24 = ₹27,692
                            </Typography>
                          </Stack>
                        </Card>
                      </Stack>
                    </Paper>
                  </Grid>

                  {/* Option 2: Total Month Days */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper
                      component="div"
                      onClick={() => formik.setFieldValue('dayCalculationType', 'total-days')}
                      sx={{
                        p: 3,
                        cursor: 'pointer',
                        height: '100%',
                        position: 'relative',
                        borderRadius: 2,
                        border: '2px solid',
                        borderColor:
                          formik.values.dayCalculationType === 'total-days'
                            ? 'primary.main'
                            : 'divider',
                        bgcolor:
                          formik.values.dayCalculationType === 'total-days'
                            ? alpha(theme.palette.primary.main, 0.04)
                            : 'transparent',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          bgcolor:
                            formik.values.dayCalculationType === 'total-days'
                              ? alpha(theme.palette.primary.main, 0.08)
                              : alpha(theme.palette.grey[500], 0.08),
                        },
                      }}
                    >
                      <Stack spacing={2}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: 1,
                              bgcolor: 'action.selected',
                              color: 'text.secondary',
                              display: 'flex',
                            }}
                          >
                            <Iconify icon="fluent:calendar-month-24-regular" width={24} />
                          </Box>
                          <Typography variant="subtitle1" fontWeight={700}>
                            Total days
                          </Typography>
                          {formik.values.dayCalculationType === 'total-days' && (
                            <Iconify
                              icon="eva:checkmark-circle-2-fill"
                              color="primary.main"
                              width={24}
                              sx={{ ml: 'auto' }}
                            />
                          )}
                        </Box>

                        <Typography variant="body2" color="text.secondary">
                          Salary is calculated based on total calendar days in the month (or a fixed
                          manual count)
                        </Typography>

                        <Box
                          sx={{
                            py: 0.5,
                            px: 1.5,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            borderRadius: 0.5,
                            width: 'fit-content',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          <Iconify icon="mdi:calendar-check" width={16} />
                          Best for fixed monthly payroll
                        </Box>
                        <Stack spacing={2}>
                          {/* Toggle Row */}
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography
                              variant="subtitle2"
                              color={
                                formik.values.totalDayType === 'total-month-days'
                                  ? 'text.primary'
                                  : 'text.secondary'
                              }
                            >
                              Total Month Days
                            </Typography>

                            <Switch
                              checked={formik.values.totalDayType === 'manual-days'}
                              onChange={(e) =>
                                formik.setFieldValue(
                                  'totalDayType',
                                  e.target.checked ? 'manual-days' : 'total-month-days'
                                )
                              }
                            />

                            <Typography
                              variant="subtitle2"
                              color={
                                formik.values.totalDayType === 'manual-days'
                                  ? 'text.primary'
                                  : 'text.secondary'
                              }
                            >
                              Manual Days
                            </Typography>
                          </Stack>

                          {/* Manual Days Input */}
                          {formik.values.totalDayType === 'manual-days' && (
                            <Box
                              sx={{
                                maxWidth: 320,
                                animation: 'fadeIn 0.25s ease-in-out',
                                '@keyframes fadeIn': {
                                  '0%': { opacity: 0, transform: 'translateY(-6px)' },
                                  '100%': { opacity: 1, transform: 'translateY(0)' },
                                },
                              }}
                            >
                              <TextField
                                fullWidth
                                size="small"
                                name="manualDays"
                                label="Manual Days *"
                                type="number"
                                value={formik.values.manualDays}
                                onChange={(e) => {
                                  const { value } = e.target;

                                  if (value === '') {
                                    formik.setFieldValue('manualDays', value);
                                    return;
                                  }

                                  const numericValue = Number(value);
                                  if (
                                    Number.isInteger(numericValue) &&
                                    numericValue >= 0 &&
                                    numericValue <= 31
                                  ) {
                                    formik.setFieldValue('manualDays', numericValue);
                                  }
                                }}
                                onBlur={formik.handleBlur}
                                error={!!(formik.touched.manualDays && formik.errors.manualDays)}
                                helperText={formik.touched.manualDays && formik.errors.manualDays}
                                inputProps={{ min: 0, max: 31 }}
                              />
                            </Box>
                          )}
                        </Stack>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Scrollbar>

          <DialogActions>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleReset}
              size="small"
              startIcon={<Iconify icon={GlobalIcons.resetIcon} />}
            >
              Reset
            </Button>
            <LoadingButton
              variant="contained"
              type="submit"
              size="small"
              loading={saveDayCalculationSettingsLoading}
              startIcon={<Iconify icon="mdi:content-save" />}
            >
              Submit
            </LoadingButton>
          </DialogActions>
        </form>
      </Card>
    </Box>
  );
};

export default PayrollConfiguration;
