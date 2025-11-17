'use client';

import React from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import AdminResourceTable from './component/admin-resource-table';

const AdminBookingScreen = () => (
  <>
    <CustomBreadcrumbs
      heading="Booking Approval"
      links={[{ name: 'Resource Management' }, { name: 'Booking Approval' }]}
      sx={{ mb: 2 }}
    />
    <AdminResourceTable />
  </>
);

export default AdminBookingScreen;
