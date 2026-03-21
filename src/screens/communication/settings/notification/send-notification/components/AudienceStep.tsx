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
  const { allOrganization, searchTerm, handleSearchChange, onClearSearch, displayData } =
    useAudienceStep(formik);

  return (
    <Grid container spacing={3}>
      {/* Selection Fields */}
      <AudienceFilters
        formik={formik}
        allOrganization={allOrganization}
        searchTerm={searchTerm}
        handleSearchChange={handleSearchChange}
        onClearSearch={onClearSearch}
      />

      {/* Results Table */}
      <Grid size={{ xs: 12 }}>
        <AudienceTable formik={formik} displayData={displayData} />
      </Grid>
    </Grid>
  );
};

export default AudienceStep;
