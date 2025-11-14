'use client';

import React from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import LiveSecurityAlertTable from './component/live-security-alert-table';

const LiveSecurityAlertsScreen = () => (
  <>
    <CustomBreadcrumbs
      heading="Live Security Alert"
      links={[
        { name: 'Security', href: '' },
        { name: 'Live Security Alert', href: '' },
      ]}
      sx={{ mb: 2 }}
    />
    <LiveSecurityAlertTable />
  </>
);

export default LiveSecurityAlertsScreen;
