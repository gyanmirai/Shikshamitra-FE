'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Iconify } from 'src/components/iconify';
import { motion, type Variants } from 'framer-motion';
import { alpha, useTheme } from '@mui/material/styles';
import { Chart, useChart } from 'src/components/chart';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Chip, Stack, Button, CardHeader, Typography, IconButton } from '@mui/material';

// -----------------------------------------------------------------------

const FILTER_OPTIONS = [
  { id: 'absences', name: 'By Absences' },
  { id: 'late', name: 'By Late Marks' },
  { id: 'missing', name: 'By Missing Punches' },
];

type DefaulterType = 'absences' | 'late' | 'missing';

interface DefaulterEntry {
  name: string;
  absences: number;
  late: number;
  missing: number;
}

const DEFAULTERS: DefaulterEntry[] = [
  { name: 'Rahul Sharma', absences: 5, late: 7, missing: 3 },
  { name: 'Priya Patel', absences: 4, late: 5, missing: 6 },
  { name: 'Amit Verma', absences: 3, late: 9, missing: 2 },
  { name: 'Sneha Gupta', absences: 3, late: 4, missing: 5 },
  { name: 'Rajesh Kumar', absences: 2, late: 8, missing: 4 },
  { name: 'Kavita Singh', absences: 2, late: 6, missing: 7 },
  { name: 'Deepak Yadav', absences: 1, late: 10, missing: 1 },
];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// -----------------------------------------------------------------------

const AttendanceTopDefaulters = () => {
  const theme = useTheme();
  const router = useRouter();
  const [filter, setFilter] = useState<DefaulterType>('absences');

  const META: Record<
    DefaulterType,
    { label: string; color: string; icon: string; unit: string; description: string }
  > = {
    absences: {
      label: 'Absences',
      color: theme.palette.error.main,
      icon: 'solar:calendar-remove-bold-duotone',
      unit: 'days absent',
      description: 'Days absent this month',
    },
    late: {
      label: 'Late Marks',
      color: theme.palette.warning.main,
      icon: 'solar:clock-circle-bold-duotone',
      unit: 'late arrivals',
      description: 'Late arrivals this month',
    },
    missing: {
      label: 'Missing Punches',
      color: theme.palette.text.secondary,
      icon: 'solar:danger-bold-duotone',
      unit: 'missing punches',
      description: 'Missing punch-in/out records this month',
    },
  };

  const meta = META[filter];

  const sorted = [...DEFAULTERS].sort((a, b) => b[filter] - a[filter]).slice(0, 7);

  const categories = sorted.map((d) => d.name);
  const values = sorted.map((d) => d[filter]);
  const maxVal = Math.max(...values);

  const chartOptions = useChart({
    chart: { toolbar: { show: false } },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '52%',
        borderRadius: 5,
        distributed: true,
        dataLabels: { position: 'right' },
      },
    },
    colors: sorted.map((d, i) => {
      const intensity = maxVal > 0 ? d[filter] / maxVal : 0;
      return alpha(meta.color, 0.35 + intensity * 0.65);
    }),
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      offsetX: 6,
      style: {
        fontSize: '12px',
        fontWeight: 700,
        colors: [theme.palette.text.primary],
      },
      formatter: (val: number) => `${val} ${meta.unit}`,
    },
    stroke: { show: false },
    legend: { show: false },
    xaxis: {
      categories,
      labels: {
        formatter: (v: string | number) => `${v}`,
        style: { fontSize: '11px', colors: theme.palette.text.secondary },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
          fontWeight: 500,
          colors: theme.palette.text.primary,
        },
      },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} ${meta.unit}`,
        title: { formatter: (name: string) => name },
      },
    },
  });

  const topOffender = sorted[0];

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="show" style={{ height: '100%' }}>
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: 'none',
          border: `1px solid ${theme.palette.divider}`,
          height: '100%',
        }}
      >
        <CardHeader
          title={
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6">Top Attendance Defaulters</Typography>
              <CustomTooltip
                title="Staff with the most absences, late marks, or missing punches this month. Use this to identify at-risk staff for HR action."
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
          action={
            <Button
              size="small"
              endIcon={<Iconify icon="solar:arrow-right-linear" width={16} />}
              onClick={() => router.push('/hr/manual-attendance')}
            >
              View More
            </Button>
          }
          subheader={
            <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
              <Chip
                size="small"
                icon={<Iconify icon="solar:danger-triangle-bold-duotone" width={14} />}
                label={`Worst: ${topOffender?.name ?? '—'} · ${topOffender?.[filter] ?? 0} ${meta.label}`}
                sx={{
                  bgcolor: alpha(meta.color, 0.12),
                  color: meta.color,
                  fontWeight: 600,
                  fontSize: 11,
                  '& .MuiChip-icon': { color: meta.color },
                }}
              />
            </Stack>
          }
          sx={{ p: 2, pb: 0 }}
        />

        {/* Legend row */}
        <Stack direction="row" spacing={2} sx={{ px: 2, pt: 1.5, pb: 0 }}>
          {(Object.keys(META) as DefaulterType[]).map((key) => (
            <Stack key={key} direction="row" alignItems="center" spacing={0.5}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: META[key].color,
                  opacity: filter === key ? 1 : 0.3,
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: filter === key ? META[key].color : theme.palette.text.disabled,
                  fontWeight: filter === key ? 700 : 400,
                }}
              >
                {META[key].label}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Box sx={{ px: 1, pb: 2, pt: 1 }}>
          <Chart
            type="bar"
            series={[{ name: meta.label, data: values }]}
            options={chartOptions}
            height={320}
          />
        </Box>
      </Card>
    </motion.div>
  );
};

export default AttendanceTopDefaulters;
