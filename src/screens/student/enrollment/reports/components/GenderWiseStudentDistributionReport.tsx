import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid, TextField } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { ReportForm } from './ReportForm';
import { useReportOptions } from '../hooks/useReportOptions';

export default function GenderWiseStudentDistributionReport() {
  const { allClasses } = useReportOptions();

  const formik = useFormik({
    initialValues: {
      class: [] as string[],
      section: '',
      noOfBoys: '',
      noOfGirls: '',
      totalStudent: '',
    },
    validationSchema: Yup.object({
      class: Yup.array().min(1, 'Class is required'),
      section: Yup.string().required('Section is required'),
      noOfBoys: Yup.number().typeError('Must be a number').nullable(),
      noOfGirls: Yup.number().typeError('Must be a number').nullable(),
      totalStudent: Yup.number().typeError('Must be a number').nullable(),
    }),
    onSubmit: (values) => {
      console.info('Generate Gender Wise Student Distribution Report', values);
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
          <ShakingTextField error={!!(formik.touched.section && formik.errors.section)}>
            <TextField
              name="section"
              label="Section *"
              value={formik.values.section}
              onChange={formik.handleChange}
              onBlur={() => formik.setFieldTouched('section', true)}
              error={formik.touched.section && Boolean(formik.errors.section)}
              helperText={(formik.touched.section && formik.errors.section) as string}
              fullWidth
              size="small"
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.noOfBoys && formik.errors.noOfBoys)}>
            <TextField
              fullWidth
              size="small"
              label="No of Boys"
              type="number"
              name="noOfBoys"
              value={formik.values.noOfBoys}
              onChange={formik.handleChange}
              onBlur={() => formik.setFieldTouched('noOfBoys', true)}
              error={formik.touched.noOfBoys && Boolean(formik.errors.noOfBoys)}
              helperText={(formik.touched.noOfBoys && formik.errors.noOfBoys) as string}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.noOfGirls && formik.errors.noOfGirls)}>
            <TextField
              fullWidth
              size="small"
              label="No of Girls"
              type="number"
              name="noOfGirls"
              value={formik.values.noOfGirls}
              onChange={formik.handleChange}
              onBlur={() => formik.setFieldTouched('noOfGirls', true)}
              error={formik.touched.noOfGirls && Boolean(formik.errors.noOfGirls)}
              helperText={(formik.touched.noOfGirls && formik.errors.noOfGirls) as string}
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
      </Grid>
    </ReportForm>
  );
}
