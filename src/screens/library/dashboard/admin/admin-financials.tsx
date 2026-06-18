import type { LibraryDashboardOverview } from 'src/redux/library/library-adapters';

import React from 'react';
import { Iconify } from 'src/components/iconify';
import { fCurrency } from 'src/utils/format-number';
import { Chart, useChart } from 'src/components/chart';
import { alpha, useTheme } from '@mui/material/styles';
import CustomTooltip from 'src/components/custom-tooltip';
import { linearProgressClasses } from '@mui/material/LinearProgress';
import { Box, Card, Grid, Stack, Typography, IconButton, LinearProgress } from '@mui/material';

const AdminFinancials = ({ overview }: { overview?: LibraryDashboardOverview }) => {
  const theme = useTheme();

  const totalCollected = overview?.charges.paidAmount || 0;
  const pendingAmount = overview?.charges.pendingAmount || 0;
  const waivedFines = overview?.charges.waivedAmount || 0;
  const totalFines = totalCollected + pendingAmount + waivedFines;
  const collectionRate = totalFines ? (totalCollected / totalFines) * 100 : 0;
  const revenueSeries = [
    Math.round(totalCollected * 0.2),
    Math.round(totalCollected * 0.35),
    Math.round(totalCollected * 0.65),
    Math.round(totalCollected),
  ];

  const kpiCards = [
    {
      label: 'Total Library Charges',
      value: totalFines,
      trend: Math.round(collectionRate),
      isPositive: true,
      color: 'primary',
    },
    {
      label: 'Total Collected',
      value: totalCollected,
      trend: Math.round(collectionRate),
      isPositive: true,
      color: 'success',
      subtitle: `${Math.round(collectionRate)}% collected`,
    },
    {
      label: 'Pending Amount',
      value: pendingAmount,
      trend: overview?.charges.pendingCount || 0,
      isPositive: false,
      color: 'error',
      subtitle: `${overview?.charges.pendingCount || 0} pending charges`,
    },
    {
      label: 'Waived Fines',
      value: waivedFines,
      trend: 0,
      isPositive: true,
      color: 'text.disabled',
      subtitle: `${overview?.charges.waivedCount || 0} waived charges`,
    },
  ];

  const chartOptions = useChart({
    colors: [theme.palette.success.main],
    chart: {
      sparkline: { enabled: false },
      toolbar: { show: false },
    },
    stroke: { width: 3, curve: 'smooth' },
    xaxis: {
      categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '11px',
        },
      },
    },
    yaxis: {
      show: true,
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '11px',
        },
        formatter: (value: number) => fCurrency(value),
      },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    tooltip: {
      x: { show: true },
      y: {
        formatter: (value: number) => fCurrency(value),
        title: { formatter: () => 'Collected: ' },
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.3,
        opacityFrom: 0.4,
        opacityTo: 0.1,
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
      }}
    >
      <Box
        sx={{
          p: 1.5,
          pb: 1,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              Fine & Revenue Summary
            </Typography>
            <CustomTooltip
              title="Overview of Library charges collected, pending, and waived"
              placement="top"
            >
              <IconButton size="small" sx={{ mb: 0.5 }}>
                <Iconify
                  icon="solar:info-circle-linear"
                  width={18}
                  sx={{ color: 'text.disabled' }}
                />
              </IconButton>
            </CustomTooltip>
          </Stack>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Current academic-year Library charge performance
          </Typography>
        </Box>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Iconify
            icon="eva:trending-up-fill"
            sx={{ color: 'success.main', width: 18, height: 18 }}
          />
          <Typography variant="subtitle2" sx={{ color: 'success.main' }}>
            {Math.round(collectionRate)}%
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            collected
          </Typography>
        </Stack>
      </Box>

      <Box sx={{ px: 1, pb: 1 }}>
        <Grid container spacing={1} sx={{ mb: 2 }}>
          {kpiCards.map((kpi, index) => (
            <Grid size={{ xs: 6, sm: 3 }} key={index}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: 'background.paper',
                  height: '100%',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    display: 'block',
                    mb: 0.5,
                    fontWeight: 600,
                  }}
                >
                  {kpi.label}
                </Typography>
                <Stack direction="row" alignItems="baseline" spacing={0.5} sx={{ mb: 0.5 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color:
                        kpi.color === 'success' || kpi.color === 'error'
                          ? `${kpi.color}.main`
                          : 'text.primary',
                    }}
                  >
                    {fCurrency(kpi.value)}
                  </Typography>
                  {kpi.trend !== 0 && (
                    <Stack direction="row" alignItems="center" spacing={0.25}>
                      <Iconify
                        icon={kpi.isPositive ? 'eva:arrow-up-fill' : 'eva:arrow-down-fill'}
                        sx={{
                          color: kpi.isPositive ? 'success.main' : 'error.main',
                          width: 14,
                          height: 14,
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: kpi.isPositive ? 'success.main' : 'error.main',
                          fontWeight: 600,
                        }}
                      >
                        {Math.abs(kpi.trend)}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
                {kpi.subtitle && (
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    {kpi.subtitle}
                  </Typography>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mb: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Collection Progress
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {fCurrency(totalCollected)} of {fCurrency(totalFines)} | {Math.round(collectionRate)}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={collectionRate}
            sx={{
              height: 8,
              borderRadius: 1,
              [`&.${linearProgressClasses.colorPrimary}`]: {
                bgcolor: alpha(theme.palette.success.main, 0.12),
              },
              [`& .${linearProgressClasses.bar}`]: {
                borderRadius: 1,
                bgcolor:
                  collectionRate >= 50
                    ? 'success.main'
                    : collectionRate >= 30
                      ? 'warning.main'
                      : 'error.main',
              },
            }}
          />
        </Box>

        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.grey[500], 0.04),
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1.5 }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Collection Trend
            </Typography>
          </Stack>
          <Chart
            type="area"
            series={[{ name: 'Collected', data: revenueSeries }]}
            options={chartOptions}
            height={180}
          />
        </Box>
      </Box>
    </Card>
  );
};

export default AdminFinancials;
