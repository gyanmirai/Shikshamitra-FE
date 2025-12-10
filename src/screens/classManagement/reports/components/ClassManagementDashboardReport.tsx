import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ShakingTextField from 'src/components/shaking-text-field';

import { ReportForm } from './ReportForm';

export default function ClassManagementDashboardReport() {
  const formik = useFormik({
    initialValues: {
      startDate: null,
      endDate: null,
    },
    validationSchema: Yup.object({}),
    onSubmit: (values) => {
      console.info('Generate Class Management Dashboard Report', values);
    },
  });

  return (
    <ReportForm onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.startDate && formik.errors.startDate)}>
            <DatePicker
              label="Start Date"
              value={formik.values.startDate}
              onChange={(newValue) => formik.setFieldValue('startDate', newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                },
              }}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.endDate && formik.errors.endDate)}>
            <DatePicker
              label="End Date"
              value={formik.values.endDate}
              onChange={(newValue) => formik.setFieldValue('endDate', newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                },
              }}
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </ReportForm>
  );
}
