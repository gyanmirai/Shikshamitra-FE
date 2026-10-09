'use client';

import { Box } from '@mui/material';
import { hrPaths } from 'src/constants/hr-menus';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import EsiStatutorySettings from 'src/screens/hr/payroll/setting/esi-statutory-settings';

export default function StatutorySchemesPage() {
  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Statutory Schemes"
        description="Configure ESIC and review its effect on payroll."
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Payroll Management', href: hrPaths.payroll.root },
          { name: 'Settings', href: hrPaths.payroll.settings.root },
          { name: 'Statutory Schemes' },
        ]}
      />
      <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, overflowY: 'auto', overflowX: 'hidden' }}>
        <EsiStatutorySettings />
      </Box>
    </Box>
  );
}
