'use client';

import { Box, Grid } from '@mui/material';

import AlertsPanel from './Components/AlertsPanel';
import SmartKPICards from './Components/SmartKPICards';
import RouteManagementTable from './Components/RouteManagementTable';
import VehicleHealthSection from './Components/VehicleHealthSection';
import PerformanceAnalytics from './Components/PerformanceAnalytics';
import TransportFeeAnalytics from './Components/TransportFeeAnalytics';

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
