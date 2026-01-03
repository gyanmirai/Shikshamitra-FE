'use client';

import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  Box,
  Card,
  Grid,
  Radio,
  Stack,
  Switch,
  Button,
  TextField,
  Typography,
  RadioGroup,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

const PayrollConfiguration = () => {
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
    onSubmit: (values) => {
      // eslint-disable-next-line no-console
      console.log('Form Values:', values);
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
          { name: 'HR', href: '/hr/dashboard' },
          { name: 'Payroll', href: '/hr/payroll/dashboard' },
          { name: 'Setting', href: '/hr/payroll/setting/earning' },
          { name: 'Payroll Configuration' },
        ]}
        sx={{ mb: 2 }}
      />

      <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
        <Box display="flex" flexDirection="column" height="100%">
          <form
            onSubmit={formik.handleSubmit}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <Scrollbar sx={{ p: 2, flexGrow: 1 }}>
              <Card sx={{ boxShadow: 'var(--shadows-4)', mb: 2, p: 2 }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Select Day Calculation Method
                </Typography>

                <RadioGroup
                  value={formik.values.dayCalculationType}
                  onChange={(e) => formik.setFieldValue('dayCalculationType', e.target.value)}
                >
                  <Box
                    display="grid"
                    gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}
                    gap={2}
                    mt={1}
                  >
                    {[
                      {
                        value: 'working-days',
                        label: 'According to working days',
                        tooltip: 'Calculate payroll based on actual working days in the month.',
                      },
                      {
                        value: 'total-days',
                        label: 'Total days',
                        tooltip: 'Calculate payroll based on total days (calendar days or manual).',
                      },
                    ].map((option) => (
                      <Box
                        key={option.value}
                        onClick={() => formik.setFieldValue('dayCalculationType', option.value)}
                        sx={{
                          border: '1px solid',
                          borderColor:
                            formik.values.dayCalculationType === option.value
                              ? 'primary.main'
                              : 'divider',
                          borderRadius: 1,
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: 'action.hover' },
                        }}
                      >
                        <FormControlLabel
                          value={option.value}
                          control={
                            <Radio checked={formik.values.dayCalculationType === option.value} />
                          }
                          label={option.label}
                          sx={{ pointerEvents: 'none' }}
                        />
                      </Box>
                    ))}
                  </Box>
                </RadioGroup>

                {formik.values.dayCalculationType === 'total-days' && (
                  <Box mt={4}>
                    <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                      <Typography variant="subtitle1">Total Month Days</Typography>
                      <Switch
                        checked={formik.values.totalDayType === 'manual-days'}
                        onChange={(e) =>
                          formik.setFieldValue(
                            'totalDayType',
                            e.target.checked ? 'manual-days' : 'total-month-days'
                          )
                        }
                      />
                      <Typography variant="subtitle1">Manual Days</Typography>
                    </Stack>

                    {formik.values.totalDayType === 'manual-days' && (
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <ShakingTextField
                            error={!!(formik.touched.manualDays && formik.errors.manualDays)}
                          >
                            <TextField
                              size="small"
                              fullWidth
                              name="manualDays"
                              type="number"
                              label="Manual Days *"
                              value={formik.values.manualDays}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              error={!!(formik.touched.manualDays && formik.errors.manualDays)}
                              helperText={formik.touched.manualDays && formik.errors.manualDays}
                            />
                          </ShakingTextField>
                        </Grid>
                      </Grid>
                    )}
                  </Box>
                )}
              </Card>
            </Scrollbar>

            <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleReset}
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

export default PayrollConfiguration;
