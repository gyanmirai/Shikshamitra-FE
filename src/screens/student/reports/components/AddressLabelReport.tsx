import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid, TextField } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { ReportForm } from './ReportForm';
import { useReportOptions } from '../hooks/useReportOptions';

export default function AddressLabelReport() {
  const { organizations, allClasses } = useReportOptions();

  const formik = useFormik({
    initialValues: {
      organization: '',
      class: [] as string[],
      division: '',
      fromRollNo: '',
      toRollNo: '',
    },
    validationSchema: Yup.object({
      organization: Yup.string().required('Organization is required'),
      class: Yup.array()
        .min(1, 'At least one class must be selected')
        .required('Class is required'),
      division: Yup.string().required('Division is required'),
      fromRollNo: Yup.string().required('From Roll No is required'),
      toRollNo: Yup.string().required('To Roll No is required'),
    }),
    onSubmit: (values) => {},
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
      <Grid size={{ xs: 12, md: 6 }}>
        <ShakingTextField error={!!(formik.touched.organization && formik.errors.organization)}>
          <CustomSelect
            options={organizations}
            label="Organization *"
            value={formik.values.organization}
            onChange={(val) => formik.setFieldValue('organization', val)}
            onBlur={() => formik.setFieldTouched('organization', true)}
            error={formik.touched.organization && Boolean(formik.errors.organization)}
            helperText={(formik.touched.organization && formik.errors.organization) as string}
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

      <Grid size={{ xs: 12, md: 6 }}>
        <ShakingTextField error={!!(formik.touched.division && formik.errors.division)}>
          <TextField
            name="division"
            label="Division *"
            value={formik.values.division}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.division && Boolean(formik.errors.division)}
            helperText={(formik.touched.division && formik.errors.division) as string}
            fullWidth
            size="small"
          />
        </ShakingTextField>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ShakingTextField error={!!(formik.touched.fromRollNo && formik.errors.fromRollNo)}>
          <TextField
            name="fromRollNo"
            label="From Roll No *"
            type="number"
            value={formik.values.fromRollNo}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.fromRollNo && Boolean(formik.errors.fromRollNo)}
            helperText={(formik.touched.fromRollNo && formik.errors.fromRollNo) as string}
            fullWidth
            size="small"
          />
        </ShakingTextField>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ShakingTextField error={!!(formik.touched.toRollNo && formik.errors.toRollNo)}>
          <TextField
            name="toRollNo"
            label="To Roll No *"
            type="number"
            value={formik.values.toRollNo}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.toRollNo && Boolean(formik.errors.toRollNo)}
            helperText={(formik.touched.toRollNo && formik.errors.toRollNo) as string}
            fullWidth
            size="small"
          />
        </ShakingTextField>
      </Grid>
    </ReportForm>
  );
}
