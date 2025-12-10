import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

import { ReportForm } from './ReportForm';

export default function AcademicYearComparisonReport() {
  const formik = useFormik({
    initialValues: {
      totalEnrollments: '',
      newAdmissions: '',
      withdrawals: '',
      retentionRate: '',
    },
    validationSchema: Yup.object({
      totalEnrollments: Yup.number().typeError('Must be a number').nullable(),
      newAdmissions: Yup.number().typeError('Must be a number').nullable(),
      withdrawals: Yup.number().typeError('Must be a number').nullable(),
      retentionRate: Yup.string().required('Retention Rate is required'),
    }),
    onSubmit: (values) => {
      console.info('Generate Academic Year Comparison Report', values);
    },
  });

  return (
    <ReportForm onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField
            error={!!(formik.touched.totalEnrollments && formik.errors.totalEnrollments)}
          >
            <TextField
              fullWidth
              size="small"
              label="Total Enrollments"
              type="number"
              name="totalEnrollments"
              value={formik.values.totalEnrollments}
              onChange={formik.handleChange}
              onBlur={() => formik.setFieldTouched('totalEnrollments', true)}
              error={formik.touched.totalEnrollments && Boolean(formik.errors.totalEnrollments)}
              helperText={
                (formik.touched.totalEnrollments && formik.errors.totalEnrollments) as string
              }
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.newAdmissions && formik.errors.newAdmissions)}>
            <TextField
              fullWidth
              size="small"
              label="New Admissions"
              type="number"
              name="newAdmissions"
              value={formik.values.newAdmissions}
              onChange={formik.handleChange}
              onBlur={() => formik.setFieldTouched('newAdmissions', true)}
              error={formik.touched.newAdmissions && Boolean(formik.errors.newAdmissions)}
              helperText={(formik.touched.newAdmissions && formik.errors.newAdmissions) as string}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.withdrawals && formik.errors.withdrawals)}>
            <TextField
              fullWidth
              size="small"
              label="Withdrawals"
              type="number"
              name="withdrawals"
              value={formik.values.withdrawals}
              onChange={formik.handleChange}
              onBlur={() => formik.setFieldTouched('withdrawals', true)}
              error={formik.touched.withdrawals && Boolean(formik.errors.withdrawals)}
              helperText={(formik.touched.withdrawals && formik.errors.withdrawals) as string}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.retentionRate && formik.errors.retentionRate)}>
            <TextField
              name="retentionRate"
              label="Retention Rate *"
              value={formik.values.retentionRate}
              onChange={formik.handleChange}
              onBlur={() => formik.setFieldTouched('retentionRate', true)}
              error={formik.touched.retentionRate && Boolean(formik.errors.retentionRate)}
              helperText={(formik.touched.retentionRate && formik.errors.retentionRate) as string}
              fullWidth
              size="small"
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </ReportForm>
  );
}
