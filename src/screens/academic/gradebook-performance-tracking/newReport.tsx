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

const initialValues = {
  report: '',
  className: '',
  division: '',
  students: [],
  subject: '',
  assignmentType: '',
  assignmentTitle: '',
  startDate: null,
  endDate: null,
};

const validationSchema = Yup.object().shape({
  report: Yup.string().required('Report is required'),
  className: Yup.string().required('Class is required'),
  division: Yup.string().required('Division is required'),
  students: Yup.array(),
  subject: Yup.string().required('Subject is required'),
  assignmentType: Yup.string(),
  assignmentTitle: Yup.string(),
  startDate: Yup.string().required('Start date is required'),
  endDate: Yup.string().required('End date is required'),
});

const Reports = (props: TabComponentType) => {
  const [classes, setClasses] = useState<string>('');
  const [division, setDivision] = useState<string>('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);

  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  //   const classOptions = React.useMemo(() => {
  //     const allOption = { name: 'All', value: 'all' };
  //     return [allOption, ...(classData?.items || [])];
  //   }, [classData]);

  return (
    <Box>
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
                            value: 'student progress report',
                            label: 'Student Progress Report',
                          },
                          {
                            value: 'gradebook audit report',
                            label: 'Gradebook Audit Report',
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
                        onChange={(val) => {
                          const selectedClass: Standards = classData.items.find(
                            (i: Standards) => i.id === val
                          );
                          setClasses(val as string);
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
                        // disabled={!values.className}
                        labelKey="name"
                        valueKey="id"
                        options={divisionOptions}
                        value={division}
                        onChange={(val) => {
                          const selectedDivision = divisionOptions.find((i: Division) =>
                            val.includes(i.id)
                          );
                          setFieldValue('division', selectedDivision?.name || '');
                          setDivision(val as string);
                        }}
                        formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                      />
                    </Field>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Field as={FormControl} error={touched.students && errors.students} fullWidth>
                      <CustomSelect
                        label="Students"
                        name="students"
                        multiple
                        options={[
                          { id: '1', name: 'John Smith' },
                          { id: '2', name: 'Emma Wilson' },
                          { id: '3', name: 'Michael Brown' },
                          { id: '4', name: 'Sarah Davis' },
                          { id: '5', name: 'James Johnson' },
                        ]}
                        labelKey="name"
                        valueKey="id"
                        // disabled={!values.division}
                        value={values.students}
                        onChange={(value) => setFieldValue('students', value)}
                        formControlProps={{ sx: { minWidth: '200px', width: '100%' } }}
                      />
                      <FormHelperText>{touched.students && errors.students}</FormHelperText>
                    </Field>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Field as={FormControl} error={touched.subject && errors.subject} fullWidth>
                      <CustomSelect
                        label="Subject"
                        name="subject"
                        // disabled={!values.division}
                        options={[
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
                    <Field
                      as={FormControl}
                      error={touched.assignmentType && errors.assignmentType}
                      fullWidth
                    >
                      <CustomSelect
                        label="Assignment Type"
                        name="assignmentType"
                        // disabled={!values.subject}
                        options={[
                          { value: 'homework', label: 'Homework' },
                          { value: 'quiz', label: 'Quiz' },
                          { value: 'exam', label: 'Exam' },
                        ]}
                        formControlProps={{ sx: { minWidth: '200px', width: '100%' } }}
                        value={values.assignmentType}
                        onChange={(value) => setFieldValue('assignmentType', value)}
                      />
                      <FormHelperText>
                        {touched.assignmentType && errors.assignmentType}
                      </FormHelperText>
                    </Field>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Field
                      as={FormControl}
                      error={touched.assignmentTitle && errors.assignmentTitle}
                      fullWidth
                    >
                      <CustomSelect
                        label="Assignment Title"
                        name="assignmentTitle"
                        // disabled={!values.assignmentType}
                        options={[
                          { value: 'Chapter 1 Quiz', label: 'Chapter 1 Quiz' },
                          { value: 'Chapter 2 Quiz', label: 'Chapter 2 Quiz' },
                          { value: 'Chapter 3 Quiz', label: 'Chapter 3 Quiz' },
                        ]}
                        formControlProps={{ sx: { minWidth: '200px', width: '100%' } }}
                        value={values.assignmentTitle}
                        onChange={(value) => setFieldValue('assignmentTitle', value)}
                      />
                      <FormHelperText>
                        {touched.assignmentTitle && errors.assignmentTitle}
                      </FormHelperText>
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
