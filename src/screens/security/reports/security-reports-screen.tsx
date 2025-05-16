'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';
import * as Yup from 'yup';
import { Form, Field, Formik } from 'formik';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Card, Button, FormControl, FormHelperText } from '@mui/material';

import { varAlpha } from 'src/theme/styles/utils';
import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const initialValues = {
  report: '',
  className: 'All',
  subject: 'All',
  startDate: null,
  endDate: null,
};

const validationSchema = Yup.object().shape({
  report: Yup.string().required('Report is required'),

  startDate: Yup.string().required('Startdate is required'),
  endDate: Yup.string().required('EndDate Type is required'),
});

const SecurityReportsScreen = (props: TabComponentType) => {
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Reports"
        links={[{ name: 'Finance' }, { name: 'Reports' }]}
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
                  <Grid item xs={12} sm={6} md={4}>
                    <Field as={FormControl} error={touched.report && errors.report} fullWidth>
                      <CustomSelect
                        label="List of Reports"
                        name="report"
                        options={[]}
                        formControlProps={{ sx: { minWidth: '200px', width: '100%' } }}
                        value={values.report}
                        onChange={(value) => setFieldValue('report', value)}
                      />
                      <FormHelperText>{touched.report && errors.report}</FormHelperText>
                    </Field>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
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

                  <Grid item xs={12} sm={6} md={4}>
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

                  <Grid item xs={12} justifyContent="flex-end" display="flex" gap={3}>
                    <Button
                      startIcon={<Iconify icon="ion:download" />}
                      variant="contained"
                      color="primary"
                      sx={{
                        backgroundColor: (theme) =>
                          varAlpha(theme.palette.primary.mainChannel, 0.1),
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: (theme) =>
                            varAlpha(theme.palette.primary.mainChannel, 0.1),
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
                          varAlpha(theme.palette.warning.mainChannel, 0.1),
                        color: 'warning.main',
                        '&:hover': {
                          backgroundColor: (theme) =>
                            varAlpha(theme.palette.warning.mainChannel, 0.1),
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
                          varAlpha(theme.palette.secondary.mainChannel, 0.1),
                        color: 'secondary.main',
                        '&:hover': {
                          backgroundColor: (theme) =>
                            varAlpha(theme.palette.secondary.mainChannel, 0.1),
                        },
                      }}
                    >
                      Generate Report
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

export default SecurityReportsScreen;
