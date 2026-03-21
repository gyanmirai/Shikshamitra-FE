import type { RootState } from 'src/redux/store';

import React from 'react';
import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid } from '@mui/material';
import { useSelector } from 'react-redux';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ShakingTextField from 'src/components/shaking-text-field';
import { ResponsiveMultiSelect } from 'src/components/responsive-multi-select';

import { ReportForm } from './ReportForm';
import { useLibraryReportOptions } from '../hooks/useLibraryReportOptions';

export default function DailyBookReturnReport() {
  const { classOptions, departmentOptions } = useLibraryReportOptions();

  const formik = useFormik({
    initialValues: {
      classes: [] as string[],
      departments: [] as string[],
      returnDate: null,
    },
    validationSchema: Yup.object({}),
    onSubmit: (values) => {
      console.info('Generate Daily Book Return Report', values);
    },
  });

  const allClassIds = classOptions;
  const allDepartmentIds = departmentOptions;

  const { currentYear } = useSelector((state: RootState) => state.globalState);

  return (
    <ReportForm onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.classes && formik.errors.classes)}>
            <ResponsiveMultiSelect
              label="Select Classes"
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
          <ShakingTextField error={!!(formik.touched.departments && formik.errors.departments)}>
            <ResponsiveMultiSelect
              label="Select Departments"
              options={[
                { id: 'all', name: 'All' },
                ...departmentOptions.map((d) => ({ id: d, name: d })),
              ]}
              value={formik.values.departments}
              getOptionLabel={(opt) => opt?.name}
              getOptionValue={(opt) => opt?.id}
              onChange={(selectedValues) => {
                const hasAllInSelection = selectedValues.includes('all');
                const wasAllPreviouslySelected = formik.values.departments.includes('all');
                let finalValues: string[] = [];

                if (hasAllInSelection && !wasAllPreviouslySelected) {
                  finalValues = ['all', ...allDepartmentIds];
                } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = [];
                } else if (hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = selectedValues.filter((id) => id !== 'all');
                } else {
                  const selectedRealIds = selectedValues.filter((id) => id !== 'all');
                  if (
                    selectedRealIds.length === allDepartmentIds.length &&
                    allDepartmentIds.every((id) => selectedRealIds.includes(id))
                  ) {
                    finalValues = ['all', ...allDepartmentIds];
                  } else {
                    finalValues = selectedRealIds;
                  }
                }
                formik.setFieldValue('departments', finalValues);
              }}
              error={!!formik.errors.departments && !!formik.touched.departments}
              helperText={(formik.touched.departments && formik.errors.departments) as string}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.returnDate && formik.errors.returnDate)}>
            <DatePicker
              label="Return Date"
              minDate={dayjs(currentYear?.startDate)}
              maxDate={dayjs(currentYear?.endDate)}
              value={formik.values.returnDate}
              onChange={(newValue) => formik.setFieldValue('returnDate', newValue)}
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
