import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid, TextField, Autocomplete } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

import { ReportForm } from './ReportForm';
import { useReportOptions } from '../hooks/useReportOptions';

export default function EmployeeContactListReport() {
  const { departmentOptions, statusOptions } = useReportOptions();

  const formik = useFormik({
    initialValues: {
      departments: [],
      statuses: [],
    },
    validationSchema: Yup.object({
      departments: Yup.array().min(1, 'At least one department is required'),
      statuses: Yup.array().min(1, 'At least one status is required'),
    }),
    onSubmit: (values) => {
      console.info('Generate Employee Contact List Report', values);
    },
  });

  return (
    <ReportForm onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.departments && formik.errors.departments)}>
            <Autocomplete
              multiple
              size="small"
              options={departmentOptions}
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
              slotProps={{
                chip: {
                  size: 'small',
                  variant: 'soft',
                },
              }}
              options={statusOptions}
              size="small"
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
      </Grid>
    </ReportForm>
  );
}
