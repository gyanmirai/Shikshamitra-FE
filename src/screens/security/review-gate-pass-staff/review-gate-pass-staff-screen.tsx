'use client';

import React from 'react';
import { Box } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import ReviewGatePassRequestStaffTable from './component/review-gate-pass-request-staff-table';

const ReviewGatePassStaffScreen = () => (
  <Box>
    <CustomBreadcrumbs
      heading="Review Gate Pass Request"
      description="Review and respond to gate pass requests submitted by staff. As a Admin, you can approve or reject these requests."
      links={[
        { name: 'Security', href: '' },
        { name: 'Review Gate Pass Request', href: '' },
      ]}
      sx={{ mb: 2 }}
    />
    <ReviewGatePassRequestStaffTable />
  </Box>
);

export default ReviewGatePassStaffScreen;
