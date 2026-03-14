'use client';

import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import {
  Box,
  Card,
  Stack,
  Avatar,
  Divider,
  CardHeader,
  Typography,
  IconButton,
} from '@mui/material';

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

const CHART_DATA: Record<
  string,
  { categories: string[]; series: { name: string; data: number[] }[] }
> = {
  today: {
    categories: ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM'],
    series: [
      { name: 'Present', data: [110, 112, 115, 113, 110] },
      { name: 'Leave', data: [5, 5, 5, 5, 5] },
      { name: 'Absent', data: [3, 1, 0, 0, 3] },
    ],
  },
  monthly: {
    categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    series: [
      { name: 'Present', data: [105, 110, 108, 112] },
      { name: 'Leave', data: [8, 5, 6, 4] },
      { name: 'Absent', data: [5, 3, 4, 2] },
    ],
  },
  yearly: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
    series: [
      { name: 'Present', data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43] },
      { name: 'Leave', data: [13, 23, 20, 8, 13, 27, 33, 12, 19, 14, 20] },
      { name: 'Absent', data: [11, 17, 15, 15, 21, 14, 15, 13, 10, 12, 17] },
    ],
  },
};

const HRDashboardAttendanceTrend = () => {
  const [filter, setFilter] = useState('monthly');

  const currentData = CHART_DATA[filter] || CHART_DATA.monthly;

  const chartOptions = useChart({
    colors: ['#00AB55', '#FFAB00', '#FF5630'],
    stroke: { width: 2 },
    xaxis: {
      categories: currentData.categories,
    },
    tooltip: {
      y: { formatter: (value: number) => `${value} Staff` },
    },
  });

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={0.5}>
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
        sx={{ px: 1.5, py: 2 }}
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
      <Box sx={{ mt: 1, mx: 1 }} dir="ltr">
        <Chart type="area" series={currentData.series} options={chartOptions} height={240} />
      </Box>

      <Divider sx={{ mx: 1, my: 1.5, borderStyle: 'dashed' }} />

      {/* Today's Absentees */}
      <Box sx={{ px: 1, pb: 2, flexGrow: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
          <Iconify icon="mdi:account-off-outline" width={18} sx={{ color: 'error.main' }} />
          <Typography variant="subtitle2" fontWeight={700}>
            Today&apos;s Absentees
          </Typography>
          <Label color="error" variant="soft" sx={{ ml: 'auto' }}>
            {ABSENTEES.length} absent
          </Label>
        </Stack>

        <Scrollbar sx={{ maxHeight: 180 }}>
          <Stack spacing={1}>
            {ABSENTEES.map((emp) => (
              <Stack
                key={emp.id}
                direction="row"
                alignItems="center"
                spacing={1.5}
                sx={{
                  py: 0.75,
                  px: 1,
                  borderRadius: 1.5,
                  bgcolor: 'background.neutral',
                }}
              >
                <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                  {emp.name.charAt(0)}
                </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="caption" fontWeight={600} noWrap>
                    {emp.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" noWrap>
                    {emp.department}
                  </Typography>
                </Box>
                <Label
                  color={LEAVE_COLORS[emp.leaveType] || 'default'}
                  variant="soft"
                  sx={{ flexShrink: 0, fontSize: '0.65rem' }}
                >
                  {emp.leaveType}
                </Label>
              </Stack>
            ))}
          </Stack>
        </Scrollbar>
      </Box>
    </Card>
  );
};

export default HRDashboardAttendanceTrend;
