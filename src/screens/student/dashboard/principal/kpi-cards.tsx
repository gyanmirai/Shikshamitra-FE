import React from 'react';
import { Box, Grid } from '@mui/material';
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
    tooltip: 'Total number of enrolled students in the institution, including boys and girls.',
    status: 'info' as const,
    chart: {
      type: 'bar' as const,
      series: [1300, 1150],
      labels: ['Boys', 'Girls'],
      colors: ['#00B8D9', '#FF5630'],
      width: 30,
    },
    path: studentPaths.records.studentList,
  },
  {
    id: 2,
    title: 'Present Today',
    value: fNumber(2315),
    tooltip: "Number of students present today based on today's attendance records.",
    status: 'success' as const,
    chart: {
      type: 'donut' as const,
      series: [2315, 135],
      labels: ['Present', 'Absent'],
      width: 56,
      height: 56,
    },
    path: studentPaths.attendance.markAttendance,
  },
  {
    id: 3,
    title: 'Avg Attendance',
    value: fPercent(94.5),
    tooltip: 'Average student attendance percentage calculated for the current academic period.',
    status: 'success' as const,
    chart: {
      type: 'donut' as const,
      series: [94.5, 5.5],
      labels: ['Present', 'Absent'],
      colors: ['#22C55E', '#FF5630'],
      width: 56,
      height: 56,
    },
    path: studentPaths.attendance.reports,
  },
  {
    id: 4,
    title: 'Academic Avg',
    value: fPercent(78),
    tooltip: 'Average academic performance of students based on recent exam results.',
    status: 'primary' as const,
    chart: {
      type: 'donut' as const,
      series: [78, 22],
      labels: ['Score', 'Remaining'],
      width: 56,
      height: 56,
    },
    path: studentPaths.records.reports,
  },
  {
    id: 5,
    title: 'At-Risk Students',
    value: fNumber(45),
    tooltip: 'Students identified with low attendance (<75%) or poor academic performance.',
    status: 'error' as const,
    chart: {
      type: 'bar' as const,
      series: [40, 42, 41, 44, 45],
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      width: 40,
    },
    path: studentPaths.enrollment.reports,
  },
  {
    id: 6,
    title: 'Pending Fees',
    value: '₹ 2.4L',
    tooltip: 'Total amount of student fees that are still pending payment.',
    status: 'warning' as const,
    chart: {
      type: 'donut' as const,
      series: [22, 78],
      labels: ['Paid', 'Pending'],
      colors: ['#22C55E', '#FF5630'],
      width: 56,
      height: 56,
    },
    path: financePaths.dashboard,
  },
  {
    id: 7,
    title: 'Teacher Attendance',
    value: fPercent(98),
    tooltip: 'Overall teacher attendance percentage recorded for today.',
    status: 'success' as const,
    chart: {
      type: 'donut' as const,
      series: [98, 2],
      labels: ['Present', 'Absent'],
      width: 56,
      height: 56,
    },
    path: hrPaths.attendance.attendanceTracking,
  },
  {
    id: 8,
    title: 'Events / Alerts',
    value: '3',
    tooltip: 'Number of upcoming school events or important alerts scheduled for this week.',
    status: 'info' as const,
    chart: {
      type: 'bar' as const,
      series: [1, 2, 0, 1, 3],
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      width: 40,
    },
    path: calendarPaths.dashboard,
  },
];

const PrincipalKPICards = () => (
  <Box>
    <Grid container spacing={1}>
      {KPI_DATA.map((item) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.id}>
          <CompactKPICard
            title={item.title}
            value={item.value}
            status={item.status}
            path={item.path}
            tooltip={item.tooltip}
            chart={item.chart}
          />
        </Grid>
      ))}
    </Grid>
  </Box>
);

export default PrincipalKPICards;
