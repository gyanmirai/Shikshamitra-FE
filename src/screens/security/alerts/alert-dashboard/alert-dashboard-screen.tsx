'use client';

import React from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AlertDashboardCard from './component/alert-dashboard-card';
import AlertDashboardTable from './component/alert-dashboard-table';

const AlertDashboardScreen = () => (
  <>
    <CustomBreadcrumbs
      heading="Alert Dashboard"
      links={[
        { name: 'Security', href: '' },
        { name: 'Alert Dashboard', href: '' },
      ]}
      sx={{ mb: 2 }}
    />
    <AlertDashboardCard />
    <AlertDashboardTable />
  </>
);

export default AlertDashboardScreen;
