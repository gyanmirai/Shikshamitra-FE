'use client';

import React from 'react';

import { Box } from '@mui/material';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import FeedbackAnalyticsTable from './component/feedback-analytics-table';

const FeedbackAnalyticsScreen = () => {
  const links = [
    { name: 'Catering Management', href: '' },
    { name: 'Feedback Analytics', href: '' },
  ];
  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Feedback Analytics"
        description="This is the feedback analytics page"
        links={links}
        sx={{ px: 1, mb: 2 }}
      />
      <FeedbackAnalyticsTable />
    </Box>
  );
};

export default FeedbackAnalyticsScreen;
