import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid, TextField } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { ReportForm } from './ReportForm';
import { useReportOptions } from '../hooks/useReportOptions';

export default function AdmissionSourceReport() {
  const { allClasses } = useReportOptions();

  const formik = useFormik({
    initialValues: {
      class: [] as string[],
      studentName: '',
      inquiryPreference: '',
    },
    validationSchema: Yup.object({
      class: Yup.array().min(1, 'Class is required'),
      studentName: Yup.string().required('Student Name is required'),
      inquiryPreference: Yup.string().required('Inquiry Source is required'),
    }),
    onSubmit: (values) => {
      console.info('Generate Admission Source Report', values);
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
          <ShakingTextField
            error={!!(formik.touched.inquiryPreference && formik.errors.inquiryPreference)}
          >
            <TextField
              name="inquiryPreference"
              label="Inquiry Source *"
              value={formik.values.inquiryPreference}
              onChange={formik.handleChange}
              onBlur={() => formik.setFieldTouched('inquiryPreference', true)}
              error={formik.touched.inquiryPreference && Boolean(formik.errors.inquiryPreference)}
              helperText={
                (formik.touched.inquiryPreference && formik.errors.inquiryPreference) as string
              }
              fullWidth
              size="small"
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </ReportForm>
  );
}
