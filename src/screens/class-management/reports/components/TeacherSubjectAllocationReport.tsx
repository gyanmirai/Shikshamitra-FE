import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { ResponsiveMultiSelect } from 'src/components/responsive-multi-select';

import { ReportForm } from './ReportForm';
import { useReportOptions } from '../hooks/useReportOptions';

export default function TeacherSubjectAllocationReport() {
  const { teacherOptions, subjectOptions, classOptions } = useReportOptions();

  const formik = useFormik({
    initialValues: {
      teachers: [] as string[],
      subjects: [] as string[],
      classes: [] as string[],
    },
    validationSchema: Yup.object({}),
    onSubmit: (values) => {
      console.info('Generate Teacher Subject Allocation Report', values);
    },
  });

  const allTeacherIds = teacherOptions;
  const allSubjectIds = subjectOptions;
  const allClassIds = classOptions;

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
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.subjects && formik.errors.subjects)}>
            <ResponsiveMultiSelect
              label="Select Subjects"
              options={[
                { id: 'all', name: 'All' },
                ...subjectOptions.map((s) => ({ id: s, name: s })),
              ]}
              value={formik.values.subjects}
              getOptionLabel={(opt) => opt?.name}
              getOptionValue={(opt) => opt?.id}
              onChange={(selectedValues) => {
                const hasAllInSelection = selectedValues.includes('all');
                const wasAllPreviouslySelected = formik.values.subjects.includes('all');
                let finalValues: string[] = [];

                if (hasAllInSelection && !wasAllPreviouslySelected) {
                  finalValues = ['all', ...allSubjectIds];
                } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = [];
                } else if (hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = selectedValues.filter((id) => id !== 'all');
                } else {
                  const selectedRealIds = selectedValues.filter((id) => id !== 'all');
                  if (
                    selectedRealIds.length === allSubjectIds.length &&
                    allSubjectIds.every((id) => selectedRealIds.includes(id))
                  ) {
                    finalValues = ['all', ...allSubjectIds];
                  } else {
                    finalValues = selectedRealIds;
                  }
                }
                formik.setFieldValue('subjects', finalValues);
              }}
              error={!!formik.errors.subjects && !!formik.touched.subjects}
              helperText={(formik.touched.subjects && formik.errors.subjects) as string}
            />
          </ShakingTextField>
        </Grid>
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
      </Grid>
    </ReportForm>
  );
}
