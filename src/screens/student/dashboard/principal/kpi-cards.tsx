import React from 'react';
import { Grid } from '@mui/material';
// Paths
import { hrPaths } from 'src/constants/hr-menus';
import { studentPaths } from 'src/constants/student-menu';
import { financePaths } from 'src/constants/finance-menu';
import { fNumber, fPercent } from 'src/utils/format-number';
import { calendarPaths } from 'src/constants/calendar-menu';

import CompactKPICard from './kpi-card-item';

// ----------------------------------------------------------------------

const KPI_DATA = [
  {
    id: 1,
    title: 'Total Students',
    value: fNumber(2450),
    percentChange: 2.4,
    icon: 'mdi:account-school-outline',
    status: 'info' as const,
    trendData: [2400, 2410, 2405, 2425, 2430, 2450],
    path: studentPaths.records.studentList,
  },
  {
    id: 2,
    title: 'Present Today',
    value: fNumber(2315),
    percentChange: -0.5,
    icon: 'mdi:account-check-outline',
    status: 'success' as const,
    trendData: [2300, 2350, 2320, 2310, 2340, 2315],
    path: studentPaths.attendance.markAttendance,
  },
  {
    id: 3,
    title: 'Avg Attendance',
    value: fPercent(94.5),
    percentChange: 1.2,
    icon: 'mdi:chart-timeline-variant',
    status: 'success' as const,
    trendData: [92, 93, 91, 94, 93, 94.5],
    path: studentPaths.attendance.reports,
  },
  {
    id: 4,
    title: 'Academic Avg',
    value: fPercent(78),
    percentChange: 3.1,
    icon: 'mdi:school-outline',
    status: 'primary' as const,
    trendData: [72, 74, 75, 76, 77, 78],
    path: studentPaths.records.reports,
  },
  {
    id: 5,
    title: 'At-Risk Students',
    value: fNumber(45),
    percentChange: 5.2,
    icon: 'mdi:alert-circle-outline',
    status: 'error' as const,
    trendData: [40, 42, 41, 44, 43, 45],
    path: studentPaths.enrollment.reports,
    tooltip: 'Students identified with low attendance (<75%) or poor academic performance.',
  },
  {
    id: 6,
    title: 'Pending Fees',
    value: '₹ 2.4L',
    percentChange: -2.4,
    icon: 'mdi:cash-multiple',
    status: 'warning' as const,
    trendData: [2.8, 2.7, 2.6, 2.5, 2.45, 2.4],
    path: financePaths.dashboard,
  },
  {
    id: 7,
    title: 'Teacher Attendance',
    value: fPercent(98),
    percentChange: 0.2,
    icon: 'mdi:human-male-board',
    status: 'success' as const,
    trendData: [97, 98, 96, 98, 98, 98],
    path: hrPaths.attendance.attendanceTracking,
  },
  {
    id: 8,
    title: 'Events / Alerts',
    value: '3',
    percentChange: 0,
    icon: 'mdi:calendar-alert',
    status: 'info' as const,
    trendData: [1, 2, 0, 1, 3, 3],
    path: calendarPaths.dashboard,
  },
];

const PrincipalKPICards = () => (
  <Grid container spacing={1}>
    {KPI_DATA.map((item) => (
      <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.id}>
        <CompactKPICard
          title={item.title}
          value={item.value}
          percentChange={item.percentChange}
          icon={item.icon}
          status={item.status}
          trendData={item.trendData}
          path={item.path}
          tooltip={item.tooltip}
        />
      </Grid>
    ))}
  </Grid>
);

export default PrincipalKPICards;
