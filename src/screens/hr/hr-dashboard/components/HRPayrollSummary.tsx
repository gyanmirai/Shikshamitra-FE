'use client';

import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Stack, Button, CardHeader, Typography, IconButton } from '@mui/material';

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
          <Stack direction="row" alignItems="center" spacing={1}>
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
        sx={{ p: 2 }}
      />
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
