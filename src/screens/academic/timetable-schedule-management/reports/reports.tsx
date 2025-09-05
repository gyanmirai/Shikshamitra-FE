'use client';

import type { Division } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';
import { Form, Field, Formik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import { Iconify } from 'src/components/iconify/iconify';
import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Card, Grid, Button, FormControl, FormHelperText } from '@mui/material';

import { initialValues } from './initialValues';

const Reports = (props: TabComponentType) => {
  // State for managing selected class
  const [classes, setClasses] = useState<string>('');

  // State for managing selected subject
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  // State for managing selected teacher
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');

  // State for managing selected division
  const [division, setDivision] = useState<any>([]);

  // State for storing division options
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);

  // Fetch class data using custom query hook
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  // Memoized class options with 'All' option added
  const classOptions = React.useMemo(() => {
    const allOption = { name: 'All', value: 'all' };
    return [allOption, ...(classData?.items || [])];
  }, [classData]);

  // Memoized division options with 'All' option added
  const fullDivisionOptions = React.useMemo(() => {
    const allOption = { name: 'All', id: 'all' };
    return [allOption, ...divisionOptions];
  }, [divisionOptions]);

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Reports"
        description="Generate reports for timetable schedules, conflicts, and statistics"
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Time Table', href: '/academic/timeTableDashboard' },
          { name: 'Reports' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box display="flex" flexDirection="column" justifyContent="space-between">
        <Formik
          initialValues={initialValues}
          // validationSchema={validationSchema}
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
                          label="List of Reports"
                          name="report"
                          options={[
                            { value: 'Statistics Report', label: 'Statistics Report' },
                            { value: 'Conflict Report', label: 'Conflict Report' },
                          ]}
                          formControlProps={{ sx: { minWidth: '200px', width: '100%' } }}
                          value={values.report}
                          onChange={(value) => setFieldValue('report', value)}
                        />
                        <FormHelperText>{touched.report && errors.report}</FormHelperText>
                      </Field>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Field as={FormControl} error={touched.teacher && errors.teacher} fullWidth>
                        <CustomSelect
                          label="Teacher"
                          options={[
                            { value: 'Jiya', label: 'Jiya' },
                            { value: 'Riya', label: 'Riya' },
                            { value: 'Priya', label: 'Priya' },
                          ]}
                          name="teacher"
                          value={values.teacher}
                          formControlProps={{ sx: { minWidth: 180, width: '100%' } }}
                          onChange={(val) => setFieldValue('teacher', val)}
                        />
                        <FormHelperText>{touched.teacher && errors.teacher}</FormHelperText>
                      </Field>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Field
                        as={FormControl}
                        error={touched.className && errors.className}
                        fullWidth
                      >
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
                      <Field as={FormControl} error={touched.division && errors.division} fullWidth>
                        <CustomSelect
                          label="Division"
                          name="division"
                          disabled={!values.className}
                          labelKey="name"
                          valueKey="name"
                          options={fullDivisionOptions}
                          value={values.division}
                          onChange={(value) => setFieldValue('division', value)}
                          formControlProps={{ sx: { minWidth: 140 } }}
                        />
                        <FormHelperText>{touched.division && errors.division}</FormHelperText>
                      </Field>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Field
                        as={FormControl}
                        error={touched.startDate && errors.startDate}
                        fullWidth
                      >
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

                    <Grid size={{ xs: 12 }} display="flex" justifyContent="flex-end">
                      <Button
                        startIcon={<Iconify icon={GlobalIcons.generateReport} />}
                        type="submit"
                        variant="contained"
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
    </Box>
  );
};

export default Reports;
