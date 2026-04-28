'use client';

import React from 'react';
import { Box, Grid } from '@mui/material';
import { hrPaths } from 'src/constants/hr-menus';
import CompactKPICard from 'src/screens/student/dashboard/principal/kpi-card-item';

// -----------------------------------------------------------------------

const KPI_DATA = [
  {
    id: 1,
    title: 'Pending Approvals',
    value: '12',
    icon: 'mdi:clipboard-clock-outline',
    path: hrPaths.leaveManagement.approvals,
    status: 'error' as const,
    chart: {
      type: 'donut' as const,
      series: [12, 88],
      width: 56,
      height: 56,
      colors: ['#FF5630', '#22C55E'],
      labels: ['Pending', 'Resolved'],
    },
  },
  {
    id: 2,
    title: 'Not Checked-In Yet',
    value: '8',
    icon: 'mdi:account-clock-outline',
    path: hrPaths.attendance.markAttendance,
    status: 'warning' as const,
    chart: {
      type: 'donut' as const,
      series: [110, 8],
      width: 56,
      height: 56,
      colors: ['#22C55E', '#FFAB00'],
      labels: ['Checked In', 'Not Yet'],
    },
  },
  {
    id: 3,
    title: 'Missing Punch',
    value: '5',
    icon: 'mdi:alert-circle-outline',
    path: hrPaths.attendance.markAttendance,
    status: 'info' as const,
    chart: {
      type: 'bar' as const,
      series: [113, 5],
      width: 30,
      height: 56,
      colors: ['#22C55E', '#00B8D9'],
      labels: ['OK', 'Missing'],
    },
  },
  {
    id: 4,
    title: 'Late Beyond Limit',
    value: '6',
    icon: 'mdi:timer-alert-outline',
    path: hrPaths.attendance.markAttendance,
    status: 'warning' as const,
    chart: {
      type: 'donut' as const,
      series: [112, 6],
      width: 56,
      height: 56,
      colors: ['#22C55E', '#FFAB00'],
      labels: ['On Time', 'Late'],
    },
  },
  {
    id: 5,
    title: 'Absent w/o Leave',
    value: '3',
    icon: 'mdi:account-remove-outline',
    path: hrPaths.attendance.markAttendance,
    status: 'error' as const,
    chart: {
      type: 'bar' as const,
      series: [115, 3],
      width: 30,
      height: 56,
      colors: ['#22C55E', '#FF5630'],
      labels: ['Present', 'AWOL'],
    },
  },
];

const AttendanceActionCenter = () => (
  <Box>
    <Grid container spacing={1}>
      {KPI_DATA.map((item) => (
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={item.id}>
          <CompactKPICard
            title={item.title}
            value={item.value}
            path={item.path}
            status={item.status}
            chart={item.chart}
          />
        </Grid>
      ))}
    </Grid>
  </Box>
);

export default AttendanceActionCenter;
