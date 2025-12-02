'use client';

import { Box, Grid } from '@mui/material';

import SummaryCards from './Components/SummaryCards';
import ApplicationTrendChart from './Components/ApplicationTrendChart';
import RouteDistributionChart from './Components/RouteDistributionChart';
import UtilizationByClassChart from './Components/UtilizationByClassChart';
import VehicleStatusSummaryChart from './Components/VehicleStatusSummaryChart';

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
