'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';
import * as Yup from 'yup';
import { Form, Field, Formik } from 'formik';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Card, Button, FormControl, FormHelperText } from '@mui/material';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

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
  className: Yup.string().required('Class is required'),
  subject: Yup.string().required('Subject is required'),
  startDate: Yup.string().required('Startdate is required'),
  endDate: Yup.string().required('EndDate Type is required'),
});

const Reports = (props: TabComponentType) => {
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const classOptions = React.useMemo(() => {
    const allOption = { name: 'All', value: 'all' };
    return [allOption, ...(classData?.items || [])];
  }, [classData]);

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Reports"
        links={[
          { name: 'Academic and Assignment' },
          { name: 'Curriculum Management' },
          { name: 'Reports' },
        ]}
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
                        options={[
                          {
                            value: 'Curriculum Progress Report',
                            label: 'Curriculum Progress Report',
                          },
                          {
                            value: 'Curriculum Topic Completion Report',
                            label: 'Curriculum Topic Completion Report',
                          },
                          {
                            value: 'Curriculum Teacher Assignment Report',
                            label: 'Curriculum Teacher Assignment Report',
                          },
                        ]}
                        formControlProps={{ sx: { minWidth: '200px', width: '100%' } }}
                        value={values.report}
                        onChange={(value) => setFieldValue('report', value)}
                      />
                      <FormHelperText>{touched.report && errors.report}</FormHelperText>
                    </Field>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
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

                  <Grid item xs={12} sm={6} md={4}>
                    <Field as={FormControl} error={touched.subject && errors.subject} fullWidth>
                      <CustomSelect
                        label="Subject"
                        name="subject"
                        options={[
                          { value: 'All', label: 'All' },
                          { value: 'Math', label: 'Math' },
                          { value: 'English', label: 'English' },
                          { value: 'Science', label: 'Science' },
                        ]}
                        formControlProps={{ sx: { minWidth: '200px', width: '100%' } }}
                        value={values.subject}
                        onChange={(value) => setFieldValue('subject', value)}
                      />
                      <FormHelperText>{touched.subject && errors.subject}</FormHelperText>
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
                  <Grid item xs={12} justifyContent="flex-end" display="flex">
                    <Button type="submit" variant="contained">
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

export default Reports;
