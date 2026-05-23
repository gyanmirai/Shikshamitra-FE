'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Box, Grid } from '@mui/material';
import { useSession } from 'next-auth/react';

import HRStatsCards from './components/HRStatsCards';
import LeaveManagement from './components/LeaveManagement';
import HRPayrollSummary from './components/HRPayrollSummary';
import HRQuickActionsPanel from './components/HRQuickActionsPanel';
import HRDashboardAttendanceTrend from './components/HRDashboardAttendanceTrend';
import HRBirthdaysAndAnniversaries from './components/HRBirthdaysAndAnniversaries';

const EmployeeProfileDashboard = dynamic(() => import('../employee/employee-dashboard'));

const hasRole = (role: unknown, expectedRole: string) => {
  if (Array.isArray(role)) {
    return role.some((item) => String(item).toLowerCase() === expectedRole);
  }

  return String(role || '').toLowerCase() === expectedRole;
};

const AdminDashboard = () => (
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
  </Box>
);

const HRDashboardScreen = () => {
  const { data: session } = useSession() as any;
  const isAdminUser = hasRole(session?.profile?.role, 'admin');

  if (!isAdminUser) {
    return <EmployeeProfileDashboard editData={{}} />;
  }

  return <AdminDashboard />;
};

export default HRDashboardScreen;
