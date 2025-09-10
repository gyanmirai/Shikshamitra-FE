'use client';

import React from 'react';
import * as Yup from 'yup';
import { Form, Field, Formik } from 'formik';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { varAlpha } from 'src/theme/styles/utils';
import CustomSelect from 'src/components/custom-select';
import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Grid, Card, Button, FormControl, FormHelperText } from '@mui/material';

const initialValues = {
  report: '',
  className: 'All',
  vehicle: 'All',
  driver: 'All',
  startDate: null,
  endDate: null,
};

const validationSchema = Yup.object().shape({
  report: Yup.string().required('Report is required'),
  className: Yup.string().required('Class is required'),
  vehicle: Yup.string().required('Vehicle is required'),
  driver: Yup.string().required('Driver is required'),
  startDate: Yup.string().required('Start date is required'),
  endDate: Yup.string().required('End date is required'),
});

const TransportReportsScreen = () => {
  const { data: classData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const classOptions = React.useMemo(() => {
    const allOption = { name: 'All', value: 'all' };
    return [allOption, ...(classData?.items || [])];
  }, [classData]);

  const vehicleOptions = React.useMemo(() => {
    const allOption = { name: 'All', value: 'all' };
    return [allOption /* additional vehicle data here */];
  }, []);

  const driverOptions = React.useMemo(() => {
    const allOption = { name: 'All', value: 'all' };
    return [allOption /* additional driver data here */];
  }, []);

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Transport Reports"
        links={[{ name: 'Transport' }, { name: 'Reports' }]}
        sx={{ px: 1, mb: 2 }}
      />

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            alert(JSON.stringify(values, null, 2));
            setSubmitting(false);
          }, 400);
        }}
      >
        {({ errors, touched, values, handleChange, setFieldValue }) => (
          <Card>
            <Form>
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Field as={FormControl} error={touched.report && errors.report} fullWidth>
                      <CustomSelect
                        label="Report Type"
                        name="report"
                        options={[
                          { value: 'tripReports', label: 'Trip Reports' },
                          { value: 'vehicleStatus', label: 'Vehicle Status' },
                          { value: 'driverPerformance', label: 'Driver Performance' },
                        ]}
                        formControlProps={{ sx: { minWidth: '200px', width: '100%' } }}
                        value={values.report}
                        onChange={(value) => setFieldValue('report', value)}
                      />
                      <FormHelperText>{touched.report && errors.report}</FormHelperText>
                    </Field>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Field as={FormControl} error={touched.startDate && errors.startDate} fullWidth>
                      <DatePicker
                        label="Start Date"
                        name="startDate"
                        value={values.startDate}
                        onChange={(date) => setFieldValue('startDate', date)}
                        format="DD-MM-YYYY"
                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                      />
                      <FormHelperText>{touched.startDate && errors.startDate}</FormHelperText>
                    </Field>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Field as={FormControl} error={touched.endDate && errors.endDate} fullWidth>
                      <DatePicker
                        label="End Date"
                        name="endDate"
                        value={values.endDate}
                        onChange={(date) => setFieldValue('endDate', date)}
                        format="DD-MM-YYYY"
                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                      />
                      <FormHelperText>{touched.endDate && errors.endDate}</FormHelperText>
                    </Field>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Field as={FormControl} error={touched.className && errors.className} fullWidth>
                      <CustomSelect
                        label="Class"
                        name="className"
                        options={classOptions}
                        labelKey="name"
                        valueKey="name"
                        value={values.className}
                        onChange={(value) => setFieldValue('className', value)}
                        formControlProps={{ sx: { minWidth: '200px', width: '100%' } }}
                      />
                      <FormHelperText>{touched.className && errors.className}</FormHelperText>
                    </Field>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Field as={FormControl} error={touched.vehicle && errors.vehicle} fullWidth>
                      <CustomSelect
                        label="Vehicle"
                        name="vehicle"
                        options={vehicleOptions}
                        value={values.vehicle}
                        onChange={(value) => setFieldValue('vehicle', value)}
                        formControlProps={{ sx: { minWidth: '200px', width: '100%' } }}
                      />
                      <FormHelperText>{touched.vehicle && errors.vehicle}</FormHelperText>
                    </Field>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Field as={FormControl} error={touched.driver && errors.driver} fullWidth>
                      <CustomSelect
                        label="Driver"
                        name="driver"
                        options={driverOptions}
                        value={values.driver}
                        onChange={(value) => setFieldValue('driver', value)}
                        formControlProps={{ sx: { minWidth: '200px', width: '100%' } }}
                      />
                      <FormHelperText>{touched.driver && errors.driver}</FormHelperText>
                    </Field>
                  </Grid>

                  <Grid size={12} justifyContent="flex-end" display="flex" gap={3}>
                    <Button
                      startIcon={<Iconify icon="ion:download" />}
                      variant="contained"
                      color="primary"
                      sx={{
                        backgroundColor: (theme) =>
                          varAlpha(theme.vars.palette.primary.mainChannel, 0.1),
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: (theme) =>
                            varAlpha(theme.vars.palette.primary.mainChannel, 0.2),
                        },
                      }}
                    >
                      Download PDF
                    </Button>

                    <Button
                      startIcon={<Iconify icon="ion:download" />}
                      variant="contained"
                      color="warning"
                      sx={{
                        backgroundColor: (theme) =>
                          varAlpha(theme.vars.palette.warning.mainChannel, 0.1),
                        color: 'warning.main',
                        '&:hover': {
                          backgroundColor: (theme) =>
                            varAlpha(theme.vars.palette.warning.mainChannel, 0.2),
                        },
                      }}
                    >
                      Download Excel
                    </Button>

                    <Button
                      startIcon={<Iconify icon="ion:print" />}
                      variant="contained"
                      color="secondary"
                      sx={{
                        backgroundColor: (theme) =>
                          varAlpha(theme.vars.palette.secondary.mainChannel, 0.1),
                        color: 'secondary.main',
                        '&:hover': {
                          backgroundColor: (theme) =>
                            varAlpha(theme.vars.palette.secondary.mainChannel, 0.2),
                        },
                      }}
                    >
                      Print
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Form>
          </Card>
        )}
      </Formik>
    </Box>
  );
};

export default TransportReportsScreen;
