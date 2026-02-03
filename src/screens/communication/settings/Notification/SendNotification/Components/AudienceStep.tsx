'use client';

import type { FormikProps } from 'formik';

import React from 'react';
import { Grid } from '@mui/material';

import AudienceTable from './AudienceTable';
import AudienceFilters from './AudienceFilters';
import { useAudienceStep } from '../hooks/useAudienceStep';

import type { INotificationSendSchema } from './type';

/**
 * Component: AudienceStep
 * Responsibilities:
 * - Orchestrating the audience selection step
 * - Connecting UI components with the useAudienceStep hook
 */
const AudienceStep = ({ formik }: { formik: FormikProps<INotificationSendSchema> }) => {
  const { rolesData, isRolesLoading, allClass, allDivision, handleClassChange } =
    useAudienceStep(formik);

  return (
    <Grid container spacing={3}>
      {/* Selection Fields */}
      <AudienceFilters
        formik={formik}
        rolesData={rolesData}
        isRolesLoading={isRolesLoading}
        allClass={allClass}
        allDivision={allDivision}
        onClassChange={handleClassChange}
      />

      {/* Results Table */}
      <Grid size={{ xs: 12 }}>
        <AudienceTable formik={formik} />
      </Grid>
    </Grid>
  );
};

export default AudienceStep;
