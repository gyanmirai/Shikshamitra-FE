'use client';

import React from 'react';

import { Box } from '@mui/material';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import ReviewGatePassRequestStaffTable from './component/review-gate-pass-request-staff-table';

const ReviewGatePassStaffScreen = () => (
  <Box>
    <CustomBreadcrumbs
      heading="Review Gate Pass Request For Staff"
      links={[
        { name: 'Security', href: '' },
        { name: 'Review Gate Pass Request For Staff', href: '' },
      ]}
      sx={{ px: 1, mb: 2 }}
    />
    <ReviewGatePassRequestStaffTable />
  </Box>
);

export default ReviewGatePassStaffScreen;
