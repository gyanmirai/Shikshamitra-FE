'use client';

import React from 'react';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { varAlpha } from 'src/theme/styles/utils';
import { Box, Grid, Card, Button } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { getSecurityReportsInitialValues } from './initialValue';
import { securityReportsValidationSchema } from './validationSchema';

const SecurityReportsScreen = () => {
  const formik = useFormik({
    initialValues: getSecurityReportsInitialValues(),
    validationSchema: securityReportsValidationSchema,
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
  });

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Reports"
        links={[{ name: 'Security' }, { name: 'Reports' }]}
        sx={{ mb: 2 }}
      />

      <form onSubmit={formik.handleSubmit}>
        <Card sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {/* Report Dropdown */}
            <Grid size={{ xs: 12, md: 4, sm: 6 }}>
              <CustomSelect
                label="List of Reports"
                name="report"
                options={[]} // Add report options
                value={formik.values.report}
                onChange={(val) => formik.setFieldValue('report', val)}
                formControlProps={{ fullWidth: true }}
                error={formik.touched.report && Boolean(formik.errors.report)}
                helperText={
                  formik.touched.report && formik.errors.report ? String(formik.errors.report) : ''
                }
              />
            </Grid>

            {/* Start Date */}
            <Grid size={{ xs: 12, md: 4, sm: 6 }}>
              <DatePicker
                label="Start Date"
                format="DD-MM-YYYY"
                value={formik.values.startDate ? dayjs(formik.values.startDate) : null}
                onChange={(date) =>
                  formik.setFieldValue('startDate', date ? date.toISOString() : null)
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    error: formik.touched.startDate && Boolean(formik.errors.startDate),
                    helperText:
                      formik.touched.startDate && formik.errors.startDate
                        ? String(formik.errors.startDate)
                        : '',
                  },
                }}
              />
            </Grid>

            {/* End Date */}
            <Grid size={{ xs: 12, md: 4, sm: 6 }}>
              <DatePicker
                label="End Date"
                format="DD-MM-YYYY"
                value={formik.values.endDate ? dayjs(formik.values.endDate) : null}
                onChange={(date) =>
                  formik.setFieldValue('endDate', date ? date.toISOString() : null)
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    error: formik.touched.endDate && Boolean(formik.errors.endDate),
                    helperText:
                      formik.touched.endDate && formik.errors.endDate
                        ? String(formik.errors.endDate)
                        : '',
                  },
                }}
              />
            </Grid>

            {/* Action Buttons */}
            <Grid size={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  startIcon={<Iconify icon="ion:download" />}
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    console.log('Download PDF clicked', formik.values);
                  }}
                  sx={{
                    backgroundColor: (theme) =>
                      varAlpha(theme.vars.palette.primary.mainChannel, 0.1),
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: (theme) =>
                        varAlpha(theme.vars.palette.primary.mainChannel, 0.1),
                    },
                  }}
                >
                  Download PDF
                </Button>

                <Button
                  startIcon={<Iconify icon="ion:download" />}
                  variant="contained"
                  color="warning"
                  onClick={() => {
                    console.log('Download Excel clicked', formik.values);
                  }}
                  sx={{
                    backgroundColor: (theme) =>
                      varAlpha(theme.vars.palette.warning.mainChannel, 0.1),
                    color: 'warning.main',
                    '&:hover': {
                      backgroundColor: (theme) =>
                        varAlpha(theme.vars.palette.warning.mainChannel, 0.1),
                    },
                  }}
                >
                  Download Excel
                </Button>

                <Button
                  startIcon={<Iconify icon="ion:print" />}
                  variant="contained"
                  color="secondary"
                  type="submit"
                  sx={{
                    backgroundColor: (theme) =>
                      varAlpha(theme.vars.palette.secondary.mainChannel, 0.1),
                    color: 'secondary.main',
                    '&:hover': {
                      backgroundColor: (theme) =>
                        varAlpha(theme.vars.palette.secondary.mainChannel, 0.1),
                    },
                  }}
                >
                  Generate Report
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Card>
      </form>
    </Box>
  );
};

export default SecurityReportsScreen;
