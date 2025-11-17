'use client';

import React from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import AdminProcurementRequestTable from './component/admin-procurement-request-table';

const ManageProcurementRequestScreenAdmin = () => (
  <>
    <CustomBreadcrumbs
      heading="Request Review & Approval"
      description="Review and approve procurement requests submitted by employees"
      links={[
        { name: 'Resource Management', href: '/resourceManagement/dashboard' },
        { name: 'Procurement & Vendors' },
        { name: 'Request Review & Approval' },
      ]}
      sx={{ mb: 2 }}
    />
    <AdminProcurementRequestTable />
  </>
);

export default ManageProcurementRequestScreenAdmin;
