'use client';

import React from 'react';
import * as Yup from 'yup';
import { Form, Field, Formik } from 'formik';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Card, Button, FormControl, FormHelperText } from '@mui/material';

import { varAlpha } from 'src/theme/styles/utils';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const initialValues = {
  report: '',
  category: 'All',
  year: 'All',
  startDate: null,
  endDate: null,
};

const validationSchema = Yup.object().shape({
  report: Yup.string().required('Report is required'),
  bookCategory: Yup.string().required('Book Category is required'),
  publisher: Yup.string().required('Publisher is required'),
  year: Yup.string().required('Year is required'),
  startDate: Yup.string().required('Start Date is required'),
  endDate: Yup.string().required('End Date is required'),
});

const LibraryReportsScreen = () => {
  const categoryOptions = [
    { value: 'All', label: 'All Categories' },
    { value: 'fiction', label: 'Fiction' },
    { value: 'non-fiction', label: 'Non-fiction' },
    { value: 'science', label: 'Science' },
  ];

  const yearOptions = [
    { value: 'All', label: 'All Years' },
    { value: '2020', label: '2020' },
    { value: '2021', label: '2021' },
    { value: '2022', label: '2022' },
    { value: '2023', label: '2023' },
    { value: '2024', label: '2024' },
  ];

  const reportOptions = [
    { value: 'circulation', label: 'Circulation and Usage Reports' },
    { value: 'inventory', label: 'Inventory and Catalog Reports' },
    { value: 'member', label: 'Member Activity Reports' },
    { value: 'reservation', label: 'Reservation and Availability Reports' },
    { value: 'financial', label: 'Financial Reports' },
  ];

  const handleGenerateReport = (values: any) => {
    console.log('Generating report with values:', values);
    // Logic to generate or fetch the report from the backend can be added here
  };

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Library Reports"
        links={[{ name: 'Library' }, { name: 'Reports' }]}
        sx={{ px: 1, mb: 2 }}
      />

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          handleGenerateReport(values);
        }}
      >
        {({ errors, touched, values, setFieldValue }) => (
          <Form>
            <Card sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Field as={FormControl} error={touched.report && errors.report} fullWidth>
                    <CustomSelect
                      label="Select Report Type"
                      name="report"
                      options={reportOptions}
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
                      value={values.endDate}
                      onChange={(date) => setFieldValue('endDate', date)}
                      format="DD-MM-YYYY"
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                    <FormHelperText>{touched.endDate && errors.endDate}</FormHelperText>
                  </Field>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>

                  <CustomSelect
                    label="Standard"
                    name="category"
                    options={[]}
                    value={values.category}
                    onChange={(value) => setFieldValue('category', value)}
                  />

                </Grid>
                <Grid item xs={12} sm={6} md={4}>

                  <CustomSelect
                    label="Division"
                    name="category"
                    options={[]}
                    value={values.category}
                    onChange={(value) => setFieldValue('category', value)}
                  />

                </Grid>
                <Grid item xs={12} sm={6} md={4}>

                  <CustomSelect
                    label="Name"
                    name="category"
                    options={[]}
                    value={values.category}
                    onChange={(value) => setFieldValue('category', value)}
                  />

                </Grid>

                {(values.report === 'inventory' || values.report === 'circulation') && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Field as={FormControl} fullWidth>
                      <CustomSelect
                        label="Book Category"
                        name="category"
                        options={categoryOptions}
                        value={values.category}
                        onChange={(value) => setFieldValue('category', value)}
                      />
                    </Field>
                  </Grid>
                )}

                {(values.report === 'inventory' || values.report === 'reservation') && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Field as={FormControl} fullWidth>
                      <CustomSelect
                        label="Year"
                        name="year"
                        options={yearOptions}
                        value={values.year}
                        onChange={(value) => setFieldValue('year', value)}
                      />
                    </Field>
                  </Grid>
                )}
              </Grid>
              <Box pt="20px" />
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
            </Card>


          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default LibraryReportsScreen;
