import React, { useState } from 'react';
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
    percentChange: 2.4,
    status: 'info' as const,
    chart: {
      type: 'bar' as const,
      series: [1300, 1150],
      labels: ['Boys', 'Girls'],
      colors: ['#00B8D9', '#FF5630'], // Info (blue), Error (red/orange)
      width: 30, // Matches our 30px standard from admin kpi cards!
    },
    path: studentPaths.records.studentList,
  },
  {
    id: 2,
    title: 'Present Today',
    value: fNumber(2315),
    percentChange: -0.5,
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
    percentChange: 1.2,
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
    percentChange: 3.1,
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
    percentChange: 5.2,
    status: 'error' as const,
    chart: {
      type: 'bar' as const,
      series: [40, 42, 41, 44, 45],
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      width: 40,
    },
    path: studentPaths.enrollment.reports,
    tooltip: 'Students identified with low attendance (<75%) or poor academic performance.',
  },
  {
    id: 6,
    title: 'Pending Fees',
    value: '₹ 2.4L',
    percentChange: -2.4,
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
    percentChange: 0.2,
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
    percentChange: 0,
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

const PrincipalKPICards = () => {
  const [timeFilter] = useState('Today');

  const strategicMetrics = ['Total Students', 'Academic Avg', 'Avg Attendance', 'Pending Fees'];

  const getDynamicPercentChange = (baseChange: number, title: string, filter: string) => {
    if (strategicMetrics.includes(title)) return baseChange;

    // Specific handling for 'Events / Alerts' which has 0%
    if (title === 'Events / Alerts' && baseChange === 0) {
      if (filter === 'Today') return 0;
      if (filter === 'This Week') return 5;
      if (filter === 'This Month') return 12;
      if (filter === 'Academic Year') return 25;
    }

    if (filter === 'Today') return baseChange;
    if (filter === 'This Week') return Number((baseChange * 1.2).toFixed(1));
    if (filter === 'This Month') return Number((baseChange * 1.5).toFixed(1));
    if (filter === 'Academic Year') return Number((baseChange * 2.1).toFixed(1));
    return baseChange;
  };

  return (
    <Box>
      <Grid container spacing={1}>
        {KPI_DATA.map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.id}>
            <CompactKPICard
              title={item.title}
              value={item.value}
              percentChange={getDynamicPercentChange(item.percentChange, item.title, timeFilter)}
              // comparisonLabel={getComparisonLabel(item.title, timeFilter)}
              // icon={item.icon}
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
};

export default PrincipalKPICards;
