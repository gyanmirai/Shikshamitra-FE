import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';

import { ReportForm } from './ReportForm';
import { useLibraryReportOptions } from '../hooks/useLibraryReportOptions';

export default function LibraryMemberListStudentsReport() {
  const { classOptions, sectionOptions, memberStatusOptions } = useLibraryReportOptions();

  const formik = useFormik({
    initialValues: {
      classes: [] as string[],
      sections: [] as string[],
      statuses: [] as string[],
    },
    validationSchema: Yup.object({}),
    onSubmit: (values) => {
      console.info('Generate Library Member List (Students) Report', values);
    },
  });

  const allClassIds = classOptions;
  const allSectionIds = sectionOptions;
  const allStatusIds = memberStatusOptions;

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
          <ShakingTextField error={!!(formik.touched.sections && formik.errors.sections)}>
            <ResponsiveMultiSelect
              label="Select Sections"
              options={[
                { id: 'all', name: 'All' },
                ...sectionOptions.map((s) => ({ id: s, name: s })),
              ]}
              value={formik.values.sections}
              getOptionLabel={(opt) => opt?.name}
              getOptionValue={(opt) => opt?.id}
              onChange={(selectedValues) => {
                const hasAllInSelection = selectedValues.includes('all');
                const wasAllPreviouslySelected = formik.values.sections.includes('all');
                let finalValues: string[] = [];

                if (hasAllInSelection && !wasAllPreviouslySelected) {
                  finalValues = ['all', ...allSectionIds];
                } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = [];
                } else if (hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = selectedValues.filter((id) => id !== 'all');
                } else {
                  const selectedRealIds = selectedValues.filter((id) => id !== 'all');
                  if (
                    selectedRealIds.length === allSectionIds.length &&
                    allSectionIds.every((id) => selectedRealIds.includes(id))
                  ) {
                    finalValues = ['all', ...allSectionIds];
                  } else {
                    finalValues = selectedRealIds;
                  }
                }
                formik.setFieldValue('sections', finalValues);
              }}
              error={!!formik.errors.sections && !!formik.touched.sections}
              helperText={(formik.touched.sections && formik.errors.sections) as string}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.statuses && formik.errors.statuses)}>
            <ResponsiveMultiSelect
              label="Select Status"
              options={[
                { id: 'all', name: 'All' },
                ...memberStatusOptions.map((s) => ({ id: s, name: s })),
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
