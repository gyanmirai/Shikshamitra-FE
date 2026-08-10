'use client';

import { LoadingButton } from 'src/components/loading-button';

import { Box, Alert, LinearProgress } from '@mui/material';

import { useAdmissionsCrmConfigurationWorkspace } from './admissions-crm-configuration-context';

import { AdmissionsCrmConfigurationSection1 } from './admissions-crm-configuration-section-1';

import { AdmissionsCrmConfigurationSection2 } from './admissions-crm-configuration-section-2';

import { AdmissionsCrmConfigurationSection3 } from './admissions-crm-configuration-section-3';

import { AdmissionsCrmConfigurationSection4 } from './admissions-crm-configuration-section-4';

import { AdmissionsCrmConfigurationSection5 } from './admissions-crm-configuration-section-5';

import { AdmissionsCrmConfigurationSection6 } from './admissions-crm-configuration-section-6';

import { AdmissionsCrmConfigurationSection7 } from './admissions-crm-configuration-section-7';

import { AdmissionsCrmConfigurationSection8 } from './admissions-crm-configuration-section-8';

import { AdmissionsCrmConfigurationSection9 } from './admissions-crm-configuration-section-9';

import { AdmissionsCrmConfigurationSection10 } from './admissions-crm-configuration-section-10';

export function AdmissionsCrmConfigurationView() {
  const { state: controllerState, actions, meta } = useAdmissionsCrmConfigurationWorkspace();
  const { hasActiveQueryError, isInitialLoading, retryActiveQueries } = {
    ...controllerState,
    ...actions,
    ...meta,
  };

  if (isInitialLoading) {
    return <LinearProgress aria-label="Loading Enrollment settings" />;
  }

  if (hasActiveQueryError) {
    return (
      <Alert
        severity="error"
        action={
          <LoadingButton size="small" color="inherit" onClick={retryActiveQueries}>
            Retry
          </LoadingButton>
        }
      >
        This settings panel could not be loaded completely.
      </Alert>
    );
  }

  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      <AdmissionsCrmConfigurationSection1 />

      <AdmissionsCrmConfigurationSection2 />

      <AdmissionsCrmConfigurationSection3 />

      <AdmissionsCrmConfigurationSection4 />

      <AdmissionsCrmConfigurationSection5 />

      <AdmissionsCrmConfigurationSection6 />

      <AdmissionsCrmConfigurationSection7 />

      <AdmissionsCrmConfigurationSection8 />

      <AdmissionsCrmConfigurationSection9 />

      <AdmissionsCrmConfigurationSection10 />
    </Box>
  );
}
