import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid, TextField } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { ReportForm } from './ReportForm';
import { useReportOptions } from '../hooks/useReportOptions';

export default function ContactInformationReport() {
  const { allClasses } = useReportOptions();

  const formik = useFormik({
    initialValues: {
      enrollmentNo: '',
      class: [] as string[],
      name: '',
      primaryContactNo: '',
      secondaryContactNo: '',
      email: '',
    },
    validationSchema: Yup.object({
      enrollmentNo: Yup.string().required('Enrollment No is required'),
      class: Yup.array().min(1, 'Class is required'),
      name: Yup.string().required('Name is required'),
      primaryContactNo: Yup.string().required('Primary Contact No is required'),
      secondaryContactNo: Yup.string().required('Secondary Contact No is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
    }),
    onSubmit: (values) => {
      console.info('Generate Contact Information Report', values);
    },
  });

  const handleClassChange = (val: any) => {
    const value = val as string[];
    const allClassIds = allClasses
      .filter((c: { id: string }) => c.id !== 'all')
      .map((c: { id: string }) => c.id);
    const isAllClicked = value.includes('all');
    const wasAllSelected = formik.values.class.includes('all');

    if (isAllClicked && !wasAllSelected) {
      formik.setFieldValue('class', ['all', ...allClassIds]);
    } else if (!isAllClicked && wasAllSelected) {
      formik.setFieldValue('class', []);
    } else if (isAllClicked && wasAllSelected) {
      const selectedWithoutAll = value.filter((id) => id !== 'all');
      if (selectedWithoutAll.length === allClassIds.length) {
        formik.setFieldValue('class', ['all', ...allClassIds]);
      } else {
        formik.setFieldValue('class', selectedWithoutAll);
      }
    } else {
      const selectedWithoutAll = value.filter((id) => id !== 'all');
      if (selectedWithoutAll.length === allClassIds.length) {
        formik.setFieldValue('class', ['all', ...allClassIds]);
      } else {
        formik.setFieldValue('class', selectedWithoutAll);
      }
    }
  };

  return (
    <ReportForm onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.enrollmentNo && formik.errors.enrollmentNo)}>
            <TextField
              fullWidth
              size="small"
              type="number"
              name="enrollmentNo"
              label="Enrollment No *"
              value={formik.values.enrollmentNo}
              onChange={formik.handleChange}
              onBlur={() => formik.setFieldTouched('enrollmentNo', true)}
              error={formik.touched.enrollmentNo && Boolean(formik.errors.enrollmentNo)}
              helperText={(formik.touched.enrollmentNo && formik.errors.enrollmentNo) as string}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.class && formik.errors.class)}>
            <CustomSelect
              options={allClasses}
              label="Class *"
              multiple
              value={formik.values.class}
              onChange={handleClassChange}
              onBlur={() => formik.setFieldTouched('class', true)}
              error={formik.touched.class && Boolean(formik.errors.class)}
              helperText={(formik.touched.class && formik.errors.class) as string}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.name && formik.errors.name)}>
            <TextField
              name="name"
              label="Name *"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={() => formik.setFieldTouched('name', true)}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={(formik.touched.name && formik.errors.name) as string}
              fullWidth
              size="small"
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField
            error={!!(formik.touched.primaryContactNo && formik.errors.primaryContactNo)}
          >
            <TextField
              name="primaryContactNo"
              label="Primary Contact No *"
              value={formik.values.primaryContactNo}
              onChange={formik.handleChange}
              onBlur={() => formik.setFieldTouched('primaryContactNo', true)}
              error={formik.touched.primaryContactNo && Boolean(formik.errors.primaryContactNo)}
              helperText={
                (formik.touched.primaryContactNo && formik.errors.primaryContactNo) as string
              }
              fullWidth
              size="small"
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField
            error={!!(formik.touched.secondaryContactNo && formik.errors.secondaryContactNo)}
          >
            <TextField
              name="secondaryContactNo"
              label="Secondary Contact No *"
              value={formik.values.secondaryContactNo}
              onChange={formik.handleChange}
              onBlur={() => formik.setFieldTouched('secondaryContactNo', true)}
              error={formik.touched.secondaryContactNo && Boolean(formik.errors.secondaryContactNo)}
              helperText={
                (formik.touched.secondaryContactNo && formik.errors.secondaryContactNo) as string
              }
              fullWidth
              size="small"
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.email && formik.errors.email)}>
            <TextField
              name="email"
              label="Email *"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={() => formik.setFieldTouched('email', true)}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={(formik.touched.email && formik.errors.email) as string}
              fullWidth
              size="small"
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </ReportForm>
  );
}
