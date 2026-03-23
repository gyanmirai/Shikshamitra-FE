'use client';

import React from 'react';
import { Box, Grid } from '@mui/material';

import HRStatsCards from './components/HRStatsCards';
import LeaveManagement from './components/LeaveManagement';
import HRPayrollSummary from './components/HRPayrollSummary';
import HRQuickActionsPanel from './components/HRQuickActionsPanel';
import HRDepartmentOverview from './components/HRDepartmentOverview';
import HRDashboardAttendanceTrend from './components/HRDashboardAttendanceTrend';
import HRBirthdaysAndAnniversaries from './components/HRBirthdaysAndAnniversaries';

const HRDashboardScreen = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pb: 1 }}>
    {/* Row 1 – KPI Summary Cards */}
    <HRStatsCards />

    <Grid size={{ xs: 12, md: 4 }} sx={{ mt: -1 }}>
      <HRQuickActionsPanel />
    </Grid>

    {/* Row 2 – Attendance Overview | Payroll Summary */}
    <Grid container spacing={1}>
      <Grid size={{ xs: 12, md: 7 }}>
        <HRDashboardAttendanceTrend />
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <HRPayrollSummary />
      </Grid>
    </Grid>

    {/* Row 3 – Leave Management | Quick Actions + Alerts */}
    <Grid container spacing={1}>
      <Grid size={{ xs: 12, md: 6 }}>
        <LeaveManagement />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
          <HRBirthdaysAndAnniversaries />
          {/* <HRAlertsWidget /> */}
        </Box>
      </Grid>
    </Grid>

    {/* Row 4 – Department Overview | Celebrations */}
    <Grid container spacing={1}>
      <Grid size={{ xs: 12 }}>
        <HRDepartmentOverview />
      </Grid>
    </Grid>
  </Box>
);

export default HRDashboardScreen;
