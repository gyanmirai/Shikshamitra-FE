import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid } from '@mui/material';
import { useSelector } from 'react-redux';
import { DatePicker } from '@mui/x-date-pickers';
import React, { useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { ReportForm } from './ReportForm';
import { useReportOptions } from '../hooks/useReportOptions';

export default function MonthlyStrengthSummaryDateRange() {
  const { organizations, attendanceTypeOptions } = useReportOptions();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [allClass, setAllClass] = useState<any[]>([]);
  const [allDivision, setAllDivision] = useState<any[]>([]);

  const formik = useFormik({
    initialValues: {
      organization: '',
      classes: [],
      divisions: [],
      attendanceType: '',
      fromDate: null as Dayjs | null,
      toDate: null as Dayjs | null,
    },
    validationSchema: Yup.object({
      organization: Yup.string().required('Organization is required'),
      classes: Yup.array().min(1, 'At least one class is required'),
      divisions: Yup.array().min(1, 'At least one division is required'),
      attendanceType: Yup.string().required('Attendance type is required'),
      fromDate: Yup.date().required('From date is required').nullable(),
      toDate: Yup.date().required('To date is required').nullable(),
    }),
    onSubmit: (values) => {
      console.info('Generate Monthly Strength Summary (Date Range) Report', values);
    },
  });

  useEffect(() => {
    const standards =
      organizations.find((org: any) => org?.id === formik.values.organization)?.standards || [];

    if (!standards.some((std: any) => std.id === 'all')) {
      standards.unshift({ id: 'all', name: 'All', divisions: [] });
    }
    setAllClass(standards);
  }, [organizations, formik.values.organization]);

  useEffect(() => {
    if (formik.values.classes.length === 0) {
      setAllDivision([]);
      formik.setFieldValue('divisions', []);
      return;
    }

    if (formik.values.classes.length === 1 && formik.values.classes[0] !== 'all') {
      const selectedClass = allClass.find((cls: any) => cls?.id === formik.values.classes[0]);
      const divisions = selectedClass?.divisions || [];
      setAllDivision(divisions);
      const divisionIds = divisions.map((div: any) => div.id);
      formik.setFieldValue('divisions', [...divisionIds]);
    } else {
      setAllDivision([{ id: 'all', name: 'All' }]);
      formik.setFieldValue('divisions', ['all']);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allClass, formik.values.classes]);

  return (
    <ReportForm onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <ShakingTextField error={!!(formik.touched.organization && formik.errors.organization)}>
            <CustomSelect
              options={organizations}
              label="Organization *"
              value={formik.values.organization}
              onChange={(val) => {
                formik.setFieldValue('organization', val);
                const standards =
                  organizations.find((org: any) => org?.id === val)?.standards || [];
                const standardIds = standards.map((standard: any) => standard.id);
                formik.setFieldValue('classes', [
                  'all',
                  ...standardIds.filter((id: string) => id !== 'all'),
                ]);
              }}
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
          <ShakingTextField error={!!(formik.touched.classes && formik.errors.classes)}>
            <CustomSelect
              options={allClass}
              label="Class *"
              multiple
              value={formik.values.classes}
              onChange={(val) => formik.setFieldValue('classes', val)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
              disabled={!formik.values.organization}
              onBlur={() => formik.setFieldTouched('classes', true)}
              error={formik.touched.classes && Boolean(formik.errors.classes)}
              helperText={(formik.touched.classes && formik.errors.classes) as string}
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <ShakingTextField error={!!(formik.touched.divisions && formik.errors.divisions)}>
            <CustomSelect
              options={allDivision}
              label="Division *"
              multiple
              value={formik.values.divisions}
              onChange={(val) => formik.setFieldValue('divisions', val)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
              disabled={formik.values.classes.length === 0}
              onBlur={() => formik.setFieldTouched('divisions', true)}
              error={formik.touched.divisions && Boolean(formik.errors.divisions)}
              helperText={(formik.touched.divisions && formik.errors.divisions) as string}
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
