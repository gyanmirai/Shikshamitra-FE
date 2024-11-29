'use client';

import React from 'react';
import * as Yup from 'yup';
import { Form, Field, Formik } from 'formik';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Card, Button, FormControl, FormHelperText } from '@mui/material';

// import { useGetBooksQuery } from 'src/redux/library/libraryApi';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const initialValues = {
  report: '',
  bookCategory: 'All',
  publisher: 'All',
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
  // const { data: booksData } = useQueryAndMutation({
  //   type: 'query',
  //   currentQueryAndMutation: useGetBooksQuery,
  // });

  // const categoryOptions = React.useMemo(() => {
  //   const allOption = { name: 'All', value: 'all' };
  //   return [allOption, ...(booksData?.categories || [])];
  // }, [booksData]);

  // const publisherOptions = React.useMemo(() => {
  //   const allOption = { name: 'All', value: 'all' };
  //   return [allOption, ...(booksData?.publishers || [])];
  // }, [booksData]);

  // const yearOptions = React.useMemo(() => {
  //   const allOption = { name: 'All', value: 'all' };
  //   return [allOption, ...(booksData?.years || [])];
  // }, [booksData]);
  const publisherOptions = [
    { value: 'publisher1', name: 'Publisher 1' },
    { value: 'publisher2', name: 'Publisher 2' },
    { value: 'publisher3', name: 'Publisher 3' },
    { value: 'publisher4', name: 'Publisher 4' },
    { value: 'publisher5', name: 'Publisher 5' },
  ];

  const yearOptions = [
    { value: '2020', name: '2020' },
    { value: '2021', name: '2021' },
    { value: '2022', name: '2022' },
    { value: '2023', name: '2023' },
    { value: '2024', name: '2024' },
  ];

  const categoryOptions = [
    { value: 'fiction', name: 'Fiction' },
    { value: 'non-fiction', name: 'Non-fiction' },
    { value: 'mystery', name: 'Mystery' },
    { value: 'romance', name: 'Romance' },
    { value: 'science', name: 'Science' },
    { value: 'history', name: 'History' },
    { value: 'biography', name: 'Biography' },
    { value: 'fantasy', name: 'Fantasy' },
  ];

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
                          { value: 'issuedBooks', label: 'Issued Books' },
                          { value: 'overdueBooks', label: 'Overdue Books' },
                          { value: 'fineCollection', label: 'Fine Collection' },
                        ]}
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

                  {values.report === 'issuedBooks' && (
                    <>
                      <Grid item xs={12} sm={6} md={4}>
                        <Field as={FormControl} error={touched.bookCategory && errors.bookCategory} fullWidth>
                          <CustomSelect
                            label="Book Category"
                            name="bookCategory"
                            options={categoryOptions}
                            labelKey="name"
                            valueKey="name"
                            value={values.bookCategory}
                            onChange={(value) => setFieldValue('bookCategory', value)}
                            formControlProps={{ sx: { minWidth: '200px', width: '100%' } }}
                          />
                          <FormHelperText>{touched.bookCategory && errors.bookCategory}</FormHelperText>
                        </Field>
                      </Grid>

                      <Grid item xs={12} sm={6} md={4}>
                        <Field as={FormControl} error={touched.publisher && errors.publisher} fullWidth>
                          <CustomSelect
                            label="Publisher"
                            name="publisher"
                            options={publisherOptions}
                            labelKey="name"
                            valueKey="name"
                            value={values.publisher}
                            onChange={(value) => setFieldValue('publisher', value)}
                            formControlProps={{ sx: { minWidth: '200px', width: '100%' } }}
                          />
                          <FormHelperText>{touched.publisher && errors.publisher}</FormHelperText>
                        </Field>
                      </Grid>

                      <Grid item xs={12} sm={6} md={4}>
                        <Field as={FormControl} error={touched.year && errors.year} fullWidth>
                          <CustomSelect
                            label="Year"
                            name="year"
                            options={yearOptions}
                            labelKey="name"
                            valueKey="name"
                            value={values.year}
                            onChange={(value) => setFieldValue('year', value)}
                            formControlProps={{ sx: { minWidth: '200px', width: '100%' } }}
                          />
                          <FormHelperText>{touched.year && errors.year}</FormHelperText>
                        </Field>
                      </Grid>
                    </>
                  )}

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

export default LibraryReportsScreen;
