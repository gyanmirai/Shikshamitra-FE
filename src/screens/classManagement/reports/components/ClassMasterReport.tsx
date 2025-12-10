import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';

import { ReportForm } from './ReportForm';
import { useReportOptions } from '../hooks/useReportOptions';

export default function ClassMasterReport() {
  const { classOptions, mediumOptions, statusOptions } = useReportOptions();

  const formik = useFormik({
    initialValues: {
      classes: [] as string[],
      mediums: [] as string[],
      statuses: [] as string[],
    },
    validationSchema: Yup.object({
      classes: Yup.array().min(1, 'At least one class is required'),
    }),
    onSubmit: (values) => {
      console.info('Generate Class Master Report', values);
    },
  });

  const allClassIds = classOptions;
  const allMediumIds = mediumOptions;
  const allStatusIds = statusOptions.map((s) => s.value);

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
          <ShakingTextField error={!!(formik.touched.mediums && formik.errors.mediums)}>
            <ResponsiveMultiSelect
              label="Select Medium"
              options={[
                { id: 'all', name: 'All' },
                ...mediumOptions.map((m) => ({ id: m, name: m })),
              ]}
              value={formik.values.mediums}
              getOptionLabel={(opt) => opt?.name}
              getOptionValue={(opt) => opt?.id}
              onChange={(selectedValues) => {
                const hasAllInSelection = selectedValues.includes('all');
                const wasAllPreviouslySelected = formik.values.mediums.includes('all');
                let finalValues: string[] = [];

                if (hasAllInSelection && !wasAllPreviouslySelected) {
                  finalValues = ['all', ...allMediumIds];
                } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = [];
                } else if (hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = selectedValues.filter((id) => id !== 'all');
                } else {
                  const selectedRealIds = selectedValues.filter((id) => id !== 'all');
                  if (
                    selectedRealIds.length === allMediumIds.length &&
                    allMediumIds.every((id) => selectedRealIds.includes(id))
                  ) {
                    finalValues = ['all', ...allMediumIds];
                  } else {
                    finalValues = selectedRealIds;
                  }
                }
                formik.setFieldValue('mediums', finalValues);
              }}
              error={!!formik.errors.mediums && !!formik.touched.mediums}
              helperText={(formik.touched.mediums && formik.errors.mediums) as string}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.statuses && formik.errors.statuses)}>
            <ResponsiveMultiSelect
              label="Select Status"
              options={[
                { id: 'all', name: 'All' },
                ...statusOptions.map((s) => ({ id: s.value, name: s.label })),
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
      </Grid>
    </ReportForm>
  );
}
