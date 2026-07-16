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
      sx={{ mb: 1 }}
      heading="Dashboard"
      links={[{ name: 'Academics' }, { name: 'Student Progress Analytics' }, { name: 'Dashboard' }]}
    />
    <Grid container spacing={1}>
      <StudentProgressCards />
      <PerformanceTrends />
    </Grid>
  </Box>
);

export default Dashboard;
