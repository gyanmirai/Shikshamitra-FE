'use client';

import React from 'react';

import { Box } from '@mui/material';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import VisitorLogtable from './component/visitor-log-table';

const VisitorLogsScreen = () => {
  const links = [
    { name: 'Hostel Management', href: '' },
    { name: 'Visitor Management', href: '' },
    { name: 'Visitor Logs', href: '' },
  ];
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Visitor Log"
        description="View a complete log of all visitor activity, including entry and exit times, status updates, and visit purposes. Track overstays, manage records, and ensure accurate visitor history."
        links={links}
        sx={{ px: 1, mb: 2 }}
      />
      <VisitorLogtable />
    </Box>
  );
};

export default VisitorLogsScreen;
