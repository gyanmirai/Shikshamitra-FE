import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { ReportForm } from './ReportForm';
import { useReportOptions } from '../hooks/useReportOptions';

export default function StudentEnrollmentList() {
  const { allClasses, genderOptions } = useReportOptions();

  const formik = useFormik({
    initialValues: {
      enrollmentNo: '',
      class: [] as string[],
      enrollmentDate: null,
      name: '',
      gender: 'all',
      dob: null,
      religion: '',
      cast: '',
      inquiryPreference: '',
      previousSchoolName: '',
      contactNo: '',
    },
    validationSchema: Yup.object({
      enrollmentNo: Yup.string().required('Enrollment No is required'),
      class: Yup.array().min(1, 'Class is required'),
      enrollmentDate: Yup.date().required('Enrollment Date is required').nullable(),
      name: Yup.string().required('Name is required'),
      gender: Yup.string(),
      dob: Yup.date().required('Date of Birth is required').nullable(),
      religion: Yup.string().required('Religion is required'),
      cast: Yup.string().required('Caste is required'),
      inquiryPreference: Yup.string().required('Inquiry Source is required'),
      previousSchoolName: Yup.string().required('Previous School Name is required'),
      contactNo: Yup.string().required('Contact No is required'),
    }),
    onSubmit: (values) => {
      console.info('Generate Student Enrollment List Report', values);
    },
  });

  const handleClassChange = (val: any) => {
    const value = val as string[];
    const allClassIds = allClasses
      .filter((c: { id: string }) => c.id !== 'all')
      .map((c: { id: any }) => c.id);
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
          <ShakingTextField
            error={!!(formik.touched.enrollmentDate && formik.errors.enrollmentDate)}
          >
            <DatePicker
              label="Enrollment Date *"
              value={formik.values.enrollmentDate}
              onChange={(date) => formik.setFieldValue('enrollmentDate', date)}
              slotProps={{
                textField: {
                  size: 'small',
                  error: formik.touched.enrollmentDate && Boolean(formik.errors.enrollmentDate),
                  helperText: (formik.touched.enrollmentDate &&
                    formik.errors.enrollmentDate) as string,
                  fullWidth: true,
                  onBlur: () => formik.setFieldTouched('enrollmentDate', true),
                },
              }}
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
          <ShakingTextField error={!!(formik.touched.religion && formik.errors.religion)}>
            <TextField
              name="religion"
              label="Religion *"
              value={formik.values.religion}
              onChange={formik.handleChange}
              onBlur={() => formik.setFieldTouched('religion', true)}
              error={formik.touched.religion && Boolean(formik.errors.religion)}
              helperText={(formik.touched.religion && formik.errors.religion) as string}
              fullWidth
              size="small"
            />
          </ShakingTextField>
        </Grid>

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
          <ShakingTextField error={!!(formik.touched.contactNo && formik.errors.contactNo)}>
            <TextField
              name="contactNo"
              label="Contact No *"
              value={formik.values.contactNo}
              onChange={formik.handleChange}
              onBlur={() => formik.setFieldTouched('contactNo', true)}
              error={formik.touched.contactNo && Boolean(formik.errors.contactNo)}
              helperText={(formik.touched.contactNo && formik.errors.contactNo) as string}
              fullWidth
              size="small"
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </ReportForm>
  );
}
