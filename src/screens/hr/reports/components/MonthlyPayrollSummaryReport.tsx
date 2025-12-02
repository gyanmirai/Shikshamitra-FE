import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Grid, TextField, Autocomplete } from '@mui/material';

import { ReportForm } from './ReportForm';
import { useReportOptions } from '../hooks/useReportOptions';

export default function MonthlyPayrollSummaryReport() {
  const { employees, departmentOptions, statusOptions } = useReportOptions();

  const formik = useFormik({
    initialValues: {
      employees: [],
      departments: [],
      statuses: [],
      month: null,
    },
    validationSchema: Yup.object({
      employees: Yup.array().min(1, 'At least one employee is required'),
      departments: Yup.array().min(1, 'At least one department is required'),
      statuses: Yup.array().min(1, 'At least one status is required'),
      month: Yup.date().required('Month is required').nullable(),
    }),
    onSubmit: (values) => {
      console.info('Generate Monthly Payroll Summary Report', values);
    },
  });

  return (
    <ReportForm onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Autocomplete
            multiple
            options={employees}
            getOptionLabel={(option: any) =>
              `${option.firstName} ${option.lastName} (${option.employeeCode})`
            }
            size="small"
            slotProps={{
              chip: {
                size: 'small',
                variant: 'soft',
              },
            }}
            value={formik.values.employees}
            onChange={(_, newValue) => formik.setFieldValue('employees', newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Employees"
                error={formik.touched.employees && Boolean(formik.errors.employees)}
                helperText={formik.touched.employees && (formik.errors.employees as string)}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Autocomplete
            multiple
            options={departmentOptions}
            size="small"
            slotProps={{
              chip: {
                size: 'small',
                variant: 'soft',
              },
            }}
            value={formik.values.departments}
            onChange={(_, newValue) => formik.setFieldValue('departments', newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Departments"
                error={formik.touched.departments && Boolean(formik.errors.departments)}
                helperText={formik.touched.departments && (formik.errors.departments as string)}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Autocomplete
            multiple
            options={statusOptions}
            size="small"
            slotProps={{
              chip: {
                size: 'small',
                variant: 'soft',
              },
            }}
            getOptionLabel={(option) => option.label}
            value={formik.values.statuses}
            onChange={(_, newValue) => formik.setFieldValue('statuses', newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Status"
                error={formik.touched.statuses && Boolean(formik.errors.statuses)}
                helperText={formik.touched.statuses && (formik.errors.statuses as string)}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DatePicker
            label="Select Month"
            views={['month', 'year']}
            value={formik.values.month}
            onChange={(newValue) => formik.setFieldValue('month', newValue)}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
                error: formik.touched.month && Boolean(formik.errors.month),
                helperText: formik.touched.month && (formik.errors.month as string),
              },
            }}
          />
        </Grid>
      </Grid>
    </ReportForm>
  );
}
