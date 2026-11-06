'use client';

import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { formatNumber } from 'src/utils/formate_number';
import { Chart, useChart, ChartLegends } from 'src/components/chart';
import {
  Box,
  Card,
  Grid,
  Stack,
  CardHeader,
  Typography,
  CardContent,
  LinearProgress,
} from '@mui/material';

import {
  financeQueuePreview,
  financePaymentMethods,
  type DailyFinancePreview,
} from '../finance-admin-dashboard-preview-data';

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
      value: formatNumber(activity.received, 'INR'),
      detail: `${activity.transactions.toLocaleString('en-IN')} receipts`,
    },
    {
      label: 'Pending confirmation',
      value: formatNumber(awaitingConfirmation, 'INR'),
      detail: `Year total · Cash ${formatNumber(
        financeQueuePreview.cashAwaitingDeposit,
        'INR'
      )} · Other ${formatNumber(financeQueuePreview.nonCashAwaitingVerification, 'INR')}`,
    },
    {
      label: 'Income confirmed',
      value: formatNumber(activity.confirmedIncome, 'INR'),
      detail: 'Selected dates',
    },
    {
      label: 'Expenses',
      value: formatNumber(activity.expenses, 'INR'),
      detail: 'Selected dates',
    },
    {
      label: 'Net movement',
      value: formatNumber(confirmedNet, 'INR'),
      detail: 'Confirmed income less expenses',
    },
  ];
  const channelRows = financePaymentMethods.map((method) => ({
    ...method,
    amount: activity.methods[method.id] ?? 0,
  }));
  const largestMethod = Math.max(...channelRows.map((method) => method.amount), 1);
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
    stroke: { curve: 'smooth', width: 2 },
    markers: { size: 3 },
    xaxis: { categories: chart.labels },
    yaxis: {
      title: { text: 'Amount (₹)' },
      labels: { formatter: (value: number) => formatNumber(value, 'INR') },
    },
    tooltip: { y: { formatter: (value: number) => formatNumber(value, 'INR') } },
    legend: { show: false },
  });

  return (
    <Box component="section" aria-label="Collections and cash flow">
      <Stack spacing={2}>
        <Card variant="outlined" sx={{ boxShadow: 'none' }}>
          <CardHeader
            title={
              <Typography id="payment-flow-title" variant="h6">
                Payment Flow
              </Typography>
            }
            subheader={`Fees received, confirmed income and expenses · ${rangeLabel}`}
          />
          <CardContent sx={{ pt: 0 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  lg: 'repeat(5, minmax(0, 1fr))',
                },
                gap: { xs: 2, lg: 0 },
              }}
            >
              {stages.map((stage, index) => (
                <Box
                  key={stage.label}
                  sx={{
                    minWidth: 0,
                    px: { xs: 0, lg: 2 },
                    borderLeft: { lg: index ? '1px solid' : 0 },
                    borderColor: 'divider',
                    '&:first-of-type': { pl: 0 },
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {stage.label}
                  </Typography>
                  <Typography
                    component="p"
                    variant="h5"
                    sx={{ mt: 0.5, fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere' }}
                  >
                    {stage.value}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.5 }}
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
            <Card variant="outlined" sx={{ height: '100%', boxShadow: 'none' }}>
              <CardHeader
                title={<Typography variant="h6">Payment Methods</Typography>}
                subheader="Fees received by payment method"
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={2}>
                  {channelRows.map((method) => (
                    <Box key={method.id}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        spacing={1}
                        sx={{ mb: 0.75 }}
                      >
                        <Typography variant="body2">{method.label}</Typography>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                          {formatNumber(method.amount, 'INR')}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        aria-label={`${method.label} share of fees received`}
                        variant="determinate"
                        value={(method.amount / largestMethod) * 100}
                        sx={{
                          height: 6,
                          borderRadius: 1,
                          bgcolor: 'action.hover',
                          '& .MuiLinearProgress-bar': { bgcolor: 'info.main' },
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, lg: 7 }}>
            <Card variant="outlined" sx={{ height: '100%', boxShadow: 'none' }}>
              <CardHeader
                title={<Typography variant="h6">Daily Collections</Typography>}
                subheader="Fees received and income confirmed"
              />
              <CardContent sx={{ pt: 0, minWidth: 0 }}>
                {activity.days.length ? (
                  <>
                    <Chart type="line" series={chart.series} options={chartOptions} height={270} />
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
                      minHeight: 270,
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
