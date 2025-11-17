'use client';

import React from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AccessLogsManagementSecurityTable from './component/access-logs-management-security-table';

const AccessLogsManagementSecurity = () => (
  <>
    <CustomBreadcrumbs
      heading="Access Logs Management Security"
      links={[
        { name: 'Security', href: '' },
        { name: 'Access Logs Management Security', href: '' },
      ]}
      sx={{ mb: 2 }}
    />
    <AccessLogsManagementSecurityTable />
  </>
);

export default AccessLogsManagementSecurity;
