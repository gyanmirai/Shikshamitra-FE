'use client';

import React from 'react';
import { Box, Grid } from '@mui/material';

import HRStatsCards from './components/HRStatsCards';
import LeaveManagement from './components/LeaveManagement';
import HRPayrollSummary from './components/HRPayrollSummary';
import HRDashboardAttendanceTrend from './components/HRDashboardAttendanceTrend';
import HRBirthdaysAndAnniversaries from './components/HRBirthdaysAndAnniversaries';

const HRDashboardScreen = () => (
  <Box sx={{ p: 3 }}>
    <HRStatsCards />

    <Grid container spacing={3} mb={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <HRDashboardAttendanceTrend />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <HRPayrollSummary />
      </Grid>
    </Grid>

    <Grid container spacing={3} mb={3}>
      <Grid size={{ xs: 12, md: 8 }}>
        <LeaveManagement />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <HRBirthdaysAndAnniversaries />
      </Grid>
    </Grid>
  </Box>
);

export default HRDashboardScreen;
