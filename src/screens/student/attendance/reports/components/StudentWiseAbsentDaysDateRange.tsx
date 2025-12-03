import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';

import React from 'react';
import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { Grid, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { ReportForm } from './ReportForm';
import { useReportOptions } from '../hooks/useReportOptions';

export default function StudentWiseAbsentDaysDateRange() {
  const { organizations, attendanceTypeOptions } = useReportOptions();
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const formik = useFormik({
    initialValues: {
      organization: '',
      attendanceType: '',
      rollNo: '',
      fromDate: null as Dayjs | null,
      toDate: null as Dayjs | null,
    },
    validationSchema: Yup.object({
      organization: Yup.string().required('Organization is required'),
      attendanceType: Yup.string().required('Attendance type is required'),
      rollNo: Yup.string().required('Roll number is required'),
      fromDate: Yup.date().required('From date is required').nullable(),
      toDate: Yup.date().required('To date is required').nullable(),
    }),
    onSubmit: (values) => {
      console.info('Generate Student-Wise Absent Days (Date Range) Report', values);
    },
  });

  return (
    <ReportForm onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <ShakingTextField error={!!(formik.touched.organization && formik.errors.organization)}>
            <CustomSelect
              options={organizations}
              label="Organization *"
              value={formik.values.organization}
              onChange={(val) => formik.setFieldValue('organization', val)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
              onBlur={() => formik.setFieldTouched('organization', true)}
              error={formik.touched.organization && Boolean(formik.errors.organization)}
              helperText={(formik.touched.organization && formik.errors.organization) as string}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <ShakingTextField
            error={!!(formik.touched.attendanceType && formik.errors.attendanceType)}
          >
            <CustomSelect
              options={attendanceTypeOptions}
              label="Attendance Type *"
              value={formik.values.attendanceType}
              onChange={(val) => formik.setFieldValue('attendanceType', val)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
              onBlur={() => formik.setFieldTouched('attendanceType', true)}
              error={formik.touched.attendanceType && Boolean(formik.errors.attendanceType)}
              helperText={(formik.touched.attendanceType && formik.errors.attendanceType) as string}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <ShakingTextField error={!!(formik.touched.rollNo && formik.errors.rollNo)}>
            <TextField
              label="Roll No *"
              size="small"
              fullWidth
              value={formik.values.rollNo}
              onChange={formik.handleChange}
              name="rollNo"
              error={formik.touched.rollNo && Boolean(formik.errors.rollNo)}
              helperText={(formik.touched.rollNo && formik.errors.rollNo) as string}
              onBlur={() => formik.setFieldTouched('rollNo', true)}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <ShakingTextField error={!!(formik.touched.fromDate && formik.errors.fromDate)}>
            <DatePicker
              label="From Date *"
              disableFuture
              format="DD/MM/YYYY"
              minDate={dayjs(currentYear?.startDate)}
              maxDate={dayjs(currentYear?.endDate)}
              value={formik.values.fromDate}
              onChange={(date) => formik.setFieldValue('fromDate', date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  error: formik.touched.fromDate && Boolean(formik.errors.fromDate),
                  helperText: (formik.touched.fromDate && formik.errors.fromDate) as string,
                  onBlur: () => formik.setFieldTouched('fromDate', true),
                },
              }}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <ShakingTextField error={!!(formik.touched.toDate && formik.errors.toDate)}>
            <DatePicker
              label="To Date *"
              disableFuture
              format="DD/MM/YYYY"
              minDate={dayjs(currentYear?.startDate)}
              maxDate={dayjs(currentYear?.endDate)}
              value={formik.values.toDate}
              onChange={(date) => formik.setFieldValue('toDate', date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  error: formik.touched.toDate && Boolean(formik.errors.toDate),
                  helperText: (formik.touched.toDate && formik.errors.toDate) as string,
                  onBlur: () => formik.setFieldTouched('toDate', true),
                },
              }}
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </ReportForm>
  );
}
