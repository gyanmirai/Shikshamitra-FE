'use client';

import { Box } from '@mui/material';

import { AdmissionsPlaybookSection1 } from './admissions-playbook-configuration-section-1';

import { AdmissionsPlaybookSection2 } from './admissions-playbook-configuration-section-2';

import { AdmissionsPlaybookSection3 } from './admissions-playbook-configuration-section-3';

export function AdmissionsPlaybookView() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <AdmissionsPlaybookSection1 />
      <AdmissionsPlaybookSection2 />
      <AdmissionsPlaybookSection3 />
    </Box>
  );
}
