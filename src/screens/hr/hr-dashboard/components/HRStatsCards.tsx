'use client';

import React from 'react';
import { Box, Grid } from '@mui/material';
import { hrPaths } from 'src/constants/hr-menus';
import CompactKPICard from 'src/screens/student/dashboard/principal/kpi-card-item';

// ----------------------------------------------------------------------

const KPI_DATA = [
  {
    id: 1,
    title: 'Total Staff',
    value: '118',
    icon: 'mdi:account-group-outline',
    path: hrPaths.employee.list,
    chart: {
      type: 'bar' as const,
      series: [80, 38],
      labels: ['Teaching', 'Non-Teaching'],
      colors: ['#5BE584', '#FFD666'],
      width: 30,
    },
  },
  {
    id: 2,
    title: 'Present Today',
    value: '102',
    icon: 'mdi:account-check-outline',
    path: hrPaths.attendance.markAttendance,
    chart: {
      type: 'donut' as const,
      series: [102, 16],
      width: 56,
      height: 56,
      colors: ['#22C55E', '#FFA500'],
      labels: ['Present', 'Absent'],
    },
    tooltip: '102 / 118 staff present today',
  },
  {
    id: 3,
    title: 'On Leave',
    value: '8',
    icon: 'mdi:beach',
    path: hrPaths.leaveManagement.applyLeave,
    chart: {
      type: 'donut' as const,
      series: [110, 8],
      width: 56,
      height: 56,
      colors: ['#22C55E', '#FFA500'],
      labels: ['Present', 'Absent'],
    },
    tooltip: '102 / 118 staff present today',
  },
  {
    id: 4,
    title: 'Late Entry',
    value: '5',
    icon: 'mdi:clock-alert-outline',
    path: hrPaths.attendance.markAttendance,
    chart: {
      type: 'bar' as const,
      series: [113, 5],
      width: 30,
      height: 56,
      colors: ['#5BE584', '#FFD666'],
      labels: ['On Time', 'Late'],
    },
    tooltip: '102 / 118 staff present today',
  },
  {
    id: 5,
    title: 'Pending Leave',
    value: '5',
    icon: 'mdi:clipboard-clock-outline',
    path: hrPaths.leaveManagement.applyLeave,
    chart: {
      type: 'bar' as const,
      series: [113, 5],
      width: 30,
      height: 56,
      colors: ['#5BE584', '#FFD666'],
      labels: ['Approved', 'Pending'],
    },
    tooltip: 'Leave requests awaiting approval',
  },
  {
    id: 6,
    title: 'Payroll Due',
    value: '₹1.25L',
    icon: 'mdi:cash-multiple',
    path: hrPaths.payroll.runPayroll,
    chart: {
      type: 'area' as const,
      series: [1.1, 1.15, 1.2, 1.18, 1.22, 1.25],
      width: 30,
      height: 56,
      colors: ['#5BE584'],
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    },
    tooltip: 'Payroll due for the month',
  },
  {
    id: 7,
    title: 'New This Month',
    value: '3',
    icon: 'mdi:account-plus-outline',
    path: hrPaths.employee.list,
    status: 'info' as const,
    tooltip: 'New staff joined this month',
  },
  {
    id: 8,
    title: 'Contracts Expiring',
    value: '4',
    icon: 'mdi:file-alert-outline',
    path: hrPaths.employee.list,
    tooltip: 'Contracts expiring within 30 days',
  },
];

const HRStatsCards = () => (
  <Box mb={1}>
    <Grid container spacing={1}>
      {KPI_DATA.map((item) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.id}>
          <CompactKPICard
            title={item.title}
            value={item.value}
            path={item.path}
            status={item.status}
            // tooltip={item.tooltip}
            chart={item.chart}
          />
        </Grid>
      ))}
    </Grid>
  </Box>
);

export default HRStatsCards;
