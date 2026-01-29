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
    />
    <LiveSecurityAlertTable />
  </>
);

export default LiveSecurityAlertsScreen;
