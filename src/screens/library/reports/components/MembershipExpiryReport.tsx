import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';

import { ReportForm } from './ReportForm';
import { useLibraryReportOptions } from '../hooks/useLibraryReportOptions';

export default function MembershipExpiryReport() {
  const { memberTypeOptions } = useLibraryReportOptions();

  const formik = useFormik({
    initialValues: {
      memberTypes: [] as string[],
      daysUntilExpiry: '30',
    },
    validationSchema: Yup.object({}),
    onSubmit: (values) => {
      console.info('Generate Membership Expiry Report', values);
    },
  });

  const allMemberTypeIds = memberTypeOptions;

  return (
    <ReportForm onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.memberTypes && formik.errors.memberTypes)}>
            <ResponsiveMultiSelect
              label="Select Member Types"
              options={[
                { id: 'all', name: 'All' },
                ...memberTypeOptions.map((m) => ({ id: m, name: m })),
              ]}
              value={formik.values.memberTypes}
              getOptionLabel={(opt) => opt?.name}
              getOptionValue={(opt) => opt?.id}
              onChange={(selectedValues) => {
                const hasAllInSelection = selectedValues.includes('all');
                const wasAllPreviouslySelected = formik.values.memberTypes.includes('all');
                let finalValues: string[] = [];

                if (hasAllInSelection && !wasAllPreviouslySelected) {
                  finalValues = ['all', ...allMemberTypeIds];
                } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = [];
                } else if (hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = selectedValues.filter((id) => id !== 'all');
                } else {
                  const selectedRealIds = selectedValues.filter((id) => id !== 'all');
                  if (
                    selectedRealIds.length === allMemberTypeIds.length &&
                    allMemberTypeIds.every((id) => selectedRealIds.includes(id))
                  ) {
                    finalValues = ['all', ...allMemberTypeIds];
                  } else {
                    finalValues = selectedRealIds;
                  }
                }
                formik.setFieldValue('memberTypes', finalValues);
              }}
              error={!!formik.errors.memberTypes && !!formik.touched.memberTypes}
              helperText={(formik.touched.memberTypes && formik.errors.memberTypes) as string}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField
            error={!!(formik.touched.daysUntilExpiry && formik.errors.daysUntilExpiry)}
          >
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Days Until Expiry"
              name="daysUntilExpiry"
              value={formik.values.daysUntilExpiry}
              onChange={formik.handleChange}
              error={!!formik.errors.daysUntilExpiry && !!formik.touched.daysUntilExpiry}
              helperText={
                (formik.touched.daysUntilExpiry && formik.errors.daysUntilExpiry) as string
              }
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </ReportForm>
  );
}
