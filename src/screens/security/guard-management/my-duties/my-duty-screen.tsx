'use client';

import React from 'react';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import MyDutyTable from './component/my-duty-table';

const MyDutyScreen = () => (
  <>
    <CustomBreadcrumbs
      heading="My Duties"
      links={[
        { name: 'Security', href: '' },
        { name: 'My Duties', href: '' },
      ]}
      sx={{ px: 1, mb: 2 }}
    />
    <MyDutyTable />
  </>
);

export default MyDutyScreen;
