'use client';

import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Stack, CardHeader, Typography, IconButton } from '@mui/material';

const FILTER_OPTIONS = [
  { id: 'weekly', name: 'Weekly' },
  { id: 'monthly', name: 'Monthly' },
  { id: 'yearly', name: 'Yearly' },
];

type MetricPoint = { present: number; absent: number; leave: number };

const CHART_DATA: Record<
  string,
  {
    categories: string[];
    data: MetricPoint[];
    attendanceRate: number;
    absenteeTrend: number;
  }
> = {
  weekly: {
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    data: [
      { present: 118, absent: 5, leave: 7 },
      { present: 122, absent: 3, leave: 5 },
      { present: 115, absent: 7, leave: 8 },
      { present: 120, absent: 4, leave: 6 },
      { present: 117, absent: 6, leave: 7 },
      { present: 98, absent: 8, leave: 4 },
    ],
    attendanceRate: 91,
    absenteeTrend: -1,
  },
  monthly: {
    categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    data: [
      { present: 102, absent: 6, leave: 8 },
      { present: 108, absent: 4, leave: 6 },
      { present: 105, absent: 5, leave: 7 },
      { present: 110, absent: 3, leave: 5 },
    ],
    attendanceRate: 86,
    absenteeTrend: -2,
  },
  yearly: {
    categories: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    data: [
      { present: 112, absent: 11, leave: 13 },
      { present: 105, absent: 14, leave: 17 },
      { present: 118, absent: 9, leave: 12 },
      { present: 122, absent: 7, leave: 10 },
      { present: 98, absent: 18, leave: 14 },
      { present: 108, absent: 12, leave: 16 },
      { present: 95, absent: 20, leave: 18 },
      { present: 114, absent: 10, leave: 11 },
      { present: 119, absent: 8, leave: 13 },
      { present: 110, absent: 13, leave: 15 },
      { present: 116, absent: 9, leave: 12 },
      { present: 107, absent: 11, leave: 14 },
    ],
    attendanceRate: 79,
    absenteeTrend: 3,
  },
};

// MUI light palette colors
const METRIC_COLORS = {
  present: '#81c784', // MUI green[300]
  absent: '#e57373', // MUI red[300]
  leave: '#ffb74d', // MUI orange[300]
};

const HRDashboardAttendanceTrend = () => {
  const theme = useTheme();
  const [filter, setFilter] = useState('weekly');

  const currentData = CHART_DATA[filter] || CHART_DATA.weekly;

  const series = [
    { name: 'Present', data: currentData.data.map((d) => d.present) },
    { name: 'Absent', data: currentData.data.map((d) => d.absent) },
    { name: 'Leave', data: currentData.data.map((d) => d.leave) },
  ];

  const chartOptions = useChart({
    colors: [METRIC_COLORS.present, METRIC_COLORS.absent, METRIC_COLORS.leave],
    stroke: { width: 2.5, curve: 'smooth' },
    markers: { size: 4, hover: { size: 6 } },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        colors: theme.palette.text.primary,
      },
      // markers: {
      //   height: 4,
      //   radius: 2,
      // },
      itemMargin: { horizontal: 8 },
    },
    xaxis: { categories: currentData.categories },
    tooltip: {
      y: { formatter: (value: number) => `${value} Staff` },
    },
  });

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6">Attendance Overview</Typography>
            <CustomTooltip
              title="Track daily, monthly, and yearly attendance trends"
              placement="top"
            >
              <IconButton size="small" sx={{ p: 0 }}>
                <Iconify
                  icon="solar:info-circle-linear"
                  width={18}
                  sx={{ color: 'text.disabled' }}
                />
              </IconButton>
            </CustomTooltip>
          </Stack>
        }
        sx={{ p: 2, pb: 1 }}
        action={
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <CustomSelect
              options={FILTER_OPTIONS}
              label="Filter"
              value={filter}
              onChange={(val) => setFilter(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { minWidth: '110px' } }}
            />
          </Stack>
        }
      />

      <Box sx={{ mt: 0.5, mx: 1 }} dir="ltr">
        <Chart type="line" series={series} options={chartOptions} height={240} />
      </Box>
    </Card>
  );
};

export default HRDashboardAttendanceTrend;
