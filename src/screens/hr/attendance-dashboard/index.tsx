'use client';

import React from 'react';
import { Box, Grid } from '@mui/material';

import AttendanceLateTrend from './components/AttendanceLateTrend';
import AttendanceLiveStatus from './components/AttendanceLiveStatus';
import AttendanceActionCenter from './components/AttendanceActionCenter';
import AttendanceTopDefaulters from './components/AttendanceTopDefaulters';
import AttendanceTrendsAnalytics from './components/AttendanceTrendsAnalytics';
import AttendanceShiftMonitoring from './components/AttendanceShiftMonitoring';

const AttendanceDashboardScreen = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pb: 1 }}>
    {/* Row 1 – Action Center KPI Cards */}
    <AttendanceActionCenter />

    {/* Row 2 – Live Status Strip */}
    <AttendanceLiveStatus />

    {/* Row 3 – Attendance Trend | Late Arrival Trend (side by side) */}
    <Grid container spacing={1}>
      <Grid size={{ xs: 12, md: 6 }}>
        <AttendanceTrendsAnalytics />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <AttendanceLateTrend />
      </Grid>
    </Grid>

    {/* Row 4 – Shift Monitoring (full width) */}
    <Grid container spacing={1}>
      <Grid size={{ xs: 5 }} sx={{ display: 'flex', flexDirection: 'column' }}>
        <AttendanceShiftMonitoring />
      </Grid>
      <Grid size={{ xs: 7 }} sx={{ display: 'flex', flexDirection: 'column' }}>
        <AttendanceTopDefaulters />
      </Grid>
    </Grid>
  </Box>
);

export default AttendanceDashboardScreen;
