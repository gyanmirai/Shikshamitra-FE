import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid, TextField, Autocomplete } from '@mui/material';

import { ReportForm } from './ReportForm';
import { useReportOptions } from '../hooks/useReportOptions';

export default function PayrollReconciliationReport() {
  const { employees, departmentOptions } = useReportOptions();

  const formik = useFormik({
    initialValues: {
      employees: [],
      departments: [],
    },
    validationSchema: Yup.object({
      employees: Yup.array().min(1, 'At least one employee is required'),
      departments: Yup.array().min(1, 'At least one department is required'),
    }),
    onSubmit: (values) => {
      console.info('Generate Payroll Reconciliation Report', values);
    },
  });

  return (
    <ReportForm onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Autocomplete
            multiple
            size="small"
            slotProps={{
              chip: {
                size: 'small',
                variant: 'soft',
              },
            }}
            options={employees}
            getOptionLabel={(option: any) =>
              `${option.firstName} ${option.lastName} (${option.employeeCode})`
            }
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
            size="small"
            slotProps={{
              chip: {
                size: 'small',
                variant: 'soft',
              },
            }}
            options={departmentOptions}
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
      </Grid>
    </ReportForm>
  );
}
