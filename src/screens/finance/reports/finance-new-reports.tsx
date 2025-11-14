'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

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

const FinanceNewReportsScreen = (props: TabComponentType) => {
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
        links={[{ name: 'Finance', href: '/finance/dashboard/' }, { name: 'Reports' }]}
        sx={{ mb: 2 }}
      />
      {/* <Typography variant="h6" gutterBottom>Download Reports</Typography> */}
      {/* <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <Button startIcon={<Iconify icon="mdi:file-pdf-box" />} color="error" variant="contained">
          Download PDF
        </Button>
        <Button startIcon={<Iconify icon="mdi:file-excel" />} color="success" variant="contained">
          Download Excel
        </Button>
      </Box> */}

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
                        label="List of Reports"
                        name="report"
                        options={[
                          { value: 'financeReportsone', label: 'Fee Reports' },
                          { value: 'income', label: 'Income' },
                          { value: 'expense', label: 'Expense' },
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

                  {values.report === 'financeReportsone' && (
                    <>
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
                        <Field as={FormControl} error={touched.subject && errors.subject} fullWidth>
                          <CustomSelect
                            label="Division"
                            name="division"
                            options={[
                              { value: 'All', label: 'All' },
                              { value: 'A', label: 'A' },
                              { value: 'B', label: 'B' },
                              { value: 'C', label: 'C' },
                              { value: 'D', label: 'D' },
                            ]}
                            formControlProps={{ sx: { minWidth: '200px', width: '100%' } }}
                            value={values.subject}
                            onChange={(value) => setFieldValue('subject', value)}
                          />
                          <FormHelperText>{touched.subject && errors.subject}</FormHelperText>
                        </Field>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Field as={FormControl} error={touched.subject && errors.subject} fullWidth>
                          <CustomSelect
                            label="Payment Status"
                            name="paymentStatus"
                            options={[
                              { value: 'All', label: 'Paid' },
                              { value: 'Math', label: 'Pending' },
                            ]}
                            formControlProps={{ sx: { minWidth: '200px', width: '100%' } }}
                            value={values.subject}
                            onChange={(value) => setFieldValue('subject', value)}
                          />
                          <FormHelperText>{touched.subject && errors.subject}</FormHelperText>
                        </Field>
                      </Grid>
                    </>
                  )}

                  {values.report === 'income' && (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Field as={FormControl} error={touched.subject && errors.subject} fullWidth>
                        <CustomSelect
                          label="Category"
                          name="category"
                          options={[
                            { value: 'All', label: 'All' },
                            { value: 'Fee', label: 'Fee' },
                            { value: 'Donation', label: 'Donation' },
                          ]}
                          formControlProps={{ sx: { minWidth: '200px', width: '100%' } }}
                          value={values.subject}
                          onChange={(value) => setFieldValue('subject', value)}
                        />
                        <FormHelperText>{touched.subject && errors.subject}</FormHelperText>
                      </Field>
                    </Grid>
                  )}

                  {values.report === 'expense' && (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Field as={FormControl} error={touched.subject && errors.subject} fullWidth>
                        <CustomSelect
                          label="Category"
                          name="category"
                          options={[
                            { value: 'All', label: 'All' },
                            { value: 'Maintenance', label: 'Maintenance' },
                            { value: 'Salary', label: 'Salary' },
                          ]}
                          formControlProps={{ sx: { minWidth: '200px', width: '100%' } }}
                          value={values.subject}
                          onChange={(value) => setFieldValue('subject', value)}
                        />
                        <FormHelperText>{touched.subject && errors.subject}</FormHelperText>
                      </Field>
                    </Grid>
                  )}

                  <Grid size={{ xs: 12 }} justifyContent="flex-end" display="flex" gap={3}>
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
                            varAlpha(theme.vars.palette.primary.mainChannel, 0.1),
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
                            varAlpha(theme.vars.palette.warning.mainChannel, 0.1),
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
                            varAlpha(theme.vars.palette.secondary.mainChannel, 0.1),
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

export default FinanceNewReportsScreen;
