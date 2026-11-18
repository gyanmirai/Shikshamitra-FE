'use client';

import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { formatNumber } from 'src/utils/formate_number';
import { DashboardCard } from 'src/components/dashboard-card/dashboard-card';
import { FormSectionCard } from 'src/components/form-section-card';
import { Chart, useChart, ChartLegends } from 'src/components/chart';
import { Box, Grid, Stack, Typography } from '@mui/material';

import {
  financeQueuePreview,
  financePaymentMethods,
  type DailyFinancePreview,
} from '../finance-admin-dashboard-preview-data';
import { financeDashboardCardSx } from './finance-dashboard-card-styles';

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
      label: 'Fees Received',
      icon: 'mdi:cash-multiple',
      value: formatNumber(activity.received, 'INR'),
      detail: 'Fee payments received within the selected activity dates.',
    },
    {
      label: 'Pending Confirmation',
      icon: 'mdi:clock-outline',
      value: formatNumber(awaitingConfirmation, 'INR'),
      detail: `Awaiting confirmation for the selected academic year. Cash ${formatNumber(
        financeQueuePreview.cashAwaitingDeposit,
        'INR'
      )} · Other ${formatNumber(financeQueuePreview.nonCashAwaitingVerification, 'INR')}`,
    },
    {
      label: 'Confirmed Income',
      icon: 'mdi:check-circle-outline',
      value: formatNumber(activity.confirmedIncome, 'INR'),
      detail: 'Confirmed income within the selected activity dates.',
    },
    {
      label: 'Expenses',
      icon: 'mdi:receipt-text-outline',
      value: formatNumber(activity.expenses, 'INR'),
      detail: 'Recorded expenses within the selected activity dates.',
    },
    {
      label: 'Net Movement',
      icon: 'mdi:swap-horizontal',
      value: formatNumber(confirmedNet, 'INR'),
      detail:
        'Confirmed income less recorded expenses for the selected activity dates. This is a register difference, not a bank balance.',
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
        <FormSectionCard
          title="Payment Flow"
          descriptionTooltip="Collections, pending confirmation, confirmed income and recorded expenses. Pending confirmation is separate from confirmed income and covers the selected academic year."
          sx={financeDashboardCardSx}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                xl: 'repeat(5, minmax(0, 1fr))',
              },
              gap: 2,
            }}
          >
            {stages.map((stage) => (
              <DashboardCard
                key={stage.label}
                title={stage.label}
                value={stage.value}
                icon={stage.icon}
                titleInfo={stage.detail}
                density="compact"
              />
            ))}
          </Box>
        </FormSectionCard>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 5 }}>
            <FormSectionCard
              title="Payment Methods"
              descriptionTooltip="Fee payments received by method within the selected activity dates."
              sx={financeDashboardCardSx}
            >
              <Box sx={{ minWidth: 0 }}>
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
              </Box>
            </FormSectionCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 7 }}>
            <FormSectionCard
              title="Daily Collections"
              descriptionTooltip={`Fee payments received and income confirmed for ${rangeLabel}.`}
              sx={financeDashboardCardSx}
            >
              <Box sx={{ minWidth: 0 }}>
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
              </Box>
            </FormSectionCard>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}
