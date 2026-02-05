'use client';

import React from 'react';
import { Box, Grid } from '@mui/material';

import QuickActions from './Components/QuickActions';
import SummaryCards from './Components/SummaryCards';
import DashboardAlerts from './Components/DashboardAlerts';
import VehicleStatusChart from './Components/VehicleStatusChart';
import LiveOperationsTable from './Components/LiveOperationsTable';
import StudentsByRouteChart from './Components/StudentsByRouteChart';
import PunctualityTrendChart from './Components/PunctualityTrendChart';
import ApplicationStatusChart from './Components/ApplicationStatusChart';

const TransportAdminDashboard = () => (
  <Box>
    <Grid container spacing={2} sx={{ mb: 2 }}>
      {/* 1. KPIs */}
      <Grid size={{ xs: 12 }}>
        <SummaryCards />
      </Grid>

      {/* 2. Quick Actions */}
      <Grid size={{ xs: 12 }}>
        <QuickActions />
      </Grid>

      {/* 3. Operational Focus (Table + Alerts) */}
      <Grid size={{ xs: 12, md: 8 }}>
        <LiveOperationsTable />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <DashboardAlerts />
      </Grid>

      {/* 4. Insights & Trends */}
      <Grid size={{ xs: 12, md: 8 }}>
        <PunctualityTrendChart />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <VehicleStatusChart />
      </Grid>

      {/* 5. Secondary Charts */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ApplicationStatusChart />
      </Grid>

      <Grid size={{ xs: 12, md: 8 }}>
        <StudentsByRouteChart />
      </Grid>
    </Grid>
  </Box>
);

export default TransportAdminDashboard;
