'use client';

import React from 'react';
import { Box } from '@mui/material';
import { hrPaths } from 'src/constants/hr-menus';
import Tds from 'src/screens/hr/payroll/setting/tds';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const Page = () => (
  <Box>
    <CustomBreadcrumbs
      heading="TDS"
      links={[
        { name: 'Payroll Management', href: hrPaths.payroll.root },
        { name: 'TDS' },
      ]}
    />
    <Tds />
  </Box>
);

export default Page;
