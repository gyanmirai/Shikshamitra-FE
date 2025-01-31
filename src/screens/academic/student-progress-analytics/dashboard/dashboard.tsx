'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import { Box, Grid, useTheme } from '@mui/material';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import PerformanceTrends from './component/performanceTrens';
import StudentProgressCards from './component/studentProgressCards';

const Dashboard = (props: TabComponentType) => {
  const theme = useTheme();
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Dashboard"
        links={[
          { name: 'Academic and Assignment' },
          { name: 'Student Progress Analytics' },
          { name: 'Dashboard' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <Grid container spacing={3}>
        <StudentProgressCards />
        <PerformanceTrends />
      </Grid>
    </Box>
  );
};

export default Dashboard;
