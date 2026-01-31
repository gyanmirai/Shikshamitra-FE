import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid, TextField, Autocomplete } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

import { ReportForm } from './ReportForm';
import { useReportOptions } from '../hooks/useReportOptions';

export default function EmployeeProfileReport() {
  const { employees } = useReportOptions();

  const formik = useFormik({
    initialValues: {
      employees: [],
    },
    validationSchema: Yup.object({
      employees: Yup.array().min(1, 'At least one employee is required'),
    }),
    onSubmit: (values) => {
      console.info('Generate Employee Profile Report', values);
    },
  });

  return (
    <ReportForm onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <ShakingTextField error={!!(formik.touched.employees && formik.errors.employees)}>
            <Autocomplete
              multiple
              options={employees}
              getOptionLabel={(option: any) => `${option.fullName} (${option.employeeIdentifier})`}
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
      </Grid>
    </ReportForm>
  );
}
