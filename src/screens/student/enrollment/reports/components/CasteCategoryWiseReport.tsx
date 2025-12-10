import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid, TextField } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { ReportForm } from './ReportForm';
import { useReportOptions } from '../hooks/useReportOptions';

export default function CasteCategoryWiseReport() {
  const { allClasses, genderOptions } = useReportOptions();

  const formik = useFormik({
    initialValues: {
      cast: '',
      studentCount: '',
      gender: 'all',
      class: [] as string[],
    },
    validationSchema: Yup.object({
      cast: Yup.string().required('Caste is required'),
      studentCount: Yup.number().typeError('Must be a number').nullable(),
      gender: Yup.string(),
      class: Yup.array().min(1, 'Class is required'),
    }),
    onSubmit: (values) => {
      console.info('Generate Caste Category Wise Report', values);
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
          <ShakingTextField error={!!(formik.touched.cast && formik.errors.cast)}>
            <TextField
              name="cast"
              label="Caste *"
              value={formik.values.cast}
              onChange={formik.handleChange}
              onBlur={() => formik.setFieldTouched('cast', true)}
              error={formik.touched.cast && Boolean(formik.errors.cast)}
              helperText={(formik.touched.cast && formik.errors.cast) as string}
              fullWidth
              size="small"
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.studentCount && formik.errors.studentCount)}>
            <TextField
              fullWidth
              size="small"
              label="Student Count"
              type="number"
              name="studentCount"
              value={formik.values.studentCount}
              onChange={formik.handleChange}
              onBlur={() => formik.setFieldTouched('studentCount', true)}
              error={formik.touched.studentCount && Boolean(formik.errors.studentCount)}
              helperText={(formik.touched.studentCount && formik.errors.studentCount) as string}
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
      </Grid>
    </ReportForm>
  );
}
