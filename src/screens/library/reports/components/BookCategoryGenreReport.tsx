import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { ResponsiveMultiSelect } from 'src/components/responsive-multi-select';

import { ReportForm } from './ReportForm';
import { useLibraryReportOptions } from '../hooks/useLibraryReportOptions';

export default function BookCategoryGenreReport() {
  const { categoryOptions } = useLibraryReportOptions();

  const formik = useFormik({
    initialValues: {
      categories: [] as string[],
      noOfBooksMin: '',
      noOfBooksMax: '',
      mostPopularBook: '',
      leastIssuedBook: '',
    },
    validationSchema: Yup.object({
      noOfBooksMin: Yup.number().min(0, 'Number must be positive'),
      noOfBooksMax: Yup.number()
        .min(0, 'Number must be positive')
        .when('noOfBooksMin', {
          is: (val: any) => val != null && val !== '',
          then: (schema) =>
            schema.min(Yup.ref('noOfBooksMin'), 'Max must be greater than or equal to min'),
        }),
    }),
    onSubmit: (values) => {
      console.info('Generate Book Category / Genre Report', values);
    },
  });

  const allCategoryIds = categoryOptions;

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

        {/* Number of Books Range */}
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Min No. of Books"
            name="noOfBooksMin"
            type="number"
            value={formik.values.noOfBooksMin}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!formik.errors.noOfBooksMin && !!formik.touched.noOfBooksMin}
            helperText={(formik.touched.noOfBooksMin && formik.errors.noOfBooksMin) as string}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Max No. of Books"
            name="noOfBooksMax"
            type="number"
            value={formik.values.noOfBooksMax}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!formik.errors.noOfBooksMax && !!formik.touched.noOfBooksMax}
            helperText={(formik.touched.noOfBooksMax && formik.errors.noOfBooksMax) as string}
          />
        </Grid>

        {/* Most Popular Book */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Most Popular Book"
            name="mostPopularBook"
            value={formik.values.mostPopularBook}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!formik.errors.mostPopularBook && !!formik.touched.mostPopularBook}
            helperText={(formik.touched.mostPopularBook && formik.errors.mostPopularBook) as string}
          />
        </Grid>

        {/* Least Issued Book */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Least Issued Book"
            name="leastIssuedBook"
            value={formik.values.leastIssuedBook}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!formik.errors.leastIssuedBook && !!formik.touched.leastIssuedBook}
            helperText={(formik.touched.leastIssuedBook && formik.errors.leastIssuedBook) as string}
          />
        </Grid>
      </Grid>
    </ReportForm>
  );
}
