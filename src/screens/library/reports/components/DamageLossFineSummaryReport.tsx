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

export default function DamageLossFineSummaryReport() {
  const { damageTypeOptions } = useLibraryReportOptions();

  const formik = useFormik({
    initialValues: {
      damageTypes: [] as string[],
      startDate: null,
      endDate: null,
    },
    validationSchema: Yup.object({}),
    onSubmit: (values) => {
      console.info('Generate Damage/Loss Fine Summary Report', values);
    },
  });

  const allDamageTypeIds = damageTypeOptions;

  const { currentYear } = useSelector((state: RootState) => state.globalState);

  return (
    <ReportForm onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.damageTypes && formik.errors.damageTypes)}>
            <ResponsiveMultiSelect
              label="Select Damage Types"
              options={[
                { id: 'all', name: 'All' },
                ...damageTypeOptions.map((d) => ({ id: d, name: d })),
              ]}
              value={formik.values.damageTypes}
              getOptionLabel={(opt) => opt?.name}
              getOptionValue={(opt) => opt?.id}
              onChange={(selectedValues) => {
                const hasAllInSelection = selectedValues.includes('all');
                const wasAllPreviouslySelected = formik.values.damageTypes.includes('all');
                let finalValues: string[] = [];

                if (hasAllInSelection && !wasAllPreviouslySelected) {
                  finalValues = ['all', ...allDamageTypeIds];
                } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = [];
                } else if (hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = selectedValues.filter((id) => id !== 'all');
                } else {
                  const selectedRealIds = selectedValues.filter((id) => id !== 'all');
                  if (
                    selectedRealIds.length === allDamageTypeIds.length &&
                    allDamageTypeIds.every((id) => selectedRealIds.includes(id))
                  ) {
                    finalValues = ['all', ...allDamageTypeIds];
                  } else {
                    finalValues = selectedRealIds;
                  }
                }
                formik.setFieldValue('damageTypes', finalValues);
              }}
              error={!!formik.errors.damageTypes && !!formik.touched.damageTypes}
              helperText={(formik.touched.damageTypes && formik.errors.damageTypes) as string}
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
