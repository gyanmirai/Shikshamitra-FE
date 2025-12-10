import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ShakingTextField from 'src/components/shaking-text-field';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';

import { ReportForm } from './ReportForm';
import { useLibraryReportOptions } from '../hooks/useLibraryReportOptions';

export default function LibraryAuditReport() {
  const { categoryOptions } = useLibraryReportOptions();

  const formik = useFormik({
    initialValues: {
      categories: [] as string[],
      auditDate: null,
    },
    validationSchema: Yup.object({}),
    onSubmit: (values) => {
      console.info('Generate Library Audit Report', values);
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
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.auditDate && formik.errors.auditDate)}>
            <DatePicker
              label="Audit Date"
              value={formik.values.auditDate}
              onChange={(newValue) => formik.setFieldValue('auditDate', newValue)}
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
