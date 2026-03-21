'use client';

import { Box, Grid } from '@mui/material';

import SummaryCards from './components/SummaryCards';
import ApplicationTrendChart from './components/ApplicationTrendChart';
import RouteDistributionChart from './components/RouteDistributionChart';
import UtilizationByClassChart from './components/UtilizationByClassChart';
import VehicleStatusSummaryChart from './components/VehicleStatusSummaryChart';

const PrincipalTransportDashboard = () => (
  <Box>
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid size={{ xs: 12 }}>
        <SummaryCards />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ApplicationTrendChart />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <RouteDistributionChart />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <VehicleStatusSummaryChart />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }} mb={2}>
        <UtilizationByClassChart />
      </Grid>

      {/* <Grid size={{ xs: 12 }}>
        <PendingApplicationsList />
      </Grid> */}
    </Grid>
  </Box>
);

export default PrincipalTransportDashboard;
