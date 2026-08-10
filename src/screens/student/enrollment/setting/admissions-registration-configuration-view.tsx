'use client';

import { Box } from '@mui/material';

import { useAdmissionsRegistrationWorkspace } from './admissions-registration-configuration-context';

import { AdmissionsRegistrationSection1 } from './admissions-registration-configuration-section-1';

import { AdmissionsRegistrationSection2 } from './admissions-registration-configuration-section-2';

import { AdmissionsRegistrationSection3 } from './admissions-registration-configuration-section-3';

export function AdmissionsRegistrationView() {
  const { state: controllerState, actions, meta } = useAdmissionsRegistrationWorkspace();
  const { view } = { ...controllerState, ...actions, ...meta };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: view === 'templates' ? 1 : undefined,
        minHeight: view === 'templates' ? 0 : undefined,
      }}
    >
      <AdmissionsRegistrationSection1 />

      <AdmissionsRegistrationSection2 />

      <AdmissionsRegistrationSection3 />
    </Box>
  );
}
