'use client';

import { Box, Grid } from '@mui/material';

import AlertsPanel from './components/AlertsPanel';
import SmartKPICards from './components/SmartKPICards';
import RouteManagementTable from './components/RouteManagementTable';
import VehicleHealthSection from './components/VehicleHealthSection';
import PerformanceAnalytics from './components/PerformanceAnalytics';
import TransportFeeAnalytics from './components/TransportFeeAnalytics';

const TransportAdminDashboard = () => (
  <Box>
    <Grid container spacing={1}>
      {/* 1. Smart KPI Cards */}
      <Grid size={{ xs: 12 }}>
        <SmartKPICards />
      </Grid>

      {/* 2. Alerts & Critical Notifications */}
      <Grid size={{ xs: 12, md: 6 }}>
        <AlertsPanel />
      </Grid>

      {/* 3. Performance & Historical Data */}
      <Grid size={{ xs: 12, md: 6 }}>
        <PerformanceAnalytics />
      </Grid>

      {/* 4. Financial Analytics */}
      <Grid size={{ xs: 12 }}>
        <TransportFeeAnalytics />
      </Grid>

      {/* 5. Vehicle Health & Compliance */}
      <Grid size={{ xs: 12 }}>
        <VehicleHealthSection />
      </Grid>

      {/* 6. Route Management Table */}
      <Grid size={{ xs: 12 }}>
        <RouteManagementTable />
      </Grid>
    </Grid>
  </Box>
);

export default TransportAdminDashboard;
