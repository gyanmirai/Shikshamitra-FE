import type { RootState } from 'src/redux/store';

import React from 'react';
import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Grid, TextField, Autocomplete } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

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
      month: Yup.date().required('Month is required'),
    }),
    onSubmit: (values) => {
      console.info('Generate Monthly Payroll Summary Report', values);
    },
  });

  const { currentYear } = useSelector((state: RootState) => state.globalState);

  return (
    <ReportForm onSubmit={formik.handleSubmit}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.employees && formik.errors.employees)}>
            <Autocomplete
              multiple
              options={employees}
              getOptionLabel={(option: any) =>
                `${option.fullName} (ID: ${option.employeeIdentifier})`
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
                  label="Employees *"
                  error={formik.touched.employees && Boolean(formik.errors.employees)}
                  helperText={formik.touched.employees && (formik.errors.employees as string)}
                />
              )}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.departments && formik.errors.departments)}>
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
                  label="Departments *"
                  error={formik.touched.departments && Boolean(formik.errors.departments)}
                  helperText={formik.touched.departments && (formik.errors.departments as string)}
                />
              )}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.statuses && formik.errors.statuses)}>
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
                  label="Status *"
                  error={formik.touched.statuses && Boolean(formik.errors.statuses)}
                  helperText={formik.touched.statuses && (formik.errors.statuses as string)}
                />
              )}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.month && formik.errors.month)}>
            <DatePicker
              label="Month *"
              minDate={dayjs(currentYear?.startDate)}
              maxDate={dayjs(currentYear?.endDate)}
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
          </ShakingTextField>
        </Grid>
      </Grid>
    </ReportForm>
  );
}
