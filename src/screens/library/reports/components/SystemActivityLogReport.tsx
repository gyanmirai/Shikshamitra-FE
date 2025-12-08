import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ShakingTextField from 'src/components/shaking-text-field';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';

import { ReportForm } from './ReportForm';
import { useLibraryReportOptions } from '../hooks/useLibraryReportOptions';

export default function SystemActivityLogReport() {
  const { actionTypeOptions, memberOptions } = useLibraryReportOptions();

  const formik = useFormik({
    initialValues: {
      actionTypes: [] as string[],
      users: [] as string[],
      startDate: null,
      endDate: null,
    },
    validationSchema: Yup.object({}),
    onSubmit: (values) => {
      console.info('Generate System Activity Log Report', values);
    },
  });

  const allActionTypeIds = actionTypeOptions;
  const allUserIds = memberOptions;

  return (
    <ReportForm onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.actionTypes && formik.errors.actionTypes)}>
            <ResponsiveMultiSelect
              label="Select Action Types"
              options={[
                { id: 'all', name: 'All' },
                ...actionTypeOptions.map((a) => ({ id: a, name: a })),
              ]}
              value={formik.values.actionTypes}
              getOptionLabel={(opt) => opt?.name}
              getOptionValue={(opt) => opt?.id}
              onChange={(selectedValues) => {
                const hasAllInSelection = selectedValues.includes('all');
                const wasAllPreviouslySelected = formik.values.actionTypes.includes('all');
                let finalValues: string[] = [];

                if (hasAllInSelection && !wasAllPreviouslySelected) {
                  finalValues = ['all', ...allActionTypeIds];
                } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = [];
                } else if (hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = selectedValues.filter((id) => id !== 'all');
                } else {
                  const selectedRealIds = selectedValues.filter((id) => id !== 'all');
                  if (
                    selectedRealIds.length === allActionTypeIds.length &&
                    allActionTypeIds.every((id) => selectedRealIds.includes(id))
                  ) {
                    finalValues = ['all', ...allActionTypeIds];
                  } else {
                    finalValues = selectedRealIds;
                  }
                }
                formik.setFieldValue('actionTypes', finalValues);
              }}
              error={!!formik.errors.actionTypes && !!formik.touched.actionTypes}
              helperText={(formik.touched.actionTypes && formik.errors.actionTypes) as string}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.users && formik.errors.users)}>
            <ResponsiveMultiSelect
              label="Select Users"
              options={[
                { id: 'all', name: 'All' },
                ...memberOptions.map((u) => ({ id: u, name: u })),
              ]}
              value={formik.values.users}
              getOptionLabel={(opt) => opt?.name}
              getOptionValue={(opt) => opt?.id}
              onChange={(selectedValues) => {
                const hasAllInSelection = selectedValues.includes('all');
                const wasAllPreviouslySelected = formik.values.users.includes('all');
                let finalValues: string[] = [];

                if (hasAllInSelection && !wasAllPreviouslySelected) {
                  finalValues = ['all', ...allUserIds];
                } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = [];
                } else if (hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = selectedValues.filter((id) => id !== 'all');
                } else {
                  const selectedRealIds = selectedValues.filter((id) => id !== 'all');
                  if (
                    selectedRealIds.length === allUserIds.length &&
                    allUserIds.every((id) => selectedRealIds.includes(id))
                  ) {
                    finalValues = ['all', ...allUserIds];
                  } else {
                    finalValues = selectedRealIds;
                  }
                }
                formik.setFieldValue('users', finalValues);
              }}
              error={!!formik.errors.users && !!formik.touched.users}
              helperText={(formik.touched.users && formik.errors.users) as string}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.startDate && formik.errors.startDate)}>
            <DatePicker
              label="Start Date"
              value={formik.values.startDate}
              onChange={(newValue) => formik.setFieldValue('startDate', newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                },
              }}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.endDate && formik.errors.endDate)}>
            <DatePicker
              label="End Date"
              value={formik.values.endDate}
              onChange={(newValue) => formik.setFieldValue('endDate', newValue)}
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
