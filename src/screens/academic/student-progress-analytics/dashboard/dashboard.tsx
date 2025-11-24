'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';
import { Box, Grid } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import PerformanceTrends from './component/performanceTrens';
import StudentProgressCards from './component/studentProgressCards';

const Dashboard = (props: TabComponentType) => (
  <Box>
    <CustomBreadcrumbs
      heading="Dashboard"
      links={[{ name: 'Academics' }, { name: 'Student Progress Analytics' }, { name: 'Dashboard' }]}
      sx={{ mb: 2 }}
    />
    <Grid container spacing={3}>
      <StudentProgressCards />
      <PerformanceTrends />
    </Grid>
  </Box>
);

export default Dashboard;
