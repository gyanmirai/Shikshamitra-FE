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
import { useLibraryReportOptions } from '../hooks/useLibraryReportOptions';

export default function FineCollectionReport() {
  const { fineReasonOptions } = useLibraryReportOptions();

  const formik = useFormik({
    initialValues: {
      fineReasons: [] as string[],
      startDate: null,
      endDate: null,
    },
    validationSchema: Yup.object({}),
    onSubmit: (values) => {
      console.info('Generate Fine Collection Report', values);
    },
  });

  const allFineReasonIds = fineReasonOptions;

  const { currentYear } = useSelector((state: RootState) => state.globalState);

  return (
    <ReportForm onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.fineReasons && formik.errors.fineReasons)}>
            <ResponsiveMultiSelect
              label="Select Fine Reasons"
              options={[
                { id: 'all', name: 'All' },
                ...fineReasonOptions.map((f) => ({ id: f, name: f })),
              ]}
              value={formik.values.fineReasons}
              getOptionLabel={(opt) => opt?.name}
              getOptionValue={(opt) => opt?.id}
              onChange={(selectedValues) => {
                const hasAllInSelection = selectedValues.includes('all');
                const wasAllPreviouslySelected = formik.values.fineReasons.includes('all');
                let finalValues: string[] = [];

                if (hasAllInSelection && !wasAllPreviouslySelected) {
                  finalValues = ['all', ...allFineReasonIds];
                } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = [];
                } else if (hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = selectedValues.filter((id) => id !== 'all');
                } else {
                  const selectedRealIds = selectedValues.filter((id) => id !== 'all');
                  if (
                    selectedRealIds.length === allFineReasonIds.length &&
                    allFineReasonIds.every((id) => selectedRealIds.includes(id))
                  ) {
                    finalValues = ['all', ...allFineReasonIds];
                  } else {
                    finalValues = selectedRealIds;
                  }
                }
                formik.setFieldValue('fineReasons', finalValues);
              }}
              error={!!formik.errors.fineReasons && !!formik.touched.fineReasons}
              helperText={(formik.touched.fineReasons && formik.errors.fineReasons) as string}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.startDate && formik.errors.startDate)}>
            <DatePicker
              label="Start Date"
              minDate={dayjs(currentYear?.startDate)}
              maxDate={dayjs(currentYear?.endDate)}
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
              minDate={dayjs(currentYear?.startDate)}
              maxDate={dayjs(currentYear?.endDate)}
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
