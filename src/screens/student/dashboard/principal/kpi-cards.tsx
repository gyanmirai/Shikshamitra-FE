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
    icon: 'mdi:account-school-outline',
    status: 'info' as const,
    trendData: [2400, 2410, 2405, 2425, 2430, 2450],
    fullChart: {
      type: 'bar',
      series: [
        { name: 'Boys', data: [1300] },
        { name: 'Girls', data: [1150] },
      ],
      colors: ['#00B8D9', '#FF5630'], // Info (blue), Error (red/orange)
      options: {
        tooltip: {
          x: { show: false },
          y: { formatter: (val: number) => `${val} Students` },
        },
        xaxis: {
          categories: ['Total'],
          labels: { show: false },
        },
        plotOptions: {
          bar: {
            columnWidth: '40%',
            borderRadius: 2,
            distributed: false,
          },
        },
      },
    },
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

const PrincipalKPICards = () => {
  const [timeFilter] = useState('Today');

  const strategicMetrics = ['Total Students', 'Academic Avg', 'Avg Attendance', 'Pending Fees'];

  const getComparisonLabel = (title: string, filter: string) => {
    if (strategicMetrics.includes(title)) {
      return 'vs last year';
    }

    switch (filter) {
      case 'Today':
        return 'vs Yesterday';
      case 'This Week':
        return 'vs Last Week';
      case 'This Month':
        return 'vs Last Month';
      case 'Academic Year':
        return 'vs Last Academic Year';
      default:
        return 'vs last year';
    }
  };

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
              comparisonLabel={getComparisonLabel(item.title, timeFilter)}
              icon={item.icon}
              status={item.status}
              trendData={item.trendData}
              path={item.path}
              tooltip={item.tooltip}
              chart={(item as any).fullChart}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PrincipalKPICards;
