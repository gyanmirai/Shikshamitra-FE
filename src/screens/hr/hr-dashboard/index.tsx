'use client';

import React from 'react';
import { Box, Grid } from '@mui/material';

import HRStatsCards from './components/HRStatsCards';
import LeaveManagement from './components/LeaveManagement';
import HRPayrollSummary from './components/HRPayrollSummary';
import HRDashboardAttendanceTrend from './components/HRDashboardAttendanceTrend';
import HRBirthdaysAndAnniversaries from './components/HRBirthdaysAndAnniversaries';

const HRDashboardScreen = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
    <HRStatsCards />

    <Grid container spacing={1} mb={1}>
      <Grid size={{ xs: 12, md: 6 }}>
        <HRDashboardAttendanceTrend />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <HRPayrollSummary />
      </Grid>
    </Grid>

    <Grid container spacing={1} mb={1}>
      <Grid size={{ xs: 12, md: 6 }}>
        <LeaveManagement />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <HRBirthdaysAndAnniversaries />
      </Grid>
    </Grid>
  </Box>
);

export default HRDashboardScreen;
