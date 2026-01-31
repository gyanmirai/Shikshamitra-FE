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
    />
    <AlertReportTable />
  </>
);

export default AlertReportsScreen;
