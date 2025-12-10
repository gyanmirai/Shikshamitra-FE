import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';

import { ReportForm } from './ReportForm';
import { useLibraryReportOptions } from '../hooks/useLibraryReportOptions';

export default function BookMasterReport() {
  const { categoryOptions, authorOptions, publisherOptions, bookStatusOptions } =
    useLibraryReportOptions();

  const formik = useFormik({
    initialValues: {
      categories: [] as string[],
      authors: [] as string[],
      publishers: [] as string[],
      statuses: [] as string[],
      isbn: '',
      priceMin: '',
      priceMax: '',
      totalCopiesMin: '',
      totalCopiesMax: '',
      availableCopiesMin: '',
      availableCopiesMax: '',
      shelfNo: '',
    },
    validationSchema: Yup.object({
      priceMin: Yup.number().min(0, 'Price must be positive'),
      priceMax: Yup.number()
        .min(0, 'Price must be positive')
        .when('priceMin', {
          is: (val: any) => val != null && val !== '',
          then: (schema) =>
            schema.min(Yup.ref('priceMin'), 'Max price must be greater than or equal to min price'),
        }),
      totalCopiesMin: Yup.number().min(0, 'Copies must be positive'),
      totalCopiesMax: Yup.number()
        .min(0, 'Copies must be positive')
        .when('totalCopiesMin', {
          is: (val: any) => val != null && val !== '',
          then: (schema) =>
            schema.min(Yup.ref('totalCopiesMin'), 'Max must be greater than or equal to min'),
        }),
      availableCopiesMin: Yup.number().min(0, 'Copies must be positive'),
      availableCopiesMax: Yup.number()
        .min(0, 'Copies must be positive')
        .when('availableCopiesMin', {
          is: (val: any) => val != null && val !== '',
          then: (schema) =>
            schema.min(Yup.ref('availableCopiesMin'), 'Max must be greater than or equal to min'),
        }),
    }),
    onSubmit: (values) => {
      console.info('Generate Book Master Report', values);
    },
  });

  const allCategoryIds = categoryOptions;
  const allAuthorIds = authorOptions;
  const allPublisherIds = publisherOptions;
  const allStatusIds = bookStatusOptions;

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
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.publishers && formik.errors.publishers)}>
            <ResponsiveMultiSelect
              label="Select Publishers"
              options={[
                { id: 'all', name: 'All' },
                ...publisherOptions.map((p) => ({ id: p, name: p })),
              ]}
              value={formik.values.publishers}
              getOptionLabel={(opt) => opt?.name}
              getOptionValue={(opt) => opt?.id}
              onChange={(selectedValues) => {
                const hasAllInSelection = selectedValues.includes('all');
                const wasAllPreviouslySelected = formik.values.publishers.includes('all');
                let finalValues: string[] = [];

                if (hasAllInSelection && !wasAllPreviouslySelected) {
                  finalValues = ['all', ...allPublisherIds];
                } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = [];
                } else if (hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = selectedValues.filter((id) => id !== 'all');
                } else {
                  const selectedRealIds = selectedValues.filter((id) => id !== 'all');
                  if (
                    selectedRealIds.length === allPublisherIds.length &&
                    allPublisherIds.every((id) => selectedRealIds.includes(id))
                  ) {
                    finalValues = ['all', ...allPublisherIds];
                  } else {
                    finalValues = selectedRealIds;
                  }
                }
                formik.setFieldValue('publishers', finalValues);
              }}
              error={!!formik.errors.publishers && !!formik.touched.publishers}
              helperText={(formik.touched.publishers && formik.errors.publishers) as string}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.statuses && formik.errors.statuses)}>
            <ResponsiveMultiSelect
              label="Select Status"
              options={[
                { id: 'all', name: 'All' },
                ...bookStatusOptions.map((s) => ({ id: s, name: s })),
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

        {/* ISBN Filter */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="ISBN"
            name="isbn"
            value={formik.values.isbn}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!formik.errors.isbn && !!formik.touched.isbn}
            helperText={(formik.touched.isbn && formik.errors.isbn) as string}
          />
        </Grid>

        {/* Price Range */}
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Min Price"
            name="priceMin"
            type="number"
            value={formik.values.priceMin}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!formik.errors.priceMin && !!formik.touched.priceMin}
            helperText={(formik.touched.priceMin && formik.errors.priceMin) as string}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Max Price"
            name="priceMax"
            type="number"
            value={formik.values.priceMax}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!formik.errors.priceMax && !!formik.touched.priceMax}
            helperText={(formik.touched.priceMax && formik.errors.priceMax) as string}
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

        {/* Available Copies Range */}
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Min Available Copies"
            name="availableCopiesMin"
            type="number"
            value={formik.values.availableCopiesMin}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!formik.errors.availableCopiesMin && !!formik.touched.availableCopiesMin}
            helperText={
              (formik.touched.availableCopiesMin && formik.errors.availableCopiesMin) as string
            }
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Max Available Copies"
            name="availableCopiesMax"
            type="number"
            value={formik.values.availableCopiesMax}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!formik.errors.availableCopiesMax && !!formik.touched.availableCopiesMax}
            helperText={
              (formik.touched.availableCopiesMax && formik.errors.availableCopiesMax) as string
            }
          />
        </Grid>

        {/* Shelf Number */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Shelf Number"
            name="shelfNo"
            value={formik.values.shelfNo}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!formik.errors.shelfNo && !!formik.touched.shelfNo}
            helperText={(formik.touched.shelfNo && formik.errors.shelfNo) as string}
          />
        </Grid>
      </Grid>
    </ReportForm>
  );
}
