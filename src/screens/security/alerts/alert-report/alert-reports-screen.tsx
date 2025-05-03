'use client';

import React from 'react';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AlertReportTable from './component/alert-report-table';

const AlertReportsScreen = () => (
  <>
    <CustomBreadcrumbs
      heading="Alert Reports"
      links={[
        { name: 'Security', href: '' },
        { name: 'Alert Reports', href: '' },
      ]}
      sx={{ px: 1, mb: 2 }}
    />
    <AlertReportTable />
  </>
);

export default AlertReportsScreen;
