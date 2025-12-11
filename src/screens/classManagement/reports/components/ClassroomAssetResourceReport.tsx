import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';

import { ReportForm } from './ReportForm';
import { useReportOptions } from '../hooks/useReportOptions';

export default function ClassroomAssetResourceReport() {
  const { roomOptions, assetTypeOptions } = useReportOptions();

  const formik = useFormik({
    initialValues: {
      rooms: [] as string[],
      assetTypes: [] as string[],
    },
    validationSchema: Yup.object({}),
    onSubmit: (values) => {
      console.info('Generate Classroom Asset / Resource Report', values);
    },
  });

  const allRoomIds = roomOptions;
  const allAssetTypeIds = assetTypeOptions;

  return (
    <ReportForm onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.rooms && formik.errors.rooms)}>
            <ResponsiveMultiSelect
              label="Select Rooms"
              options={[
                { id: 'all', name: 'All' },
                ...roomOptions.map((r) => ({ id: r, name: r })),
              ]}
              value={formik.values.rooms}
              getOptionLabel={(opt) => opt?.name}
              getOptionValue={(opt) => opt?.id}
              onChange={(selectedValues) => {
                const hasAllInSelection = selectedValues.includes('all');
                const wasAllPreviouslySelected = formik.values.rooms.includes('all');
                let finalValues: string[] = [];

                if (hasAllInSelection && !wasAllPreviouslySelected) {
                  finalValues = ['all', ...allRoomIds];
                } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = [];
                } else if (hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = selectedValues.filter((id) => id !== 'all');
                } else {
                  const selectedRealIds = selectedValues.filter((id) => id !== 'all');
                  if (
                    selectedRealIds.length === allRoomIds.length &&
                    allRoomIds.every((id) => selectedRealIds.includes(id))
                  ) {
                    finalValues = ['all', ...allRoomIds];
                  } else {
                    finalValues = selectedRealIds;
                  }
                }
                formik.setFieldValue('rooms', finalValues);
              }}
              error={!!formik.errors.rooms && !!formik.touched.rooms}
              helperText={(formik.touched.rooms && formik.errors.rooms) as string}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.assetTypes && formik.errors.assetTypes)}>
            <ResponsiveMultiSelect
              label="Select Asset Types"
              options={[
                { id: 'all', name: 'All' },
                ...assetTypeOptions.map((a) => ({ id: a, name: a })),
              ]}
              value={formik.values.assetTypes}
              getOptionLabel={(opt) => opt?.name}
              getOptionValue={(opt) => opt?.id}
              onChange={(selectedValues) => {
                const hasAllInSelection = selectedValues.includes('all');
                const wasAllPreviouslySelected = formik.values.assetTypes.includes('all');
                let finalValues: string[] = [];

                if (hasAllInSelection && !wasAllPreviouslySelected) {
                  finalValues = ['all', ...allAssetTypeIds];
                } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = [];
                } else if (hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = selectedValues.filter((id) => id !== 'all');
                } else {
                  const selectedRealIds = selectedValues.filter((id) => id !== 'all');
                  if (
                    selectedRealIds.length === allAssetTypeIds.length &&
                    allAssetTypeIds.every((id) => selectedRealIds.includes(id))
                  ) {
                    finalValues = ['all', ...allAssetTypeIds];
                  } else {
                    finalValues = selectedRealIds;
                  }
                }
                formik.setFieldValue('assetTypes', finalValues);
              }}
              error={!!formik.errors.assetTypes && !!formik.touched.assetTypes}
              helperText={(formik.touched.assetTypes && formik.errors.assetTypes) as string}
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </ReportForm>
  );
}
