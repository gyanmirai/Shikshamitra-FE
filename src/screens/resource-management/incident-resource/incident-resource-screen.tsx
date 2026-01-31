'use client';

import React from 'react';
import { Box } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import IncidentReportTable from './component/incident-report-table';

const IncidentResourceScreen = () => (
  <Box>
    <CustomBreadcrumbs
      heading="Incident Report"
      links={[{ name: 'Resource Management' }, { name: 'Incident Report' }]}
    />
    <IncidentReportTable />
  </Box>
);

export default IncidentResourceScreen;
