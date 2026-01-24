import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid, TextField, Autocomplete } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

import { ReportForm } from './ReportForm';
import { useReportOptions } from '../hooks/useReportOptions';

export default function FinalSettlementReport() {
  const { employees } = useReportOptions();

  const formik = useFormik({
    initialValues: {
      employee: null,
    },
    validationSchema: Yup.object({
      employee: Yup.object().required('Employee is required'),
    }),
    onSubmit: (values) => {
      console.info('Generate Final Settlement Report', values);
    },
  });

  return (
    <ReportForm onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <ShakingTextField error={!!(formik.touched.employee && formik.errors.employee)}>
            <Autocomplete
              options={employees}
              getOptionLabel={(option: any) =>
                `${option.fullName} (ID: ${option.employeeIdentifier})`
              }
              slotProps={{
                chip: {
                  size: 'small',
                  variant: 'soft',
                },
              }}
              size="small"
              value={formik.values.employee}
              onChange={(_, newValue) => formik.setFieldValue('employee', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Employee *"
                  error={formik.touched.employee && Boolean(formik.errors.employee)}
                  helperText={formik.touched.employee && (formik.errors.employee as string)}
                />
              )}
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </ReportForm>
  );
}
