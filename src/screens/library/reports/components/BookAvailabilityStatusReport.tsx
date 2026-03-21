import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { ResponsiveMultiSelect } from 'src/components/responsive-multi-select';

import { ReportForm } from './ReportForm';
import { useLibraryReportOptions } from '../hooks/useLibraryReportOptions';

export default function BookAvailabilityStatusReport() {
  const { categoryOptions, authorOptions } = useLibraryReportOptions();

  const formik = useFormik({
    initialValues: {
      categories: [] as string[],
      authors: [] as string[],
      bookId: '',
      title: '',
      totalCopiesMin: '',
      totalCopiesMax: '',
      availableMin: '',
      availableMax: '',
      issuedMin: '',
      issuedMax: '',
      reservedMin: '',
      reservedMax: '',
    },
    validationSchema: Yup.object({
      totalCopiesMin: Yup.number().min(0, 'Number must be positive'),
      totalCopiesMax: Yup.number()
        .min(0, 'Number must be positive')
        .when('totalCopiesMin', {
          is: (val: any) => val != null && val !== '',
          then: (schema) =>
            schema.min(Yup.ref('totalCopiesMin'), 'Max must be greater than or equal to min'),
        }),
      availableMin: Yup.number().min(0, 'Number must be positive'),
      availableMax: Yup.number()
        .min(0, 'Number must be positive')
        .when('availableMin', {
          is: (val: any) => val != null && val !== '',
          then: (schema) =>
            schema.min(Yup.ref('availableMin'), 'Max must be greater than or equal to min'),
        }),
      issuedMin: Yup.number().min(0, 'Number must be positive'),
      issuedMax: Yup.number()
        .min(0, 'Number must be positive')
        .when('issuedMin', {
          is: (val: any) => val != null && val !== '',
          then: (schema) =>
            schema.min(Yup.ref('issuedMin'), 'Max must be greater than or equal to min'),
        }),
      reservedMin: Yup.number().min(0, 'Number must be positive'),
      reservedMax: Yup.number()
        .min(0, 'Number must be positive')
        .when('reservedMin', {
          is: (val: any) => val != null && val !== '',
          then: (schema) =>
            schema.min(Yup.ref('reservedMin'), 'Max must be greater than or equal to min'),
        }),
    }),
    onSubmit: (values) => {
      console.info('Generate Book Availability Status Report', values);
    },
  });

  const allCategoryIds = categoryOptions;
  const allAuthorIds = authorOptions;

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
          <ShakingTextField error={!!(formik.touched.authors && formik.errors.authors)}>
            <ResponsiveMultiSelect
              label="Select Authors"
              options={[
                { id: 'all', name: 'All' },
                ...authorOptions.map((a) => ({ id: a, name: a })),
              ]}
              value={formik.values.authors}
              getOptionLabel={(opt) => opt?.name}
              getOptionValue={(opt) => opt?.id}
              onChange={(selectedValues) => {
                const hasAllInSelection = selectedValues.includes('all');
                const wasAllPreviouslySelected = formik.values.authors.includes('all');
                let finalValues: string[] = [];

                if (hasAllInSelection && !wasAllPreviouslySelected) {
                  finalValues = ['all', ...allAuthorIds];
                } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = [];
                } else if (hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = selectedValues.filter((id) => id !== 'all');
                } else {
                  const selectedRealIds = selectedValues.filter((id) => id !== 'all');
                  if (
                    selectedRealIds.length === allAuthorIds.length &&
                    allAuthorIds.every((id) => selectedRealIds.includes(id))
                  ) {
                    finalValues = ['all', ...allAuthorIds];
                  } else {
                    finalValues = selectedRealIds;
                  }
                }
                formik.setFieldValue('authors', finalValues);
              }}
              error={!!formik.errors.authors && !!formik.touched.authors}
              helperText={(formik.touched.authors && formik.errors.authors) as string}
            />
          </ShakingTextField>
        </Grid>

        {/* Book ID */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Book ID"
            name="bookId"
            value={formik.values.bookId}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!formik.errors.bookId && !!formik.touched.bookId}
            helperText={(formik.touched.bookId && formik.errors.bookId) as string}
          />
        </Grid>

        {/* Title */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Title"
            name="title"
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!formik.errors.title && !!formik.touched.title}
            helperText={(formik.touched.title && formik.errors.title) as string}
          />
        </Grid>

        {/* Total Copies Range */}
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Min Total Copies"
            name="totalCopiesMin"
            type="number"
            value={formik.values.totalCopiesMin}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!formik.errors.totalCopiesMin && !!formik.touched.totalCopiesMin}
            helperText={(formik.touched.totalCopiesMin && formik.errors.totalCopiesMin) as string}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Max Total Copies"
            name="totalCopiesMax"
            type="number"
            value={formik.values.totalCopiesMax}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!formik.errors.totalCopiesMax && !!formik.touched.totalCopiesMax}
            helperText={(formik.touched.totalCopiesMax && formik.errors.totalCopiesMax) as string}
          />
        </Grid>

        {/* Available Range */}
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Min Available"
            name="availableMin"
            type="number"
            value={formik.values.availableMin}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!formik.errors.availableMin && !!formik.touched.availableMin}
            helperText={(formik.touched.availableMin && formik.errors.availableMin) as string}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Max Available"
            name="availableMax"
            type="number"
            value={formik.values.availableMax}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!formik.errors.availableMax && !!formik.touched.availableMax}
            helperText={(formik.touched.availableMax && formik.errors.availableMax) as string}
          />
        </Grid>

        {/* Issued Range */}
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Min Issued"
            name="issuedMin"
            type="number"
            value={formik.values.issuedMin}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!formik.errors.issuedMin && !!formik.touched.issuedMin}
            helperText={(formik.touched.issuedMin && formik.errors.issuedMin) as string}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Max Issued"
            name="issuedMax"
            type="number"
            value={formik.values.issuedMax}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!formik.errors.issuedMax && !!formik.touched.issuedMax}
            helperText={(formik.touched.issuedMax && formik.errors.issuedMax) as string}
          />
        </Grid>

        {/* Reserved Range */}
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Min Reserved"
            name="reservedMin"
            type="number"
            value={formik.values.reservedMin}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!formik.errors.reservedMin && !!formik.touched.reservedMin}
            helperText={(formik.touched.reservedMin && formik.errors.reservedMin) as string}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Max Reserved"
            name="reservedMax"
            type="number"
            value={formik.values.reservedMax}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!formik.errors.reservedMax && !!formik.touched.reservedMax}
            helperText={(formik.touched.reservedMax && formik.errors.reservedMax) as string}
          />
        </Grid>
      </Grid>
    </ReportForm>
  );
}
