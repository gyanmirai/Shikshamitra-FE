'use client';

import React from 'react';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AccessLogsManagementTable from './component/access-logs-management-table';

const AccessLogsManagementScreen = () => (
  <>
    <CustomBreadcrumbs
      heading="Access Logs Management"
      links={[
        { name: 'Security', href: '' },
        { name: 'Access Logs & Gate Pass System', href: '' },
      ]}
      sx={{ px: 1, mb: 2 }}
    />
    <AccessLogsManagementTable />
  </>
);

export default AccessLogsManagementScreen;
