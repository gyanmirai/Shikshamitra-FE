import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

import { ReportForm } from './ReportForm';

export default function MonthlyAdmissionTrendReport() {
  const formik = useFormik({
    initialValues: {
      month: '',
      numberOfNewAdmission: '',
      withdrawals: '',
      netIncrease: '',
      totalStudents: '',
    },
    validationSchema: Yup.object({
      month: Yup.string().required('Month is required'),
      numberOfNewAdmission: Yup.number().typeError('Must be a number').nullable(),
      withdrawals: Yup.number().typeError('Must be a number').nullable(),
      netIncrease: Yup.number().typeError('Must be a number').nullable(),
      totalStudents: Yup.number().typeError('Must be a number').nullable(),
    }),
    onSubmit: (values) => {
      console.info('Generate Monthly Admission Trend Report', values);
    },
  });

  return (
    <ReportForm onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.month && formik.errors.month)}>
            <TextField
              name="month"
              label="Month *"
              value={formik.values.month}
              onChange={formik.handleChange}
              onBlur={() => formik.setFieldTouched('month', true)}
              error={formik.touched.month && Boolean(formik.errors.month)}
              helperText={(formik.touched.month && formik.errors.month) as string}
              fullWidth
              size="small"
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField
            error={!!(formik.touched.numberOfNewAdmission && formik.errors.numberOfNewAdmission)}
          >
            <TextField
              fullWidth
              size="small"
              label="Number of New Admission"
              type="number"
              name="numberOfNewAdmission"
              value={formik.values.numberOfNewAdmission}
              onChange={formik.handleChange}
              onBlur={() => formik.setFieldTouched('numberOfNewAdmission', true)}
              error={
                formik.touched.numberOfNewAdmission && Boolean(formik.errors.numberOfNewAdmission)
              }
              helperText={
                (formik.touched.numberOfNewAdmission &&
                  formik.errors.numberOfNewAdmission) as string
              }
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
          <ShakingTextField error={!!(formik.touched.netIncrease && formik.errors.netIncrease)}>
            <TextField
              fullWidth
              size="small"
              label="Net Increase"
              type="number"
              name="netIncrease"
              value={formik.values.netIncrease}
              onChange={formik.handleChange}
              onBlur={() => formik.setFieldTouched('netIncrease', true)}
              error={formik.touched.netIncrease && Boolean(formik.errors.netIncrease)}
              helperText={(formik.touched.netIncrease && formik.errors.netIncrease) as string}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.totalStudents && formik.errors.totalStudents)}>
            <TextField
              fullWidth
              size="small"
              label="Total Students"
              type="number"
              name="totalStudents"
              value={formik.values.totalStudents}
              onChange={formik.handleChange}
              onBlur={() => formik.setFieldTouched('totalStudents', true)}
              error={formik.touched.totalStudents && Boolean(formik.errors.totalStudents)}
              helperText={(formik.touched.totalStudents && formik.errors.totalStudents) as string}
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </ReportForm>
  );
}
