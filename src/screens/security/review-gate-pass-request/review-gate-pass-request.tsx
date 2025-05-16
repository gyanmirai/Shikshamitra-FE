'use client';

import React from 'react';

import { Box } from '@mui/material';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import ReviewGatePassRequestTableChild from './component/review-gate-pass-request-child-table';

const ReviewGatePassRequestForChild = () => (
  <Box>
    <CustomBreadcrumbs
      heading="Review Gate Pass Request For Child"
      links={[
        { name: 'Security', href: '' },
        { name: 'Review Gate Pass Request For Child', href: '' },
      ]}
      sx={{ px: 1, mb: 2 }}
    />
    <ReviewGatePassRequestTableChild />
  </Box>
);

export default ReviewGatePassRequestForChild;
