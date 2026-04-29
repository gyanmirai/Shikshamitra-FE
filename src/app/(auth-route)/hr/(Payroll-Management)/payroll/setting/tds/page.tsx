'use client';

import React from 'react';
import { Box } from '@mui/material';
import Tds from 'src/screens/hr/payroll/setting/tds';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const Page = () => (
  <Box>
    <CustomBreadcrumbs
      heading="TDS"
      links={[
        { name: 'HR/Staff' },
        { name: 'Payroll Management' },
        { name: 'Settings' },
        { name: 'TDS' },
      ]}
    />
    <Tds />
  </Box>
);

export default Page;
