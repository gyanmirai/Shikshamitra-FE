import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';

import { ReportForm } from './ReportForm';
import { useLibraryReportOptions } from '../hooks/useLibraryReportOptions';

export default function BlacklistedBlockedMembersReport() {
  const { memberTypeOptions, blockReasonOptions } = useLibraryReportOptions();

  const formik = useFormik({
    initialValues: {
      memberTypes: [] as string[],
      blockReasons: [] as string[],
    },
    validationSchema: Yup.object({}),
    onSubmit: (values) => {
      console.info('Generate Blacklisted / Blocked Members Report', values);
    },
  });

  const allMemberTypeIds = memberTypeOptions;
  const allBlockReasonIds = blockReasonOptions;

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
          <ShakingTextField error={!!(formik.touched.blockReasons && formik.errors.blockReasons)}>
            <ResponsiveMultiSelect
              label="Select Block Reasons"
              options={[
                { id: 'all', name: 'All' },
                ...blockReasonOptions.map((b) => ({ id: b, name: b })),
              ]}
              value={formik.values.blockReasons}
              getOptionLabel={(opt) => opt?.name}
              getOptionValue={(opt) => opt?.id}
              onChange={(selectedValues) => {
                const hasAllInSelection = selectedValues.includes('all');
                const wasAllPreviouslySelected = formik.values.blockReasons.includes('all');
                let finalValues: string[] = [];

                if (hasAllInSelection && !wasAllPreviouslySelected) {
                  finalValues = ['all', ...allBlockReasonIds];
                } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = [];
                } else if (hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = selectedValues.filter((id) => id !== 'all');
                } else {
                  const selectedRealIds = selectedValues.filter((id) => id !== 'all');
                  if (
                    selectedRealIds.length === allBlockReasonIds.length &&
                    allBlockReasonIds.every((id) => selectedRealIds.includes(id))
                  ) {
                    finalValues = ['all', ...allBlockReasonIds];
                  } else {
                    finalValues = selectedRealIds;
                  }
                }
                formik.setFieldValue('blockReasons', finalValues);
              }}
              error={!!formik.errors.blockReasons && !!formik.touched.blockReasons}
              helperText={(formik.touched.blockReasons && formik.errors.blockReasons) as string}
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </ReportForm>
  );
}
