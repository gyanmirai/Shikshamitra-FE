'use client';

import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Stack, CardHeader, Typography, IconButton } from '@mui/material';

// -----------------------------------------------------------------------

const ABSENTEES = [
  { id: 1, name: 'Priya Sharma', department: 'Science', leaveType: 'Sick Leave', avatar: '' },
  { id: 2, name: 'Rahul Mehta', department: 'Mathematics', leaveType: 'Casual Leave', avatar: '' },
  { id: 3, name: 'Sunita Patel', department: 'HR', leaveType: 'Paid Leave', avatar: '' },
  { id: 4, name: 'Amit Verma', department: 'Administration', leaveType: 'Sick Leave', avatar: '' },
  { id: 5, name: 'Kavya Nair', department: 'English', leaveType: 'Casual Leave', avatar: '' },
  { id: 6, name: 'Deepak Singh', department: 'Computer', leaveType: 'Sick Leave', avatar: '' },
];

const LEAVE_COLORS: Record<string, 'error' | 'warning' | 'success'> = {
  'Sick Leave': 'error',
  'Casual Leave': 'warning',
  'Paid Leave': 'success',
};

const FILTER_OPTIONS = [
  { id: 'today', name: 'Today' },
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
  today: {
    categories: ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM'],
    data: [
      { present: 110, absent: 3, leave: 5 },
      { present: 112, absent: 1, leave: 5 },
      { present: 115, absent: 0, leave: 5 },
      { present: 113, absent: 0, leave: 5 },
      { present: 110, absent: 3, leave: 5 },
    ],
    attendanceRate: 94,
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
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
    data: [
      { present: 44, absent: 11, leave: 13 },
      { present: 55, absent: 17, leave: 23 },
      { present: 41, absent: 15, leave: 20 },
      { present: 67, absent: 15, leave: 8 },
      { present: 22, absent: 21, leave: 13 },
      { present: 43, absent: 14, leave: 27 },
      { present: 21, absent: 15, leave: 33 },
      { present: 41, absent: 13, leave: 12 },
      { present: 56, absent: 10, leave: 19 },
      { present: 27, absent: 12, leave: 14 },
      { present: 43, absent: 17, leave: 20 },
    ],
    attendanceRate: 79,
    absenteeTrend: 3,
  },
};

const METRIC_COLORS = {
  present: '#22c55e',
  absent: '#ef4444',
  leave: '#f59e0b',
};

const HRDashboardAttendanceTrend = () => {
  const [filter, setFilter] = useState('monthly');

  const currentData = CHART_DATA[filter] || CHART_DATA.monthly;

  const series = [
    { name: 'Present', data: currentData.data.map((d) => d.present) },
    { name: 'Absent', data: currentData.data.map((d) => d.absent) },
    { name: 'Leave', data: currentData.data.map((d) => d.leave) },
  ];

  const chartOptions = useChart({
    colors: [METRIC_COLORS.present, METRIC_COLORS.absent, METRIC_COLORS.leave],
    stroke: { width: 2.5, curve: 'smooth' },
    markers: { size: 4, hover: { size: 6 } },
    legend: { show: false },
    xaxis: { categories: currentData.categories },
    tooltip: {
      y: { formatter: (value: number) => `${value} Staff` },
    },
  });

  const trendDown = currentData.absenteeTrend < 0;
  const trendLabel =
    filter === 'today' ? 'yesterday' : filter === 'monthly' ? 'last week' : 'last month';

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
          <CustomSelect
            options={FILTER_OPTIONS}
            label="Filter"
            value={filter}
            onChange={(val) => setFilter(val as string)}
            labelKey="name"
            valueKey="id"
            formControlProps={{ sx: { minWidth: '100px' } }}
          />
        }
      />

      {/* Summary Stats */}
      <Stack
        direction="row"
        spacing={3}
        sx={{
          px: 2,
          py: 1,
          mx: 2,
          mb: 0.5,
          borderRadius: 1.5,
          bgcolor: 'background.neutral',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Iconify icon="solar:chart-2-bold-duotone" width={16} sx={{ color: 'success.main' }} />
          <Typography variant="caption" color="text.secondary">
            Attendance Rate:
          </Typography>
          <Typography variant="caption" fontWeight={700} color="success.main">
            {currentData.attendanceRate}%
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Iconify
            icon={trendDown ? 'solar:arrow-down-bold' : 'solar:arrow-up-bold'}
            width={16}
            sx={{ color: trendDown ? 'success.main' : 'error.main' }}
          />
          <Typography variant="caption" color="text.secondary">
            Absentees Trend:
          </Typography>
          <Typography
            variant="caption"
            fontWeight={700}
            color={trendDown ? 'success.main' : 'error.main'}
          >
            {trendDown ? '' : '+'}
            {currentData.absenteeTrend}% from {trendLabel}
          </Typography>
        </Stack>
      </Stack>

      {/* Custom Legend */}
      <Stack direction="row" spacing={2.5} sx={{ px: 2.5, pt: 0.5, pb: 0 }}>
        {[
          { color: METRIC_COLORS.present, label: 'Present' },
          { color: METRIC_COLORS.absent, label: 'Absent' },
          { color: METRIC_COLORS.leave, label: 'Leave' },
        ].map((item) => (
          <Stack key={item.label} direction="row" alignItems="center" spacing={0.75}>
            <Box sx={{ width: 22, height: 3, borderRadius: 2, bgcolor: item.color }} />
            <Typography variant="caption" color="text.secondary">
              {item.label}
            </Typography>
          </Stack>
        ))}
      </Stack>

      <Box sx={{ mt: 0.5, mx: 1 }} dir="ltr">
        <Chart type="line" series={series} options={chartOptions} height={240} />
      </Box>
    </Card>
  );
};

export default HRDashboardAttendanceTrend;
