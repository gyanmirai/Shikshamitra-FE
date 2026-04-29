'use client';

import React from 'react';
import { Box } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import ProfessionalTax from 'src/screens/hr/payroll/setting/professional-tax';

const Page = () => (
  <Box>
    <CustomBreadcrumbs
      heading="Professional tax"
      links={[
        { name: 'HR/Staff' },
        { name: 'Payroll Management' },
        { name: 'Settings' },
        { name: 'Professional tax' },
      ]}
    />
    <ProfessionalTax />
  </Box>
);

export default Page;
