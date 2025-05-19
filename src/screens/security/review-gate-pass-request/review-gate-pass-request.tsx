'use client';

import React from 'react';

import { Box } from '@mui/material';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import ReviewGatePassRequestTableChild from './component/review-gate-pass-request-child-table';

const ReviewGatePassRequestForChild = () => (
  <Box>
    <CustomBreadcrumbs
      heading="Review Gate Pass Request"
      description="Review and respond to gate pass requests submitted by students. As a teacher, you can approve or reject these requests."
      links={[
        { name: 'Security', href: '' },
        { name: 'Review Gate Pass Request', href: '' },
      ]}
      sx={{ px: 1, mb: 2 }}
    />
    <ReviewGatePassRequestTableChild />
  </Box>
);

export default ReviewGatePassRequestForChild;
