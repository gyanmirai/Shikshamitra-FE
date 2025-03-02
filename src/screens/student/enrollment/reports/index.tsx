'use client';

import * as Yup from 'yup';
import React, { useState } from 'react';
import { Form, Field, Formik } from 'formik';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Grid,
  Card,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
} from '@mui/material';

import { convertBase64Format } from 'src/utils/base64Formate';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { StudentEnrollmentReportTypeOptions } from 'src/enums/report-type';
import { useGenerateReportMutation } from 'src/redux/student/student-enrollment-report/student-enrollemt-report';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const validationSchema = Yup.object().shape({
  report: Yup.string().required('Report is required'),
  department: Yup.string().required('Department is required'),
  status: Yup.string().required('Status is required'),
  designation: Yup.string().required('Designation is required'),
  employeeType: Yup.string().required('Employee Type is required'),
  employeeGroup: Yup.string().required('Employee Group is required'),
  gender: Yup.string().required('Gender is required'),
});

const initialValues = {
  department: 'all',
  status: 'all',
  designation: 'all',
  employeeType: 'all',
  employeeGroup: 'all',
  gender: 'all',
  report: '',
};

const StudentReportsScreen = () => {
  const [generateReport, { isLoading }] = useQueryAndMutation({
    currentQueryAndMutation: useGenerateReportMutation,
    type: 'mutation',
  });

  const [pdfBase64, setPdfBase64] = useState<string | null>(null);

  return (
    <Box sx={{ height: '100%' }}>
      <CustomBreadcrumbs
        heading="Reports"
        links={[{ name: 'Student' }, { name: 'Student Enrollment' }, { name: 'Reports' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <Formik
        initialValues={initialValues}
        // validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          console.log(values, '---->');
          const resp = await generateReport(values.report).unwrap();
          console.log('🚀 ~ onSubmit={async ~ resp:', resp);
          setPdfBase64(convertBase64Format(resp.fileContent));
        }}
      >
        {({ errors, touched, values, handleChange }) => (
          <Card>
            <Form>
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Field as={FormControl} error={touched.report && errors.report} fullWidth>
                      <InputLabel size="small">List of reports</InputLabel>
                      <Select
                        name="report"
                        value={values.report}
                        onChange={handleChange}
                        label="List of reports"
                        size="small"
                      >
                        {StudentEnrollmentReportTypeOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>{touched.report && errors.report}</FormHelperText>
                    </Field>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Field
                      as={FormControl}
                      error={touched.department && errors.department}
                      fullWidth
                    >
                      <InputLabel size="small">Department</InputLabel>
                      <Select
                        name="department"
                        value={values.department}
                        onChange={handleChange}
                        label="Department"
                        size="small"
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="teachers">Teachers</MenuItem>
                        <MenuItem value="activity">Activity</MenuItem>
                      </Select>
                      <FormHelperText>{touched.department && errors.department}</FormHelperText>
                    </Field>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Field as={FormControl} error={touched.status && errors.status} fullWidth>
                      <InputLabel size="small">Status</InputLabel>
                      <Select
                        name="status"
                        value={values.status}
                        onChange={handleChange}
                        label="Status"
                        size="small"
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="left">Left</MenuItem>
                        <MenuItem value="suspended">Suspended</MenuItem>
                        <MenuItem value="retired">Retired</MenuItem>
                      </Select>
                      <FormHelperText>{touched.status && errors.status}</FormHelperText>
                    </Field>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Field
                      as={FormControl}
                      error={touched.designation && errors.designation}
                      fullWidth
                    >
                      <InputLabel size="small">Designation</InputLabel>
                      <Select
                        name="designation"
                        value={values.designation}
                        onChange={handleChange}
                        label="Designation"
                        size="small"
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="principal">Principal</MenuItem>
                        <MenuItem value="clerk">Clerk</MenuItem>
                        <MenuItem value="director">Director</MenuItem>
                        <MenuItem value="peon">Peon</MenuItem>
                        <MenuItem value="receptionist">Receptionist</MenuItem>
                        <MenuItem value="clerk">Clerk</MenuItem>
                      </Select>
                      <FormHelperText>{touched.designation && errors.designation}</FormHelperText>
                    </Field>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Field
                      as={FormControl}
                      error={touched.employeeType && errors.employeeType}
                      fullWidth
                    >
                      <InputLabel size="small">Employee Type</InputLabel>
                      <Select
                        name="employeeType"
                        value={values.employeeType}
                        onChange={handleChange}
                        label="Employee Type"
                        size="small"
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="consultant">Consultant / Advisor</MenuItem>
                        <MenuItem value="probationer">Probationers</MenuItem>
                        <MenuItem value="regular">Regular</MenuItem>
                      </Select>
                      <FormHelperText>{touched.employeeType && errors.employeeType}</FormHelperText>
                    </Field>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Field
                      as={FormControl}
                      error={touched.employeeGroup && errors.employeeGroup}
                      fullWidth
                    >
                      <InputLabel size="small">Employee Group</InputLabel>
                      <Select
                        name="employeeGroup"
                        value={values.employeeGroup}
                        onChange={handleChange}
                        label="Employee Group"
                        size="small"
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="teaching">Teaching</MenuItem>
                        <MenuItem value="non-teaching">Non Teaching</MenuItem>
                      </Select>
                      <FormHelperText>
                        {touched.employeeGroup && errors.employeeGroup}
                      </FormHelperText>
                    </Field>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Field as={FormControl} error={touched.gender && errors.gender} fullWidth>
                      <InputLabel size="small">Gender</InputLabel>
                      <Select
                        name="gender"
                        value={values.gender}
                        onChange={handleChange}
                        label="Gender"
                        size="small"
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                      <FormHelperText>{touched.gender && errors.gender}</FormHelperText>
                    </Field>
                  </Grid>
                  <Grid item xs={12} justifyContent="flex-end" display="flex">
                    <LoadingButton loading={isLoading} type="submit" variant="contained">
                      Generate Report
                    </LoadingButton>
                  </Grid>
                </Grid>
              </Box>
            </Form>
          </Card>
        )}
      </Formik>

      {pdfBase64 && <iframe src={pdfBase64} width="100%" height="100%" title="Generated Report" />}
    </Box>
  );
};
export default StudentReportsScreen;
