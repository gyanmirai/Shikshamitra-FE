import type { RootState } from 'src/redux/store';

import React from 'react';
import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { Grid, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ShakingTextField from 'src/components/shaking-text-field';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';

import { ReportForm } from './ReportForm';
import { useLibraryReportOptions } from '../hooks/useLibraryReportOptions';

export default function MostIssuedBooksReport() {
  const { categoryOptions } = useLibraryReportOptions();

  const formik = useFormik({
    initialValues: {
      categories: [] as string[],
      startDate: null,
      endDate: null,
      topN: '10',
    },
    validationSchema: Yup.object({}),
    onSubmit: (values) => {
      console.info('Generate Most Issued Books Report', values);
    },
  });

  const allCategoryIds = categoryOptions;

  const { currentYear } = useSelector((state: RootState) => state.globalState);

  return (
    <ReportForm onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.categories && formik.errors.categories)}>
            <ResponsiveMultiSelect
              label="Select Categories"
              options={[
                { id: 'all', name: 'All' },
                ...categoryOptions.map((c) => ({ id: c, name: c })),
              ]}
              value={formik.values.categories}
              getOptionLabel={(opt) => opt?.name}
              getOptionValue={(opt) => opt?.id}
              onChange={(selectedValues) => {
                const hasAllInSelection = selectedValues.includes('all');
                const wasAllPreviouslySelected = formik.values.categories.includes('all');
                let finalValues: string[] = [];

                if (hasAllInSelection && !wasAllPreviouslySelected) {
                  finalValues = ['all', ...allCategoryIds];
                } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = [];
                } else if (hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = selectedValues.filter((id) => id !== 'all');
                } else {
                  const selectedRealIds = selectedValues.filter((id) => id !== 'all');
                  if (
                    selectedRealIds.length === allCategoryIds.length &&
                    allCategoryIds.every((id) => selectedRealIds.includes(id))
                  ) {
                    finalValues = ['all', ...allCategoryIds];
                  } else {
                    finalValues = selectedRealIds;
                  }
                }
                formik.setFieldValue('categories', finalValues);
              }}
              error={!!formik.errors.categories && !!formik.touched.categories}
              helperText={(formik.touched.categories && formik.errors.categories) as string}
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
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.topN && formik.errors.topN)}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Top N Books"
              name="topN"
              value={formik.values.topN}
              onChange={formik.handleChange}
              error={!!formik.errors.topN && !!formik.touched.topN}
              helperText={(formik.touched.topN && formik.errors.topN) as string}
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </ReportForm>
  );
}
