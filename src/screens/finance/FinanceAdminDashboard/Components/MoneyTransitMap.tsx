'use client';

import type { FinanceDashboardActivity } from 'src/redux/finance/financeDashboardApi';

import dayjs from 'dayjs';
import { useTheme } from '@mui/material/styles';
import { Chart, useChart } from 'src/components/chart';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Grid, Stack, Alert, Typography } from '@mui/material';
import { PaymentMethodLabels } from 'src/enums/finance-payment-method';
import { TopMetricTile } from 'src/screens/academic/AcademicDashboard/Components/TopMetricTile';

import { financeDashboardCardSx } from './finance-dashboard-card-styles';
import { dashboardNumberSx, formatDashboardMoney } from '../finance-dashboard-format';

export function FinanceActivityMetrics({ activity }: { activity: FinanceDashboardActivity }) {
  const { confirmedFees, confirmedIncome, confirmedExpenses, netMovement, collectionsUnavailable } =
    activity;
  const metrics = [
    { label: 'Confirmed fee receipts', value: confirmedFees, icon: 'mdi:receipt-text-outline' },
    { label: 'Confirmed income', value: confirmedIncome, icon: 'mdi:cash-plus' },
    { label: 'Confirmed expenses', value: confirmedExpenses, icon: 'mdi:hand-coin-outline' },
    { label: 'Net movement', value: netMovement, icon: 'mdi:chart-box-outline' },
  ].filter(
    (metric): metric is { label: string; value: number; icon: string } => metric.value !== null
  );

  return (
    <Stack component="section" aria-label="Period activity" spacing={2}>
      {collectionsUnavailable && <Alert severity="info">{collectionsUnavailable}</Alert>}
      {metrics.length === 0 && !collectionsUnavailable && (
        <Typography color="text.secondary" variant="body2">
          Period activity is unavailable for your access.
        </Typography>
      )}
      {metrics.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: `repeat(${Math.min(metrics.length, 2)}, minmax(0, 1fr))`,
              md: `repeat(${metrics.length}, minmax(0, 1fr))`,
            },
            gap: 1.5,
            overflowWrap: 'anywhere',
            ...dashboardNumberSx,
          }}
        >
          {metrics.map(({ label, value, icon }) => (
            <TopMetricTile
              key={label}
              label={label}
              value={formatDashboardMoney(value)}
              icon={icon}
            />
          ))}
        </Box>
      )}
    </Stack>
  );
}

export function FinanceCollectionCharts({ activity }: { activity: FinanceDashboardActivity }) {
  const theme = useTheme();
  const { confirmedFees, collectionsUnavailable } = activity;
  const showCollections = confirmedFees !== null || !!collectionsUnavailable;
  const methods = (activity.paymentMethods ?? []).slice().sort((a, b) => b.amount - a.amount);
  const methodTotal = methods.reduce((total, method) => total + method.amount, 0);
  const chartOptions = useChart({
    colors: [theme.palette.success.main],
    chart: { toolbar: { show: false }, zoom: { enabled: false } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: activity.days.map((day) => dayjs(day.date).format('DD MMM')),
      tickAmount: activity.days.length > 6 ? 6 : undefined,
    },
    yaxis: { labels: { formatter: formatDashboardMoney } },
    tooltip: { y: { formatter: formatDashboardMoney } },
    legend: { show: false },
  });

  if (!showCollections) return null;

  return (
    <Grid
      component="section"
      aria-label="Fee collections"
      container
      spacing={2}
      alignItems="stretch"
    >
      <Grid size={{ xs: 12, md: 5 }} sx={{ minWidth: 0 }}>
        <FormSectionCard
          title="Payment Methods"
          descriptionTooltip="Payments linked to confirmed fee receipts in the selected period. Amounts include charges paid in the same transaction."
          sx={financeDashboardCardSx}
        >
          {methods.length > 0 ? (
            <Stack component="ul" spacing={1.5} sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {methods.map(({ method, amount }) => (
                <Box component="li" key={method}>
                  <Stack direction="row" justifyContent="space-between" spacing={1}>
                    <Typography variant="body2">{PaymentMethodLabels[method]}</Typography>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{ ...dashboardNumberSx, flexShrink: 0 }}
                    >
                      {formatDashboardMoney(amount)}
                    </Typography>
                  </Stack>
                  <Box
                    aria-hidden
                    sx={{ bgcolor: 'action.hover', borderRadius: 1, height: 5, mt: 0.5 }}
                  >
                    <Box
                      sx={{
                        bgcolor: 'success.main',
                        borderRadius: 'inherit',
                        height: '100%',
                        width: methodTotal > 0 ? `${(amount / methodTotal) * 100}%` : 0,
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No payment methods recorded for these dates.
            </Typography>
          )}
        </FormSectionCard>
      </Grid>
      <Grid size={{ xs: 12, md: 7 }} sx={{ minWidth: 0 }}>
        <FormSectionCard
          title="Daily Collections"
          descriptionTooltip="Confirmed fee amounts grouped by receipt date."
          sx={financeDashboardCardSx}
        >
          {activity.days.length > 0 ? (
            <Chart
              type="bar"
              height={210}
              options={chartOptions}
              series={[{ name: 'Confirmed fees', data: activity.days.map((day) => day.amount) }]}
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              {collectionsUnavailable
                ? 'Daily fee totals are unavailable for these dates.'
                : 'No collections for these dates.'}
            </Typography>
          )}
        </FormSectionCard>
      </Grid>
    </Grid>
  );
}
