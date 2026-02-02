'use client';

import React from 'react';
import { Box, Grid } from '@mui/material';

import SummaryCards from './Components/SummaryCards';
import RouteTypeChart from './Components/RouteTypeChart';
import VehicleStatusChart from './Components/VehicleStatusChart';
import StudentsPerStopChart from './Components/StudentsPerStopChart';
import TodayRouteScheduleList from './Components/TodayRouteScheduleList';
import WeeklyPerformanceChart from './Components/WeeklyPerformanceChart';

const TransportManagerDashboard = () => (
  <Box>
    <Grid container spacing={2} sx={{ mb: 2 }}>
      {/* <Grid size={{ xs: 12 }}>
        <DriverAttendanceCards />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <OnTimePerformanceCard />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <DriverCheckInCard />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <MaintenanceStatusCard />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <RouteStatusTable />
      </Grid> */}

      <Grid size={{ xs: 12 }}>
        <SummaryCards />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <RouteTypeChart />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <VehicleStatusChart />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TodayRouteScheduleList />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <WeeklyPerformanceChart />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <StudentsPerStopChart />
      </Grid>
      {/* <Grid size={{ xs: 12, md: 8 }}>
        <PendingApplicationsList />
      </Grid> */}

      {/* <Grid size={{ xs: 12, md: 4 }}>
        <MaintenanceVehiclesList />
      </Grid> */}
    </Grid>
  </Box>
);

export default TransportManagerDashboard;
