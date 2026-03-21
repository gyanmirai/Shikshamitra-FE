'use client';

import React from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AccessLogsManagementTable from './component/access-logs-management-table';

const AccessLogsManagementScreen = () => (
  <>
    <CustomBreadcrumbs
      heading="Access Logs"
      links={[
        { name: 'Security', href: '' },
        { name: 'Access Logs', href: '' },
      ]}
    />
    <AccessLogsManagementTable />
  </>
);

export default AccessLogsManagementScreen;
