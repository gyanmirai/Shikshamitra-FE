'use client';

import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Chart, useChart, ChartLegends } from 'src/components/chart';
import { Box, Card, Grid, CardHeader, Typography } from '@mui/material';

const MONTHLY_DATA = {
  labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
  collected: [82000, 95000, 88000, 102000, 97000, 110000],
  pending: [28000, 18000, 22000, 14000, 17000, 14500],
};

const ROUTE_FEE_DATA = {
  routes: ['R-01', 'R-02', 'R-03', 'R-04', 'R-05', 'R-06', 'R-07', 'R-08'],
  collected: [44000, 38000, 48000, 32000, 30000, 52000, 36000, 28000],
  pending: [4000, 2000, 6000, 8000, 5000, 3000, 10000, 7000],
};

const TransportFeeAnalytics = () => {
  const theme = useTheme();

  const totalCollected = 110000;
  const totalPending = 14500;
  const collectionRate = Math.round((totalCollected / (totalCollected + totalPending)) * 100);
  const prevMonthCollected = 97000;
  const monthChange = Math.round(
    ((totalCollected - prevMonthCollected) / prevMonthCollected) * 100
  );

  // Donut chart: Paid vs Unpaid
  const donutSeries = [totalCollected, totalPending];
  const donutOptions = useChart({
    labels: ['Collected', 'Pending'],
    colors: ['#00AB55', '#FF4842'],
    stroke: { colors: [theme.palette.background.paper] },
    legend: { floating: false, horizontalAlign: 'center', position: 'bottom' },
    dataLabels: { enabled: true, dropShadow: { enabled: false } },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (val: number) => `₹${(val / 1000).toFixed(0)}K`,
        title: { formatter: (name: string) => name },
      },
    },
    plotOptions: { pie: { donut: { labels: { show: false } } } },
  });

  // Monthly trend bar chart
  const monthlyOptions = useChart({
    chart: { stacked: false },
    xaxis: { categories: MONTHLY_DATA.labels },
    colors: ['#00AB55', '#FF4842'],
    stroke: { show: true, width: [0, 2], curve: 'smooth' },
    tooltip: {
      y: { formatter: (val: number) => `₹${(val / 1000).toFixed(0)}K` },
    },
    yaxis: {
      labels: { formatter: (val: number) => `₹${(val / 1000).toFixed(0)}K` },
    },
  });

  const monthlySeries = [
    { name: 'Collected', type: 'bar', data: MONTHLY_DATA.collected },
    { name: 'Pending', type: 'line', data: MONTHLY_DATA.pending },
  ];

  // Route-wise bar chart
  const routeFeeOptions = useChart({
    chart: { stacked: true },
    xaxis: { categories: ROUTE_FEE_DATA.routes },
    colors: ['#00AB55', '#FF4842'],
    tooltip: {
      y: { formatter: (val: number) => `₹${(val / 1000).toFixed(0)}K` },
    },
    yaxis: {
      labels: { formatter: (val: number) => `₹${(val / 1000).toFixed(0)}K` },
    },
  });

  const routeFeeSeries = [
    { name: 'Collected', data: ROUTE_FEE_DATA.collected },
    { name: 'Pending', data: ROUTE_FEE_DATA.pending },
  ];

  return (
    <Box>
      <Card sx={{ p: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Transport Fee Analytics
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Financial visibility — fee collection, pending dues, and route-wise breakdown
        </Typography>

        {/* KPI Row */}
        <Grid container spacing={1.5} sx={{ mb: 1 }}>
          {[
            {
              label: 'Total Collected (Feb)',
              value: '₹1,10,000',
              icon: 'mdi:currency-inr',
              color: '#00AB55',
              bg: '#C8FAD6',
              sub: `↑ ${monthChange}% vs last month`,
              subColor: '#007B55',
            },
            {
              label: 'Pending Fees',
              value: '₹14,500',
              icon: 'mdi:clock-alert-outline',
              color: '#FF4842',
              bg: '#FFE9D0',
              sub: '14 students overdue',
              subColor: '#B71D18',
            },
            {
              label: 'Collection Rate',
              value: `${collectionRate}%`,
              icon: 'mdi:percent',
              color: collectionRate >= 85 ? '#00AB55' : '#FFC107',
              bg: collectionRate >= 85 ? '#C8FAD6' : '#FFF8E1',
              sub: collectionRate >= 85 ? 'Above target (85%)' : 'Below target (85%)',
              subColor: collectionRate >= 85 ? '#007B55' : '#B76E00',
            },
          ].map((item) => (
            <Grid key={item.label} size={{ xs: 12, sm: 4 }}>
              <Card
                sx={{
                  p: 1.5,
                  border: `1px solid ${theme.palette.divider}`,
                  borderLeft: `4px solid ${item.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Iconify icon={item.icon} width={26} sx={{ color: item.color }} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    {item.label}
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}
                  >
                    {item.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: item.subColor, fontWeight: 600 }}>
                    {item.sub}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Charts Row */}
        <Grid container spacing={1}>
          {/* Donut: Paid vs Unpaid */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{ height: '100%', border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}
            >
              <CardHeader title="Collection Breakdown" subheader="Paid vs Pending (Feb 2026)" />
              <Box sx={{ mx: 2 }} dir="ltr">
                <Chart type="donut" series={donutSeries} options={donutOptions} height={240} />
                <ChartLegends
                  labels={donutOptions?.labels}
                  colors={donutOptions?.colors}
                  sx={{ pb: 2, justifyContent: 'center' }}
                />
              </Box>
            </Card>
          </Grid>

          {/* Monthly Trend */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card
              sx={{ height: '100%', border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}
            >
              <CardHeader
                title="Monthly Fee Collection Trend"
                subheader="Last 6 months — Collected vs Pending"
                action={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pr: 1 }}>
                    <Iconify icon="mdi:trending-up" width={16} sx={{ color: 'success.main' }} />
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 700 }}>
                      +{monthChange}% this month
                    </Typography>
                  </Box>
                }
              />
              <Box sx={{ px: 2, pb: 2 }} dir="ltr">
                <Chart type="line" series={monthlySeries} options={monthlyOptions} height={240} />
              </Box>
            </Card>
          </Grid>

          {/* Route-wise Breakdown */}
          <Grid size={{ xs: 12 }}>
            <Card sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <CardHeader
                title="Route-wise Fee Breakdown"
                subheader="Collected vs Pending fees per route"
              />
              <Box sx={{ px: 2, pb: 2 }} dir="ltr">
                <Chart type="bar" series={routeFeeSeries} options={routeFeeOptions} height={240} />
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default TransportFeeAnalytics;
