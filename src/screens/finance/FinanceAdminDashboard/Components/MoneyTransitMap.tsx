'use client';

import type { ReactNode } from 'react';
import type { PaletteColor } from '@mui/material/styles';

import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { fCurrency } from 'src/utils/format-number';
import { Chart, useChart } from 'src/components/chart';
import { Box, Paper, Stack, Divider, Typography, LinearProgress } from '@mui/material';

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

const TransitValue = ({
  index,
  label,
  value,
  detail,
  tint,
}: {
  index: string;
  label: string;
  value: string;
  detail?: ReactNode;
  tint?: string;
}) => (
  <Box
    sx={{
      minWidth: 0,
      px: { xs: 0, md: 1.5 },
      py: 1.5,
      borderLeft: { xs: 0, md: '1px solid' },
      borderColor: 'divider',
      '&:first-of-type': { borderLeft: 0, pl: 0 },
    }}
  >
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
      <Typography variant="caption" color="text.secondary" fontWeight={700}>
        {index}
      </Typography>
      <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
      <Box
        aria-hidden
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: tint ?? 'text.disabled',
          boxShadow: tint ? `0 0 0 4px ${  tint  }22` : undefined,
        }}
      />
    </Stack>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', minHeight: 32 }}>
      {label}
    </Typography>
    <Typography variant="h5" sx={{ mt: 0.5, whiteSpace: 'nowrap' }}>
      {value}
    </Typography>
    {detail && (
      <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.5 }}>
        {detail}
      </Typography>
    )}
  </Box>
);

export default function MoneyTransitMap({ activity, rangeLabel }: Props) {
  const theme = useTheme();
  const confirmedNet = activity.confirmedIncome - activity.expenses;
  const methodColors: PaletteColor[] = [
    theme.palette.primary,
    theme.palette.info,
    theme.palette.success,
    theme.palette.warning,
    theme.palette.secondary,
  ];
  const channelRows = financePaymentMethods.map((method, index) => ({
    ...method,
    amount: activity.methods[method.id] ?? 0,
    color: methodColors[index].main,
  }));
  const largestMethod = Math.max(...channelRows.map((method) => method.amount), 1);
  const chart = useMemo(
    () => ({
      labels: activity.days.map((day) =>
        new Date(`${day.date  }T12:00:00`).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
        })
      ),
      series: [
        {
          name: 'Fee payments',
          type: 'area',
          data: activity.days.map((day) => day.received),
        },
        {
          name: 'Confirmed income',
          type: 'line',
          data: activity.days.map((day) => day.confirmedIncome),
        },
      ],
    }),
    [activity.days]
  );
  const chartOptions = useChart({
    colors: [theme.palette.primary.main, theme.palette.success.main],
    chart: { toolbar: { show: false }, zoom: { enabled: false } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: [2, 2] },
    fill: { type: ['gradient', 'solid'] },
    markers: { size: 3 },
    xaxis: { categories: chart.labels },
    yaxis: {
      labels: {
        formatter: (value: number) => fCurrency(value),
      },
    },
    tooltip: {
      y: { formatter: (value: number) => fCurrency(value) },
    },
    legend: { position: 'top', horizontalAlign: 'left' },
  });

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 2,
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1,
        }}
      >
        <Box>
          <Typography variant="h6">Money Transit</Typography>
          <Typography variant="body2" color="text.secondary">
            Follow fee receipts from collection through confirmation and recorded spending.
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Activity · {rangeLabel}
        </Typography>
      </Box>

      <Divider />

      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: '1.08fr 1.05fr 1.05fr 0.95fr 0.95fr',
          },
          gap: { xs: 1.5, md: 0 },
        }}
      >
        <TransitValue
          index="01"
          label="Fee payments received"
          value={fCurrency(activity.received)}
          detail={`${activity.transactions.toLocaleString('en-IN')  } receipt transactions`}
          tint={theme.palette.primary.main}
        />
        <TransitValue
          index="02"
          label="Still in transit"
          value={fCurrency(
            financeQueuePreview.cashAwaitingDeposit +
              financeQueuePreview.nonCashAwaitingVerification
          )}
          detail={
            <Stack spacing={0.25}>
              <span>
                Cash · {fCurrency(financeQueuePreview.cashAwaitingDeposit)} awaiting deposit
              </span>
              <span>
                Non-cash · {fCurrency(financeQueuePreview.nonCashAwaitingVerification)} awaiting
                verification
              </span>
            </Stack>
          }
          tint={theme.palette.warning.main}
        />
        <TransitValue
          index="03"
          label="Confirmed income"
          value={fCurrency(activity.confirmedIncome)}
          detail="Recorded and confirmed in the selected period"
          tint={theme.palette.success.main}
        />
        <TransitValue
          index="04"
          label="Expenses recorded"
          value={fCurrency(activity.expenses)}
          detail="Paid expenses in the selected period"
          tint={theme.palette.info.main}
        />
        <TransitValue
          index="05"
          label="Net movement"
          value={fCurrency(confirmedNet)}
          detail="Confirmed income less recorded expenses"
          tint={theme.palette.secondary.main}
        />
      </Box>

      <Divider />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '0.9fr 1.1fr' },
        }}
      >
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={2}>
            <Typography variant="subtitle2">Collection channels</Typography>
            <Typography variant="caption" color="text.secondary">
              Amount · receipt count
            </Typography>
          </Stack>
          <Stack spacing={1.5} sx={{ mt: 2 }}>
            {channelRows.map((method) => (
              <Box key={method.id}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="baseline"
                  spacing={1}
                  sx={{ mb: 0.5 }}
                >
                  <Typography variant="body2">{method.label}</Typography>
                  <Typography variant="body2" fontWeight={600} textAlign="right">
                    {fCurrency(method.amount)}{' '}
                    <Typography component="span" variant="caption" color="text.secondary">
                      · {method.transactions} receipts
                    </Typography>
                  </Typography>
                </Stack>
                <LinearProgress
                  aria-label={`${method.label  } share of collections`}
                  variant="determinate"
                  value={(method.amount / largestMethod) * 100}
                  sx={{
                    height: 5,
                    borderRadius: 1,
                    bgcolor: 'action.hover',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 1,
                      backgroundColor: method.color,
                    },
                  }}
                />
              </Box>
            ))}
          </Stack>
        </Box>

        <Box sx={{ p: { xs: 2, md: 3 }, borderLeft: { lg: '1px solid' }, borderColor: 'divider' }}>
          <Typography variant="subtitle2">Daily movement</Typography>
          <Typography variant="caption" color="text.secondary">
            Fee payments compared with confirmed income
          </Typography>
          {activity.days.length ? (
            <Chart
              dir="ltr"
              type="area"
              series={chart.series}
              options={chartOptions}
              width="100%"
              height={260}
            />
          ) : (
            <Box
              role="status"
              sx={{
                minHeight: 240,
                display: 'grid',
                placeItems: 'center',
                color: 'text.secondary',
                textAlign: 'center',
              }}
            >
              <Typography variant="body2">
                No preview transactions fall within this date range.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 1.25,
          bgcolor: 'action.hover',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          The transit amounts are unresolved stages, not extra deductions. Net movement is a
          confirmed register difference; it is not a profit or live bank balance.
        </Typography>
      </Box>
    </Paper>
  );
}
