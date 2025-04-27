'use client';

import React from 'react';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import AdminProcurementRequestTable from './component/admin-procurement-request-table';

const ManageProcurementRequestScreenAdmin = () => (
  <>
    <CustomBreadcrumbs
      heading="Request Review & Approval"
      links={[{ name: 'Resource Management' }, { name: 'Request Review & Approval' }]}
      sx={{ px: 1, mb: 2 }}
    />
    <AdminProcurementRequestTable />
  </>
);

export default ManageProcurementRequestScreenAdmin;
