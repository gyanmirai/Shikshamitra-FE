import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid, TextField } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { ReportForm } from './ReportForm';
import { useReportOptions } from '../hooks/useReportOptions';

export default function PinCodeWiseStudentDistribution() {
  const { allClasses, genderOptions } = useReportOptions();

  const formik = useFormik({
    initialValues: {
      pincode: '',
      studentCount: '',
      class: [] as string[],
      cityArea: '',
      gender: 'all',
    },
    validationSchema: Yup.object({
      pincode: Yup.string().required('Pincode is required'),
      studentCount: Yup.number().typeError('Must be a number').nullable(),
      class: Yup.array().min(1, 'Class is required'),
      cityArea: Yup.string().required('City Area is required'),
      gender: Yup.string(),
    }),
    onSubmit: (values) => {
      console.info('Generate PinCode Wise Student Distribution Report', values);
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
          <ShakingTextField error={!!(formik.touched.pincode && formik.errors.pincode)}>
            <TextField
              fullWidth
              size="small"
              type="number"
              name="pincode"
              label="Pincode *"
              value={formik.values.pincode}
              onChange={formik.handleChange}
              onBlur={() => formik.setFieldTouched('pincode', true)}
              error={formik.touched.pincode && Boolean(formik.errors.pincode)}
              helperText={(formik.touched.pincode && formik.errors.pincode) as string}
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
          <ShakingTextField error={!!(formik.touched.cityArea && formik.errors.cityArea)}>
            <TextField
              name="cityArea"
              label="City Area *"
              value={formik.values.cityArea}
              onChange={formik.handleChange}
              onBlur={() => formik.setFieldTouched('cityArea', true)}
              error={formik.touched.cityArea && Boolean(formik.errors.cityArea)}
              helperText={(formik.touched.cityArea && formik.errors.cityArea) as string}
              fullWidth
              size="small"
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
