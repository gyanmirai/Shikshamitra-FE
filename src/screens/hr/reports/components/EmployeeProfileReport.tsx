import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid, TextField, Autocomplete } from '@mui/material';

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
                label="Select Employees *"
                error={formik.touched.employees && Boolean(formik.errors.employees)}
                helperText={formik.touched.employees && (formik.errors.employees as string)}
              />
            )}
          />
        </Grid>
      </Grid>
    </ReportForm>
  );
}
