'use client';

import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import * as Yup from 'yup';
import React, { useState } from 'react';
import { Form, Field, Formik } from 'formik';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Card, Button, FormControl, FormHelperText } from '@mui/material';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const initialValues = {
  report: '',
  className: '',
  division: '',
  student: '',
  startDate: null,
  endDate: null,
};

const validationSchema = Yup.object().shape({
  report: Yup.string().required('Report is required'),
  className: Yup.string().required('Class is required'),
  division: Yup.string().required('Division is required'),
  student: Yup.string().required('Student is required'),
  startDate: Yup.string().required('Startdate is required'),
  endDate: Yup.string().required('EndDate Type is required'),
});

const Reports = (props: TabComponentType) => {
  const [classes, setClasses] = useState<string>('');
  const [division, setDivision] = useState<string>('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);

  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Reports"
        links={[
          { name: 'Academic and Assignment' },
          { name: 'Student Progress Analytics' },
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
                            value: 'Class Progress Report',
                            label: 'Class Progress Report',
                          },
                          {
                            value: 'Student Progress Report',
                            label: 'Student Progress Report',
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
                        options={classData?.items || []}
                        labelKey="name"
                        valueKey="id"
                        value={classes}
                        onChange={(value) => {
                          const selectedClass: Standards = classData.items.find(
                            (i: Standards) => i.id === value
                          );
                          setClasses(value as string);
                          setFieldValue('className', selectedClass?.name || '');
                          setDivisionOptions(selectedClass?.divisions || []);
                        }}
                        formControlProps={{ sx: { minWidth: '200px', width: '100%' } }}
                      />
                      <FormHelperText>{touched.className && errors.className}</FormHelperText>
                    </Field>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Field as={FormControl} error={touched.division && errors.division} fullWidth>
                      <CustomSelect
                        label="Division"
                        disabled={!values.className}
                        labelKey="name"
                        valueKey="id"
                        options={divisionOptions}
                        value={division}
                        onChange={(val) => {
                          const selectedDivision = divisionOptions.find(
                            (i: Division) => val === i.id
                          );
                          setFieldValue('division', selectedDivision?.name || '');
                          setDivision(val as string);
                        }}
                        formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                      />
                      <FormHelperText>{touched.division && errors.division}</FormHelperText>
                    </Field>
                  </Grid>

                  {values.report === 'Student Progress Report' && (
                    <Grid item xs={12} sm={6} md={4}>
                      <Field as={FormControl} error={touched.student && errors.student} fullWidth>
                        <CustomSelect
                          label="Select Student"
                          disabled={!values.division}
                          options={[
                            { value: 'student1', label: 'Student 1' },
                            { value: 'student2', label: 'Student 2' },
                            { value: 'student3', label: 'Student 3' },
                          ]}
                          value={values.student}
                          onChange={(val) => {
                            setFieldValue('student', val);
                          }}
                          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                        />
                        <FormHelperText>{touched.division && errors.division}</FormHelperText>
                      </Field>
                    </Grid>
                  )}

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
