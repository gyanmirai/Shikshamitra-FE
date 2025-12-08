import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';

import { ReportForm } from './ReportForm';
import { useReportOptions } from '../hooks/useReportOptions';

export default function TeacherWorkloadReport() {
  const { teacherOptions } = useReportOptions();

  const formik = useFormik({
    initialValues: {
      teachers: [] as string[],
    },
    validationSchema: Yup.object({}),
    onSubmit: (values) => {
      console.info('Generate Teacher Workload Report', values);
    },
  });

  const allTeacherIds = teacherOptions;

  return (
    <ReportForm onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.teachers && formik.errors.teachers)}>
            <ResponsiveMultiSelect
              label="Select Teachers"
              options={[
                { id: 'all', name: 'All' },
                ...teacherOptions.map((t) => ({ id: t, name: t })),
              ]}
              value={formik.values.teachers}
              getOptionLabel={(opt) => opt?.name}
              getOptionValue={(opt) => opt?.id}
              onChange={(selectedValues) => {
                const hasAllInSelection = selectedValues.includes('all');
                const wasAllPreviouslySelected = formik.values.teachers.includes('all');
                let finalValues: string[] = [];

                if (hasAllInSelection && !wasAllPreviouslySelected) {
                  finalValues = ['all', ...allTeacherIds];
                } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = [];
                } else if (hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = selectedValues.filter((id) => id !== 'all');
                } else {
                  const selectedRealIds = selectedValues.filter((id) => id !== 'all');
                  if (
                    selectedRealIds.length === allTeacherIds.length &&
                    allTeacherIds.every((id) => selectedRealIds.includes(id))
                  ) {
                    finalValues = ['all', ...allTeacherIds];
                  } else {
                    finalValues = selectedRealIds;
                  }
                }
                formik.setFieldValue('teachers', finalValues);
              }}
              error={!!formik.errors.teachers && !!formik.touched.teachers}
              helperText={(formik.touched.teachers && formik.errors.teachers) as string}
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </ReportForm>
  );
}
