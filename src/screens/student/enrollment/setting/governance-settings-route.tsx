'use client';

import { Stack } from '@mui/material';

import AdmissionsRouteConfiguration from './admissions-route-configuration';
import AdmissionsGovernanceConfiguration from './admissions-governance-configuration';
import AdmissionsPolicyPackConfiguration from './admissions-policy-pack-configuration';

export function GovernanceSettingsRoute() {
  return (
    <Stack spacing={1.5}>
      <AdmissionsRouteConfiguration />
      <AdmissionsPolicyPackConfiguration />
      <AdmissionsGovernanceConfiguration />
    </Stack>
  );
}
