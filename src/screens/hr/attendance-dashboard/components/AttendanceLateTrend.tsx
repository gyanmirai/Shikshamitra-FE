'use client';

import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { motion, type Variants } from 'framer-motion';
import { alpha, useTheme } from '@mui/material/styles';
import { Chart, useChart } from 'src/components/chart';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Stack, CardHeader, Typography, IconButton } from '@mui/material';

// -----------------------------------------------------------------------

const FILTER_OPTIONS = [
  { id: '7d', name: 'Last 7 Days' },
  { id: '30d', name: 'Last 30 Days' },
];

const LATE_TREND: Record<string, { categories: string[]; data: number[]; total: number }> = {
  '7d': {
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data: [5, 8, 3, 7, 6, 4, 9],
    total: 42,
  },
  '30d': {
    categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    data: [22, 18, 25, 15],
    total: 80,
  },
};

const LATE_COLOR = '#FFAB00';

const chartVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const AttendanceLateTrend = () => {
  const theme = useTheme();
  const [filter, setFilter] = useState('7d');

  const data = LATE_TREND[filter] || LATE_TREND['7d'];
  const peak = Math.max(...data.data);
  const peakDay = data.categories[data.data.indexOf(peak)];

  const series = [{ name: 'Late Arrivals', data: data.data }];

  const chartOptions = useChart({
    colors: [LATE_COLOR],
    stroke: { width: 0 },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '50%',
        distributed: false,
        dataLabels: { position: 'top' },
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        type: 'vertical',
        shadeIntensity: 0.4,
        gradientToColors: [alpha(LATE_COLOR, 0.5)],
        stops: [0, 100],
      },
    },
    legend: { show: false },
    xaxis: { categories: data.categories },
    yaxis: {
      labels: { formatter: (v: number) => `${v}` },
    },
    tooltip: { y: { formatter: (v: number) => `${v} Late` } },
    dataLabels: {
      enabled: true,
      offsetY: -18,
      style: {
        fontSize: '11px',
        fontWeight: 700,
        colors: [LATE_COLOR],
      },
      background: { enabled: false },
    },
    chart: {
      dropShadow: {
        enabled: true,
        top: 4,
        left: 0,
        blur: 8,
        opacity: 0.12,
        color: LATE_COLOR,
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
            <Typography variant="h6">Late Arrival Trend</Typography>
            <CustomTooltip
              title="Daily pattern of late arrivals over selected period"
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
            label="Period"
            value={filter}
            onChange={(val) => setFilter(val as string)}
            labelKey="name"
            valueKey="id"
            formControlProps={{ sx: { minWidth: '120px' } }}
          />
        }
      />

      {/* Stats strip */}
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
          <Iconify icon="mdi:clock-alert-outline" width={16} sx={{ color: 'warning.main' }} />
          <Typography variant="caption" color="text.secondary">
            Total Late:
          </Typography>
          <Typography variant="caption" fontWeight={700} color="warning.main">
            {data.total}
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Iconify icon="mdi:calendar-alert" width={16} sx={{ color: 'error.main' }} />
          <Typography variant="caption" color="text.secondary">
            Peak:
          </Typography>
          <Typography variant="caption" fontWeight={700} color="error.main">
            {peak} on {peakDay}
          </Typography>
        </Stack>
      </Stack>

      {/* Legend */}
      <Stack direction="row" spacing={2.5} sx={{ px: 2.5, pt: 0.5 }}>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: LATE_COLOR }} />
          <Typography variant="caption" color="text.secondary">
            Late Arrivals
          </Typography>
        </Stack>
      </Stack>

      <motion.div
        variants={chartVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        style={{ flex: 1 }}
      >
        <Box sx={{ mt: 0.5, mx: 1, pb: 1 }} dir="ltr">
          <Chart type="bar" series={series} options={chartOptions} height={260} />
        </Box>
      </motion.div>
    </Card>
  );
};

export default AttendanceLateTrend;
