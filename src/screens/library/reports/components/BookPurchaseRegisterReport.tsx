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

export default function BookPurchaseRegisterReport() {
  const { vendorOptions } = useLibraryReportOptions();

  const formik = useFormik({
    initialValues: {
      vendors: [] as string[],
      startDate: null,
      endDate: null,
    },
    validationSchema: Yup.object({}),
    onSubmit: (values) => {
      console.info('Generate Book Purchase Register Report', values);
    },
  });

  const allVendorIds = vendorOptions;

  const { currentYear } = useSelector((state: RootState) => state.globalState);

  return (
    <ReportForm onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.vendors && formik.errors.vendors)}>
            <ResponsiveMultiSelect
              label="Select Vendors"
              options={[
                { id: 'all', name: 'All' },
                ...vendorOptions.map((v) => ({ id: v, name: v })),
              ]}
              value={formik.values.vendors}
              getOptionLabel={(opt) => opt?.name}
              getOptionValue={(opt) => opt?.id}
              onChange={(selectedValues) => {
                const hasAllInSelection = selectedValues.includes('all');
                const wasAllPreviouslySelected = formik.values.vendors.includes('all');
                let finalValues: string[] = [];

                if (hasAllInSelection && !wasAllPreviouslySelected) {
                  finalValues = ['all', ...allVendorIds];
                } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = [];
                } else if (hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = selectedValues.filter((id) => id !== 'all');
                } else {
                  const selectedRealIds = selectedValues.filter((id) => id !== 'all');
                  if (
                    selectedRealIds.length === allVendorIds.length &&
                    allVendorIds.every((id) => selectedRealIds.includes(id))
                  ) {
                    finalValues = ['all', ...allVendorIds];
                  } else {
                    finalValues = selectedRealIds;
                  }
                }
                formik.setFieldValue('vendors', finalValues);
              }}
              error={!!formik.errors.vendors && !!formik.touched.vendors}
              helperText={(formik.touched.vendors && formik.errors.vendors) as string}
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
