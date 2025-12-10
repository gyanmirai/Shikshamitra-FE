import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid, TextField } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { ReportForm } from './ReportForm';
import { useReportOptions } from '../hooks/useReportOptions';

export default function ClassWiseStudentEnrollmentReport() {
  const { allClasses, genderOptions, inquiryStatusOptions } = useReportOptions();

  const formik = useFormik({
    initialValues: {
      class: [] as string[],
      totalStudent: '',
      gender: 'all',
      inquiryStatus: 'all',
    },
    validationSchema: Yup.object({
      class: Yup.array().min(1, 'At least one class is required'),
      totalStudent: Yup.number().typeError('Must be a number').nullable(),
      gender: Yup.string(),
      inquiryStatus: Yup.string(),
    }),
    onSubmit: (values) => {
      console.info('Generate Class Wise Student Enrollment Report', values);
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
          <ShakingTextField error={!!(formik.touched.totalStudent && formik.errors.totalStudent)}>
            <TextField
              fullWidth
              size="small"
              label="Total Student"
              type="number"
              name="totalStudent"
              value={formik.values.totalStudent}
              onChange={formik.handleChange}
              onBlur={() => formik.setFieldTouched('totalStudent', true)}
              error={formik.touched.totalStudent && Boolean(formik.errors.totalStudent)}
              helperText={(formik.touched.totalStudent && formik.errors.totalStudent) as string}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.gender && formik.errors.gender)}>
            <CustomSelect
              options={[{ id: 'all', name: 'All' }, ...genderOptions]}
              label="Gender"
              value={formik.values.gender}
              onChange={(val) => formik.setFieldValue('gender', val)}
              onBlur={() => formik.setFieldTouched('gender', true)}
              error={formik.touched.gender && Boolean(formik.errors.gender)}
              helperText={(formik.touched.gender && formik.errors.gender) as string}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.inquiryStatus && formik.errors.inquiryStatus)}>
            <CustomSelect
              options={[{ id: 'all', name: 'All' }, ...inquiryStatusOptions]}
              label="Inquiry Status"
              value={formik.values.inquiryStatus}
              onChange={(val) => formik.setFieldValue('inquiryStatus', val)}
              onBlur={() => formik.setFieldTouched('inquiryStatus', true)}
              error={formik.touched.inquiryStatus && Boolean(formik.errors.inquiryStatus)}
              helperText={(formik.touched.inquiryStatus && formik.errors.inquiryStatus) as string}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </ReportForm>
  );
}
