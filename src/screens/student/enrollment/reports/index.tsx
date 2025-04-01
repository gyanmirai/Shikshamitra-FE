'use client';

import * as Yup from 'yup';
import React, { useState } from 'react';
import { Form, Field, Formik } from 'formik';

import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers';
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
  inquiryStatus: Yup.string().required('inquiryStatus is required'),
  designation: Yup.string().required('Designation is required'),
  employeeType: Yup.string().required('Employee Type is required'),
  employeeGroup: Yup.string().required('Employee Group is required'),
  gender: Yup.string().required('Gender is required'),
});

const initialValues = {
  report: '',
  viewMode: 'pdf',
  board: '',
  medium: '',
  department: 'all',
  class: '',
  fromInquiryNumber: '',
  toInquiryNumber: '',
  fromDate: '',
  toDate: '',
  gender: 'all',
  inquiryStatus: 'all',
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
        description="Reports provide detailed insights into student enrollment statistics, trends, and registration data to help manage admissions effectively."
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
                    <Field as={FormControl} error={touched.viewMode && errors.viewMode} fullWidth>
                      <InputLabel size="small">View Mode</InputLabel>
                      <Select
                        name="viewMode"
                        value={values.viewMode}
                        onChange={handleChange}
                        label="View Mode"
                        size="small"
                      >
                        <MenuItem value="pdf">PDF</MenuItem>
                        <MenuItem value="admin">Screen</MenuItem>
                      </Select>
                      <FormHelperText>{touched.viewMode && errors.viewMode}</FormHelperText>
                    </Field>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Field as={FormControl} error={touched.board && errors.board} fullWidth>
                      <InputLabel size="small">Board</InputLabel>
                      <Select
                        name="board"
                        value={values.board}
                        onChange={handleChange}
                        label="View Mode"
                        size="small"
                      >
                        <MenuItem value="pdf">CBSC</MenuItem>
                        <MenuItem value="admin">GSEB</MenuItem>
                      </Select>
                      <FormHelperText>{touched.board && errors.board}</FormHelperText>
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
                    <Field as={FormControl} error={touched.medium && errors.medium} fullWidth>
                      <InputLabel size="small">medium</InputLabel>
                      <Select
                        name="medium"
                        value={values.medium}
                        onChange={handleChange}
                        label="medium"
                        size="small"
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="teachers">Teachers</MenuItem>
                        <MenuItem value="activity">Activity</MenuItem>
                      </Select>
                      <FormHelperText>{touched.medium && errors.medium}</FormHelperText>
                    </Field>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Field
                      as={FormControl}
                      error={touched.department && errors.department}
                      fullWidth
                    >
                      <InputLabel size="small">department</InputLabel>
                      <Select
                        name="department"
                        value={values.department}
                        onChange={handleChange}
                        label="department"
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
                    <Field as={FormControl} error={touched.class && errors.class} fullWidth>
                      <InputLabel size="small">class</InputLabel>
                      <Select
                        name="class"
                        value={values.class}
                        onChange={handleChange}
                        label="class"
                        size="small"
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="teachers">Teachers</MenuItem>
                        <MenuItem value="activity">Activity</MenuItem>
                      </Select>
                      <FormHelperText>{touched.class && errors.class}</FormHelperText>
                    </Field>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Field
                      as={FormControl}
                      error={touched.fromInquiryNumber && errors.fromInquiryNumber}
                      fullWidth
                    >
                      <InputLabel size="small">fromInquiryNumber</InputLabel>
                      <Select
                        name="fromInquiryNumber"
                        value={values.fromInquiryNumber}
                        onChange={handleChange}
                        label="fromInquiryNumber"
                        size="small"
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="teachers">Teachers</MenuItem>
                        <MenuItem value="activity">Activity</MenuItem>
                      </Select>
                      <FormHelperText>
                        {touched.fromInquiryNumber && errors.fromInquiryNumber}
                      </FormHelperText>
                    </Field>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Field
                      as={FormControl}
                      error={touched.toInquiryNumber && errors.toInquiryNumber}
                      fullWidth
                    >
                      <InputLabel size="small">toInquiryNumber</InputLabel>
                      <Select
                        name="toInquiryNumber"
                        value={values.toInquiryNumber}
                        onChange={handleChange}
                        label="toInquiryNumber"
                        size="small"
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="teachers">Teachers</MenuItem>
                        <MenuItem value="activity">Activity</MenuItem>
                      </Select>
                      <FormHelperText>
                        {touched.toInquiryNumber && errors.toInquiryNumber}
                      </FormHelperText>
                    </Field>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Field as={FormControl} error={touched.fromDate && errors.fromDate} fullWidth>
                      <DatePicker label="From Date" slotProps={{ textField: { size: 'small' } }} />
                      {/* <Select
                        name="fromDate"
                        value={values.fromDate}
                        onChange={handleChange}
                        label="fromDate"
                        size="small"
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="teachers">Teachers</MenuItem>
                        <MenuItem value="activity">Activity</MenuItem>
                      </Select> */}
                      <FormHelperText>{touched.fromDate && errors.fromDate}</FormHelperText>
                    </Field>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Field as={FormControl} error={touched.toDate && errors.toDate} fullWidth>
                      <DatePicker label="To Date" slotProps={{ textField: { size: 'small' } }} />
                    </Field>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Field
                      as={FormControl}
                      error={touched.inquiryStatus && errors.inquiryStatus}
                      fullWidth
                    >
                      <InputLabel size="small">inquiryStatus</InputLabel>
                      <Select
                        name="inquiryStatus"
                        value={values.inquiryStatus}
                        onChange={handleChange}
                        label="inquiryStatus"
                        size="small"
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="teachers">Teachers</MenuItem>
                        <MenuItem value="activity">Activity</MenuItem>
                      </Select>
                      <FormHelperText>
                        {touched.inquiryStatus && errors.inquiryStatus}
                      </FormHelperText>
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
