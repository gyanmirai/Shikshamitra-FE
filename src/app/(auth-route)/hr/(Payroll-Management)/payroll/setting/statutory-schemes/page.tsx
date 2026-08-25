'use client';

import { Box } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import EsiStatutorySettings from 'src/screens/hr/payroll/setting/esi-statutory-settings';

export default function StatutorySchemesPage() {
  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Statutory Schemes"
        description="Configure ESI applicability, statutory wages, employee coverage, and payroll activation."
        links={[
          { name: 'HR/Staff' },
          { name: 'Payroll Management' },
          { name: 'Settings' },
          { name: 'Statutory Schemes' },
        ]}
      />
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <EsiStatutorySettings />
      </Box>
    </Box>
  );
}
