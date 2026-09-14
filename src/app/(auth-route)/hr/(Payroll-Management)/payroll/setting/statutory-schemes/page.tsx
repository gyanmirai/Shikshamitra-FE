'use client';

import { Box } from '@mui/material';
import { useResponsive } from 'src/hooks/use-responsive';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import EsiStatutorySettings from 'src/screens/hr/payroll/setting/esi-statutory-settings';

export default function StatutorySchemesPage() {
  const isDesktop = useResponsive('up', 'md');
  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Statutory Schemes"
        layout={isDesktop ? 'inline' : 'stacked'}
        description="Review ESI readiness, employee coverage, monthly impact, and advanced settings."
        links={[
          { name: 'HR/Staff' },
          { name: 'Payroll Management' },
          { name: 'Settings' },
          { name: 'Statutory Schemes' },
        ]}
      />
      <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, overflowY: 'auto', overflowX: 'hidden' }}>
        <EsiStatutorySettings />
      </Box>
    </Box>
  );
}
