'use client';

import type { CardProps } from '@mui/material';
import type { ColorType } from 'src/theme/core';
import type { ChartOptions } from 'src/components/chart';

import React from 'react';

import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { Box, Card, Button, useTheme, CardHeader, CardContent } from '@mui/material';

import { fPercent, fShortenNumber } from 'src/utils/format-number';

import { CONFIG } from 'src/config-global';
import { varAlpha, bgGradient } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';
import { Chart, useChart } from 'src/components/chart';

const PayrollDashboardScreen = () => (
  <Grid2 container spacing={2}>
    <Grid2 xs={12} md={6} lg={3}>
      <AnalyticsWidgetSummary
        title="Total Employee"
        percent={2.6}
        total={714000}
        icon={
          <img alt="icon" src={`${CONFIG.site.basePath}/assets/icons/glass/ic-glass-bag.svg`} />
        }
        chart={{
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
          series: [22, 8, 35, 50, 82, 84, 77, 12],
        }}
      />
    </Grid2>
    <Grid2 xs={12} md={6} lg={3}>
      <AnalyticsWidgetSummary
        title="Total Male Employee"
        percent={2.6}
        total={714000}
        color="warning"
        icon={
          <img alt="icon" src={`${CONFIG.site.basePath}/assets/icons/glass/ic-glass-bag.svg`} />
        }
        chart={{
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
          series: [22, 8, 35, 50, 82, 84, 77, 12],
        }}
      />
    </Grid2>
    <Grid2 xs={12} md={6} lg={3}>
      <AnalyticsWidgetSummary
        title="Total Female Employee"
        percent={2.6}
        total={714000}
        color="error"
        icon={
          <img alt="icon" src={`${CONFIG.site.basePath}/assets/icons/glass/ic-glass-bag.svg`} />
        }
        chart={{
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
          series: [22, 8, 35, 50, 82, 84, 77, 12],
        }}
      />
    </Grid2>
    <Grid2 xs={12} md={6} lg={3}>
      <Card
        sx={{
          display: 'flex',
          p: 3,
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ typography: 'subtitle2' }}>Quick Actions</Box>
          <Box display="flex" gap={2} flexWrap="wrap" pt={2}>
            <Button variant="contained" color="primary" sx={{ flexGrow: 1 }}>
              Run Payroll
            </Button>
            <Button variant="contained" color="warning" sx={{ flexGrow: 1 }}>
              Generate Payslip
            </Button>
            <Button variant="contained" color="error" sx={{ flexGrow: 1 }}>
              View Report
            </Button>
          </Box>
        </Box>
      </Card>
    </Grid2>
    <Grid2 xs={12} md={6} lg={4}>
      <Card>
        <CardHeader title="Monthly Payroll" />
        <CardContent>Content</CardContent>
      </Card>
    </Grid2>
    <Grid2 xs={12} md={6} lg={4}>
      <Card>
        <CardHeader title="Payroll Overview" />
        <CardContent>Content</CardContent>
      </Card>
    </Grid2>
    <Grid2 xs={12} md={6} lg={4}>
      <Card>
        <CardHeader title="Deductions & Adjustments" />
        <CardContent>Content</CardContent>
      </Card>
    </Grid2>
  </Grid2>
);

export default PayrollDashboardScreen;

type Props = CardProps & {
  title: string;
  total: number;
  percent?: number;
  color?: ColorType;
  icon: React.ReactNode;
  chart: {
    series: number[];
    categories: string[];
    options?: ChartOptions;
  };
};
function AnalyticsWidgetSummary({
  icon,
  title,
  total,
  chart,
  percent,
  color = 'success',
  sx,
  ...other
}: Props) {
  const theme: any = useTheme();

  const chartColors = [theme.palette[color].dark];

  const chartOptions: any = useChart({
    chart: { sparkline: { enabled: true } },
    colors: chartColors,
    xaxis: { categories: chart.categories },
    grid: {
      padding: {
        top: 6,
        left: 6,
        right: 6,
        bottom: 6,
      },
    },
    tooltip: {
      // y: { formatter: (value) => value, title: { formatter: () => '' } },
    },
    ...chart.options,
  });

  const renderTrending = (
    <Box
      sx={{
        top: 16,
        gap: 0.5,
        right: 16,
        display: 'flex',
        position: 'absolute',
        alignItems: 'center',
      }}
    >
      {percent && (
        <Iconify
          width={20}
          icon={percent < 0 ? 'eva:trending-down-fill' : 'eva:trending-up-fill'}
        />
      )}
      {percent && (
        <Box component="span" sx={{ typography: 'subtitle2' }}>
          {percent > 0 && '+'}
          {fPercent(percent)}
        </Box>
      )}
    </Box>
  );

  return (
    <Card
      sx={{
        ...bgGradient({
          color: `135deg, ${varAlpha(theme.vars.palette[color].lighterChannel, 0.48)}, ${varAlpha(theme.vars.palette[color].lightChannel, 0.48)}`,
        }),
        p: 3,
        boxShadow: 'none',
        position: 'relative',
        color: `${color}.darker`,
        backgroundColor: 'common.white',
        ...sx,
      }}
      {...other}
    >
      <Box sx={{ width: 48, height: 48, mb: 3 }}>{icon}</Box>

      {renderTrending}

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
        }}
      >
        <Box sx={{ flexGrow: 1, minWidth: 112 }}>
          <Box sx={{ mb: 1, typography: 'subtitle2' }}>{title}</Box>
          <Box sx={{ typography: 'h4' }}>{fShortenNumber(total)}</Box>
        </Box>

        <Chart
          type="line"
          series={[{ data: chart.series }]}
          options={chartOptions}
          width={84}
          height={56}
        />
      </Box>

      <SvgColor
        src={`${CONFIG.site.basePath}/assets/background/shape-square.svg`}
        sx={{
          top: 0,
          left: -20,
          width: 240,
          zIndex: -1,
          height: 240,
          opacity: 0.24,
          position: 'absolute',
          color: `${color}.main`,
        }}
      />
    </Card>
  );
}
