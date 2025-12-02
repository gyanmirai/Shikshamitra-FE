import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Grid, TextField, Autocomplete } from '@mui/material';

import { ReportForm } from './ReportForm';
import { useReportOptions } from '../hooks/useReportOptions';

export default function LeaveEncashmentReport() {
  const { employees } = useReportOptions();

  const formik = useFormik({
    initialValues: {
      employees: [],
      month: null,
    },
    validationSchema: Yup.object({
      employees: Yup.array().min(1, 'At least one employee is required'),
      month: Yup.date().required('Month is required').nullable(),
    }),
    onSubmit: (values) => {
      console.info('Generate Leave Encashment Report', values);
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
