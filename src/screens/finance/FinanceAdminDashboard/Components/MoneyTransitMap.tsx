'use client';

import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { formatNumber } from 'src/utils/formate_number';
import { Iconify } from 'src/components/iconify';
import { Chart, useChart, ChartLegends } from 'src/components/chart';
import { Box, Card, Grid, Stack, CardHeader, Typography, CardContent } from '@mui/material';

import {
  financeQueuePreview,
  financePaymentMethods,
  type DailyFinancePreview,
} from '../finance-admin-dashboard-preview-data';
import { financeDashboardCardSx, financeDashboardTileSx } from './finance-dashboard-card-styles';

type ActivitySummary = {
  received: number;
  confirmedIncome: number;
  expenses: number;
  transactions: number;
  methods: Record<string, number>;
  days: DailyFinancePreview[];
};

type Props = {
  activity: ActivitySummary;
  rangeLabel: string;
};

export default function MoneyTransitMap({ activity, rangeLabel }: Props) {
  const theme = useTheme();
  const confirmedNet = activity.confirmedIncome - activity.expenses;
  const awaitingConfirmation =
    financeQueuePreview.cashAwaitingDeposit + financeQueuePreview.nonCashAwaitingVerification;
  const stages = [
    {
      label: 'Fees received',
      icon: 'mdi:cash-multiple',
      value: formatNumber(activity.received, 'INR'),
      detail: `${activity.transactions.toLocaleString('en-IN')} receipts`,
    },
    {
      label: 'Pending confirmation',
      icon: 'mdi:clock-outline',
      value: formatNumber(awaitingConfirmation, 'INR'),
      detail: `Year total · Cash ${formatNumber(
        financeQueuePreview.cashAwaitingDeposit,
        'INR'
      )} · Other ${formatNumber(financeQueuePreview.nonCashAwaitingVerification, 'INR')}`,
    },
    {
      label: 'Income confirmed',
      icon: 'mdi:check-circle-outline',
      value: formatNumber(activity.confirmedIncome, 'INR'),
      detail: 'Selected dates',
    },
    {
      label: 'Expenses',
      icon: 'mdi:receipt-text-outline',
      value: formatNumber(activity.expenses, 'INR'),
      detail: 'Selected dates',
    },
    {
      label: 'Net movement',
      icon: 'mdi:swap-horizontal',
      value: formatNumber(confirmedNet, 'INR'),
      detail: 'Confirmed income less expenses',
    },
  ];
  const channelRows = financePaymentMethods.map((method) => ({
    ...method,
    amount: activity.methods[method.id] ?? 0,
  }));
  const methodSeries = [
    { name: 'Fees received', data: channelRows.map((method) => method.amount) },
  ];
  const chart = useMemo(
    () => ({
      labels: activity.days.map((day) =>
        new Date(`${day.date}T12:00:00`).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
        })
      ),
      series: [
        { name: 'Fees received', data: activity.days.map((day) => day.received) },
        { name: 'Income confirmed', data: activity.days.map((day) => day.confirmedIncome) },
      ],
    }),
    [activity.days]
  );
  const chartOptions = useChart({
    colors: [theme.palette.info.main, theme.palette.secondary.main],
    chart: { toolbar: { show: false }, zoom: { enabled: false } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    markers: { size: 4 },
    xaxis: { categories: chart.labels },
    yaxis: {
      title: { text: 'Amount (₹)' },
      labels: { formatter: (value: number) => formatNumber(value, 'INR') },
    },
    tooltip: { y: { formatter: (value: number) => formatNumber(value, 'INR') } },
    legend: { show: false },
  });
  const methodsChartOptions = useChart({
    colors: [theme.palette.info.main],
    chart: { toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '48%' } },
    dataLabels: { enabled: false },
    xaxis: { categories: channelRows.map((method) => method.label) },
    yaxis: {
      title: { text: 'Amount (₹)' },
      labels: { formatter: (value: number) => formatNumber(value, 'INR') },
    },
    tooltip: { y: { formatter: (value: number) => formatNumber(value, 'INR') } },
    legend: { show: false },
    grid: { padding: { right: 12 } },
  });

  return (
    <Box component="section" aria-label="Collections and cash flow">
      <Stack spacing={2}>
        <Card sx={financeDashboardCardSx}>
          <CardHeader
            title={
              <Typography id="payment-flow-title" variant="h6">
                Payment Flow
              </Typography>
            }
            subheader={`Collections, confirmation and expenses · ${rangeLabel}`}
            sx={{ p: 0, mb: 2 }}
          />
          <CardContent sx={{ p: '0 !important' }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(5, minmax(0, 1fr))',
                },
                gap: 1.5,
              }}
            >
              {stages.map((stage, index) => (
                <Box
                  key={stage.label}
                  sx={{
                    ...financeDashboardTileSx,
                    display: 'flex',
                    flexDirection: 'column',
                    gridColumn: index === stages.length - 1 ? { sm: 'span 2', md: 'auto' } : 'auto',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon={stage.icon} width={18} sx={{ color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                      {stage.label}
                    </Typography>
                  </Stack>
                  <Typography
                    component="p"
                    variant="h5"
                    sx={{ mt: 1.25, fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere' }}
                  >
                    {stage.value}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 'auto', pt: 1 }}
                  >
                    {stage.detail}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              Pending confirmation is separate from confirmed income. Net movement is a register
              difference, not a bank balance.
            </Typography>
          </CardContent>
        </Card>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 5 }}>
            <Card sx={financeDashboardCardSx}>
              <CardHeader
                title={<Typography variant="h6">Payment Methods</Typography>}
                subheader="Fees received by method"
                sx={{ p: 0, mb: 1.5 }}
              />
              <CardContent sx={{ p: '0 !important', minWidth: 0 }}>
                {activity.received ? (
                  <Chart
                    type="bar"
                    series={methodSeries}
                    options={methodsChartOptions}
                    height={310}
                  />
                ) : (
                  <Box role="status" sx={{ minHeight: 310, display: 'grid', placeItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No fees received for these dates.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, lg: 7 }}>
            <Card sx={financeDashboardCardSx}>
              <CardHeader
                title={<Typography variant="h6">Daily Collections</Typography>}
                subheader={`Fees received and income confirmed · ${rangeLabel}`}
                sx={{ p: 0, mb: 1.5 }}
              />
              <CardContent sx={{ p: '0 !important', minWidth: 0 }}>
                {activity.days.length ? (
                  <>
                    <Chart type="line" series={chart.series} options={chartOptions} height={310} />
                    <ChartLegends
                      labels={['Fees received', 'Income confirmed']}
                      colors={[theme.palette.info.main, theme.palette.secondary.main]}
                      sx={{ justifyContent: 'center', mt: 1 }}
                    />
                  </>
                ) : (
                  <Box
                    role="status"
                    sx={{
                      minHeight: 310,
                      display: 'grid',
                      placeItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No collections for these dates.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}
