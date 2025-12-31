import type { RootState } from 'src/redux/store';

import React from 'react';
import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid } from '@mui/material';
import { useSelector } from 'react-redux';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ShakingTextField from 'src/components/shaking-text-field';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';

import { ReportForm } from './ReportForm';
import { useReportOptions } from '../hooks/useReportOptions';

export default function SectionChangeRequestReport() {
  const { classOptions, requestStatusOptions } = useReportOptions();

  const formik = useFormik({
    initialValues: {
      classes: [] as string[],
      startDate: null,
      endDate: null,
      statuses: [] as string[],
    },
    validationSchema: Yup.object({
      classes: Yup.array().min(1, 'At least one class is required'),
    }),
    onSubmit: (values) => {
      console.info('Generate Section Change Request Report', values);
    },
  });

  const allClassIds = classOptions;
  const allStatusIds = requestStatusOptions;
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  return (
    <ReportForm onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.classes && formik.errors.classes)}>
            <ResponsiveMultiSelect
              label="Select Classes *"
              options={[
                { id: 'all', name: 'All' },
                ...classOptions.map((c) => ({ id: c, name: c })),
              ]}
              value={formik.values.classes}
              getOptionLabel={(opt) => opt?.name}
              getOptionValue={(opt) => opt?.id}
              onChange={(selectedValues) => {
                const hasAllInSelection = selectedValues.includes('all');
                const wasAllPreviouslySelected = formik.values.classes.includes('all');
                let finalValues: string[] = [];

                if (hasAllInSelection && !wasAllPreviouslySelected) {
                  finalValues = ['all', ...allClassIds];
                } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = [];
                } else if (hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = selectedValues.filter((id) => id !== 'all');
                } else {
                  const selectedRealIds = selectedValues.filter((id) => id !== 'all');
                  if (
                    selectedRealIds.length === allClassIds.length &&
                    allClassIds.every((id) => selectedRealIds.includes(id))
                  ) {
                    finalValues = ['all', ...allClassIds];
                  } else {
                    finalValues = selectedRealIds;
                  }
                }
                formik.setFieldValue('classes', finalValues);
              }}
              error={!!formik.errors.classes && !!formik.touched.classes}
              helperText={(formik.touched.classes && formik.errors.classes) as string}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.statuses && formik.errors.statuses)}>
            <ResponsiveMultiSelect
              label="Select Status"
              options={[
                { id: 'all', name: 'All' },
                ...requestStatusOptions.map((s) => ({ id: s, name: s })),
              ]}
              value={formik.values.statuses}
              getOptionLabel={(opt) => opt?.name}
              getOptionValue={(opt) => opt?.id}
              onChange={(selectedValues) => {
                const hasAllInSelection = selectedValues.includes('all');
                const wasAllPreviouslySelected = formik.values.statuses.includes('all');
                let finalValues: string[] = [];

                if (hasAllInSelection && !wasAllPreviouslySelected) {
                  finalValues = ['all', ...allStatusIds];
                } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = [];
                } else if (hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = selectedValues.filter((id) => id !== 'all');
                } else {
                  const selectedRealIds = selectedValues.filter((id) => id !== 'all');
                  if (
                    selectedRealIds.length === allStatusIds.length &&
                    allStatusIds.every((id) => selectedRealIds.includes(id))
                  ) {
                    finalValues = ['all', ...allStatusIds];
                  } else {
                    finalValues = selectedRealIds;
                  }
                }
                formik.setFieldValue('statuses', finalValues);
              }}
              error={!!formik.errors.statuses && !!formik.touched.statuses}
              helperText={(formik.touched.statuses && formik.errors.statuses) as string}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.startDate && formik.errors.startDate)}>
            <DatePicker
              label="Start Date"
              minDate={dayjs(currentYear?.startDate)}
              maxDate={dayjs(currentYear?.endDate)}
              value={formik.values.startDate}
              onChange={(newValue) => formik.setFieldValue('startDate', newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                },
              }}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.endDate && formik.errors.endDate)}>
            <DatePicker
              label="End Date"
              minDate={dayjs(currentYear?.startDate)}
              maxDate={dayjs(currentYear?.endDate)}
              value={formik.values.endDate}
              onChange={(newValue) => formik.setFieldValue('endDate', newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                },
              }}
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </ReportForm>
  );
}
