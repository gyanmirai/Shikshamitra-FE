'use client';

import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { motion, type Variants } from 'framer-motion';
import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Stack, CardHeader, Typography, IconButton } from '@mui/material';

// -----------------------------------------------------------------------

const FILTER_OPTIONS = [
  { id: '7d', name: 'Last 7 Days' },
  { id: '30d', name: 'Last 30 Days' },
];

type TrendPoint = { present: number; absent: number };

const ATTENDANCE_TREND: Record<
  string,
  { categories: string[]; data: TrendPoint[]; rate: number; change: number }
> = {
  '7d': {
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data: [
      { present: 108, absent: 10 },
      { present: 112, absent: 6 },
      { present: 105, absent: 13 },
      { present: 114, absent: 4 },
      { present: 110, absent: 8 },
      { present: 98, absent: 20 },
      { present: 96, absent: 22 },
    ],
    rate: 91,
    change: -2,
  },
  '30d': {
    categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    data: [
      { present: 102, absent: 16 },
      { present: 108, absent: 10 },
      { present: 105, absent: 13 },
      { present: 110, absent: 8 },
    ],
    rate: 88,
    change: 3,
  },
};

const COLORS = { present: '#22C55E', absent: '#FF5630' };

const chartVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const AttendanceTrendsAnalytics = () => {
  const theme = useTheme();
  const [filter, setFilter] = useState('7d');

  const attendanceData = ATTENDANCE_TREND[filter] || ATTENDANCE_TREND['7d'];

  const series = [
    { name: 'Present', data: attendanceData.data.map((d) => d.present) },
    { name: 'Absent', data: attendanceData.data.map((d) => d.absent) },
  ];

  const chartOptions = useChart({
    colors: [COLORS.present, COLORS.absent],
    stroke: { width: 3, curve: 'smooth' },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [0, 90, 100] },
    },
    markers: { size: 4, hover: { size: 7 } },
    legend: { show: false },
    xaxis: { categories: attendanceData.categories },
    yaxis: { labels: { formatter: (v: number) => `${v}` } },
    tooltip: { y: { formatter: (v: number) => `${v} Staff` } },
    chart: {
      dropShadow: {
        enabled: true,
        top: 6,
        left: 0,
        blur: 10,
        opacity: 0.12,
        color: COLORS.present,
      },
    },
  });

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 2,
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6">Attendance Trend</Typography>
            <CustomTooltip title="Present vs Absent over the selected period" placement="top">
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
            label="Period"
            value={filter}
            onChange={(val) => setFilter(val as string)}
            labelKey="name"
            valueKey="id"
            formControlProps={{ sx: { minWidth: '120px' } }}
          />
        }
      />

      <Stack direction="row" spacing={2.5} sx={{ px: 2.5, pt: 0.5 }}>
        {[
          { color: COLORS.present, label: 'Present' },
          { color: COLORS.absent, label: 'Absent' },
        ].map((item) => (
          <Stack key={item.label} direction="row" alignItems="center" spacing={0.75}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: item.color }} />
            <Typography variant="caption" color="text.secondary">
              {item.label}
            </Typography>
          </Stack>
        ))}
      </Stack>

      <motion.div
        variants={chartVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        style={{ flex: 1 }}
      >
        <Box sx={{ mt: 0.5, mx: 1, pb: 1 }} dir="ltr">
          <Chart type="area" series={series} options={chartOptions} height={260} />
        </Box>
      </motion.div>
    </Card>
  );
};

export default AttendanceTrendsAnalytics;
