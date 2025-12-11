'use client';

import React from 'react';
import { Box, Grid } from '@mui/material';

import SummaryCards from './Components/SummaryCards';
import VehicleStatusChart from './Components/VehicleStatusChart';
import StudentsByRouteChart from './Components/StudentsByRouteChart';
import ApplicationStatusChart from './Components/ApplicationStatusChart';

const TransportAdminDashboard = () => (
  <Box>
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid size={{ xs: 12 }}>
        <SummaryCards />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <VehicleStatusChart />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ApplicationStatusChart />
      </Grid>

      <Grid size={{ xs: 12 }} mb={2}>
        <StudentsByRouteChart />
      </Grid>

      {/* <Grid size={{ xs: 12 }}>
        <ActiveRouteList />
      </Grid> */}
    </Grid>
  </Box>
);

export default TransportAdminDashboard;
