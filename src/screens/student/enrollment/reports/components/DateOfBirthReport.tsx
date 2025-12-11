import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { ReportForm } from './ReportForm';
import { useReportOptions } from '../hooks/useReportOptions';

export default function DateOfBirthReport() {
  const { allClasses, genderOptions } = useReportOptions();

  const formik = useFormik({
    initialValues: {
      enrollmentNo: '',
      studentName: '',
      dob: null,
      age: '',
      class: [] as string[],
      gender: 'all',
    },
    validationSchema: Yup.object({
      enrollmentNo: Yup.string().required('Enrollment No is required'),
      studentName: Yup.string().required('Student Name is required'),
      dob: Yup.date().required('Date of Birth is required').nullable(),
      age: Yup.number().typeError('Must be a number').nullable(),
      class: Yup.array().min(1, 'Class is required'),
      gender: Yup.string(),
    }),
    onSubmit: (values) => {
      console.info('Generate Date of Birth Report', values);
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
          <ShakingTextField error={!!(formik.touched.dob && formik.errors.dob)}>
            <DatePicker
              label="Date of Birth *"
              value={formik.values.dob}
              onChange={(date) => formik.setFieldValue('dob', date)}
              slotProps={{
                textField: {
                  size: 'small',
                  error: formik.touched.dob && Boolean(formik.errors.dob),
                  helperText: (formik.touched.dob && formik.errors.dob) as string,
                  fullWidth: true,
                  onBlur: () => formik.setFieldTouched('dob', true),
                },
              }}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.age && formik.errors.age)}>
            <TextField
              fullWidth
              size="small"
              type="number"
              name="age"
              label="Age"
              value={formik.values.age}
              onChange={formik.handleChange}
              onBlur={() => formik.setFieldTouched('age', true)}
              error={formik.touched.age && Boolean(formik.errors.age)}
              helperText={(formik.touched.age && formik.errors.age) as string}
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
