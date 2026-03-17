'use client';

import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
import CustomTooltip from 'src/components/custom-tooltip';
import {
  Box,
  Card,
  Stack,
  Button,
  Divider,
  CardHeader,
  Typography,
  IconButton,
} from '@mui/material';

// -----------------------------------------------------------------------

const PAYROLL_STATS = [
  {
    label: 'Paid',
    amount: '₹ 8,40,000',
    employees: 12,
    color: 'success' as const,
    icon: 'mdi:check-circle-outline',
  },
  {
    label: 'Pending',
    amount: '₹ 3,20,000',
    employees: 4,
    color: 'warning' as const,
    icon: 'mdi:clock-outline',
  },
  {
    label: 'On Hold',
    amount: '₹ 85,000',
    employees: 2,
    color: 'error' as const,
    icon: 'mdi:pause-circle-outline',
  },
];

const HRPayrollSummary = () => {
  const theme = useTheme();

  const series = [{ data: [12, 4, 2] }];
  const categories = ['Paid', 'Pending', 'On Hold'];

  const chartOptions = useChart({
    colors: [theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main],
    stroke: { width: 0 },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '40%',
        borderRadius: 4,
        distributed: true,
      },
    },
    xaxis: { categories },
    legend: { show: false },
    tooltip: {
      y: {
        formatter: (value: number) => `${value} Employees`,
        title: { formatter: () => '' },
      },
    },
  });

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="h6">Payroll Summary</Typography>
            <CustomTooltip
              title="Overview of payroll status - paid, pending, and on hold"
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
        sx={{ px: 2, py: 1 }}
      />

      {/* Amount summary rows */}
      <Stack spacing={1} sx={{ px: 2, pt: 1, pb: 0.5 }}>
        {PAYROLL_STATS.map((stat) => (
          <Stack
            key={stat.label}
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: (t) => varAlpha(t.vars.palette[stat.color].mainChannel, 0.08),
              border: (t) => `1px solid ${varAlpha(t.vars.palette[stat.color].mainChannel, 0.16)}`,
            }}
          >
            <Iconify
              icon={stat.icon}
              width={20}
              sx={{ color: `${stat.color}.main`, flexShrink: 0 }}
            />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {stat.label}
              </Typography>
              <Typography variant="subtitle2" fontWeight={600}>
                {stat.amount}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {stat.employees} employees
            </Typography>
          </Stack>
        ))}
      </Stack>

      <Divider sx={{ mx: 3, my: 1.5, borderStyle: 'dashed' }} />

      {/* Chart */}
      <Box sx={{ mx: 3 }} dir="ltr">
        <Chart type="bar" series={series} options={chartOptions} height={180} />
      </Box>

      {/* Action */}
      <Box sx={{ px: 3, pb: 2.5, mt: 'auto' }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          startIcon={<Iconify icon="mdi:cash-check" />}
          sx={{ fontWeight: 600 }}
        >
          Process Payroll
        </Button>
      </Box>
    </Card>
  );
};

export default HRPayrollSummary;
