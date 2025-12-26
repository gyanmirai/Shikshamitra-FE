import type { RootState } from 'src/redux/store';

import React from 'react';
import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid } from '@mui/material';
import { useSelector } from 'react-redux';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ShakingTextField from 'src/components/shaking-text-field';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';

import { ReportForm } from './ReportForm';
import { useReportOptions } from '../hooks/useReportOptions';

export default function ClassPromotionSummaryReport() {
  const { classOptions } = useReportOptions();

  const formik = useFormik({
    initialValues: {
      classes: [] as string[],
      academicYear: null,
    },
    validationSchema: Yup.object({
      academicYear: Yup.date().required('Academic year is required').nullable(),
    }),
    onSubmit: (values) => {
      console.info('Generate Class Promotion Summary Report', values);
    },
  });

  const allClassIds = classOptions;
  const { currentYear } = useSelector((state: RootState) => state.globalState);

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
          <ShakingTextField error={!!(formik.touched.academicYear && formik.errors.academicYear)}>
            <DatePicker
              label="Select Academic Year *"
              minDate={dayjs(currentYear?.startDate)}
              maxDate={dayjs(currentYear?.endDate)}
              views={['year']}
              value={formik.values.academicYear}
              onChange={(newValue) => formik.setFieldValue('academicYear', newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                  error: formik.touched.academicYear && Boolean(formik.errors.academicYear),
                  helperText: formik.touched.academicYear && (formik.errors.academicYear as string),
                },
              }}
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </ReportForm>
  );
}
