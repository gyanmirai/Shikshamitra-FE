import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';

import { ReportForm } from './ReportForm';
import { useReportOptions } from '../hooks/useReportOptions';

export default function SubjectMasterReport() {
  const { subjectTypeOptions, statusOptions } = useReportOptions();

  const formik = useFormik({
    initialValues: {
      subjectTypes: [] as string[],
      statuses: [] as string[],
    },
    validationSchema: Yup.object({}),
    onSubmit: (values) => {
      console.info('Generate Subject Master Report', values);
    },
  });

  const allSubjectTypeIds = subjectTypeOptions;
  const allStatusIds = statusOptions.map((s) => s.value);

  return (
    <ReportForm onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.subjectTypes && formik.errors.subjectTypes)}>
            <ResponsiveMultiSelect
              label="Select Subject Types"
              options={[
                { id: 'all', name: 'All' },
                ...subjectTypeOptions.map((s) => ({ id: s, name: s })),
              ]}
              value={formik.values.subjectTypes}
              getOptionLabel={(opt) => opt?.name}
              getOptionValue={(opt) => opt?.id}
              onChange={(selectedValues) => {
                const hasAllInSelection = selectedValues.includes('all');
                const wasAllPreviouslySelected = formik.values.subjectTypes.includes('all');
                let finalValues: string[] = [];

                if (hasAllInSelection && !wasAllPreviouslySelected) {
                  finalValues = ['all', ...allSubjectTypeIds];
                } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = [];
                } else if (hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = selectedValues.filter((id) => id !== 'all');
                } else {
                  const selectedRealIds = selectedValues.filter((id) => id !== 'all');
                  if (
                    selectedRealIds.length === allSubjectTypeIds.length &&
                    allSubjectTypeIds.every((id) => selectedRealIds.includes(id))
                  ) {
                    finalValues = ['all', ...allSubjectTypeIds];
                  } else {
                    finalValues = selectedRealIds;
                  }
                }
                formik.setFieldValue('subjectTypes', finalValues);
              }}
              error={!!formik.errors.subjectTypes && !!formik.touched.subjectTypes}
              helperText={(formik.touched.subjectTypes && formik.errors.subjectTypes) as string}
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
