import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import ShakingTextField from 'src/components/shaking-text-field';

import { ReportForm } from './ReportForm';

export default function PreviousSchoolReport() {
  const formik = useFormik({
    initialValues: {
      studentName: '',
      classAdmitted: '',
      previousSchoolName: '',
      lastClassPassed: '',
      admissionDate: null,
    },
    validationSchema: Yup.object({
      studentName: Yup.string().required('Student Name is required'),
      classAdmitted: Yup.string().required('Class Admitted is required'),
      previousSchoolName: Yup.string().required('Previous School Name is required'),
      lastClassPassed: Yup.string().required('Last Class Passed is required'),
      admissionDate: Yup.date().required('Admission Date is required').nullable(),
    }),
    onSubmit: (values) => {
      console.info('Generate Previous School Report', values);
    },
  });

  return (
    <ReportForm onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.studentName && formik.errors.studentName)}>
            <TextField
              name="studentName"
              label="Student Name *"
              value={formik.values.studentName}
              onChange={formik.handleChange}
              onBlur={() => formik.setFieldTouched('studentName', true)}
              error={formik.touched.studentName && Boolean(formik.errors.studentName)}
              helperText={(formik.touched.studentName && formik.errors.studentName) as string}
              fullWidth
              size="small"
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.classAdmitted && formik.errors.classAdmitted)}>
            <TextField
              name="classAdmitted"
              label="Class Admitted *"
              value={formik.values.classAdmitted}
              onChange={formik.handleChange}
              onBlur={() => formik.setFieldTouched('classAdmitted', true)}
              error={formik.touched.classAdmitted && Boolean(formik.errors.classAdmitted)}
              helperText={(formik.touched.classAdmitted && formik.errors.classAdmitted) as string}
              fullWidth
              size="small"
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField
            error={!!(formik.touched.previousSchoolName && formik.errors.previousSchoolName)}
          >
            <TextField
              name="previousSchoolName"
              label="Previous School Name *"
              value={formik.values.previousSchoolName}
              onChange={formik.handleChange}
              onBlur={() => formik.setFieldTouched('previousSchoolName', true)}
              error={formik.touched.previousSchoolName && Boolean(formik.errors.previousSchoolName)}
              helperText={
                (formik.touched.previousSchoolName && formik.errors.previousSchoolName) as string
              }
              fullWidth
              size="small"
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField
            error={!!(formik.touched.lastClassPassed && formik.errors.lastClassPassed)}
          >
            <TextField
              name="lastClassPassed"
              label="Last Class Passed *"
              value={formik.values.lastClassPassed}
              onChange={formik.handleChange}
              onBlur={() => formik.setFieldTouched('lastClassPassed', true)}
              error={formik.touched.lastClassPassed && Boolean(formik.errors.lastClassPassed)}
              helperText={
                (formik.touched.lastClassPassed && formik.errors.lastClassPassed) as string
              }
              fullWidth
              size="small"
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.admissionDate && formik.errors.admissionDate)}>
            <DatePicker
              label="Admission Date *"
              value={formik.values.admissionDate}
              onChange={(date) => formik.setFieldValue('admissionDate', date)}
              slotProps={{
                textField: {
                  size: 'small',
                  error: formik.touched.admissionDate && Boolean(formik.errors.admissionDate),
                  helperText: (formik.touched.admissionDate &&
                    formik.errors.admissionDate) as string,
                  fullWidth: true,
                  onBlur: () => formik.setFieldTouched('admissionDate', true),
                },
              }}
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </ReportForm>
  );
}
