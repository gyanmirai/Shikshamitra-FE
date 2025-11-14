'use client';

import React from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import MyDutyTable from './component/my-duty-table';

const MyDutyScreen = () => (
  <>
    <CustomBreadcrumbs
      heading="My Duty Schedule"
      links={[
        { name: 'Security', href: '' },
        { name: 'My Duty Schedule', href: '' },
      ]}
      sx={{ mb: 2 }}
    />
    <MyDutyTable />
  </>
);

export default MyDutyScreen;
