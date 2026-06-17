'use client';

import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
import { Box, Card, Chip, Stack, Skeleton, Typography } from '@mui/material';

import { formatLeaveDays } from './leave-overview.utils';

import type { LeaveOverviewData } from './leave-overview.utils';

type LeaveCenterOverviewPanelProps = {
  overview: LeaveOverviewData;
  isLoading: boolean;
};

type LeaveOverviewMetric = {
  label: string;
  value: number;
  icon: string;
  color: string;
  bgColor: string;
};

export const getLeaveUtilizationPercent = (overview: LeaveOverviewData) =>
  overview.totalLeaves > 0
    ? Math.min(100, Math.round((overview.usedLeaves / overview.totalLeaves) * 100))
    : 0;

const getOverviewMetrics = (overview: LeaveOverviewData): LeaveOverviewMetric[] => [
  {
    label: 'Available',
    value: overview.remainingLeaves,
    icon: 'solar:calendar-check-bold-duotone',
    color: 'success.main',
    bgColor: 'success.lighter',
  },
  {
    label: 'Entitled',
    value: overview.totalLeaves,
    icon: 'solar:calendar-add-bold-duotone',
    color: 'primary.main',
    bgColor: 'primary.lighter',
  },
  {
    label: 'Used',
    value: overview.usedLeaves,
    icon: 'solar:calendar-mark-bold-duotone',
    color: 'warning.main',
    bgColor: 'warning.lighter',
  },
];

export function LeaveCenterOverviewPanel({ overview, isLoading }: LeaveCenterOverviewPanelProps) {
  const theme = useTheme();
  const utilizationPercent = getLeaveUtilizationPercent(overview);
  const hasFiniteEntitlement = overview.totalLeaves > 0;
  const hasUnlimitedLeave = overview.bucketBreakdown.some((row) => row.isUnlimited);
  const metrics = useMemo(() => getOverviewMetrics(overview), [overview]);
  const chartSeries = useMemo(
    () =>
      hasFiniteEntitlement
        ? [Math.max(overview.usedLeaves, 0), Math.max(overview.remainingLeaves, 0)]
        : [],
    [hasFiniteEntitlement, overview.remainingLeaves, overview.usedLeaves]
  );
  const chartOptions = useChart({
    labels: ['Used', 'Available'],
    colors: [theme.palette.warning.main, theme.palette.success.main],
    stroke: { width: 0 },
    legend: { show: false },
    tooltip: {
      y: {
        formatter: (value: number) => `${formatLeaveDays(value)} day${value === 1 ? '' : 's'}`,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            total: {
              show: true,
              label: 'Used',
              formatter: () => `${utilizationPercent}%`,
            },
          },
        },
      },
    },
  });

  return (
    <Box
      data-testid="leave-center-overview-panel"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 280px' },
        gap: 1,
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
          gap: 1,
          minWidth: 0,
        }}
      >
        {metrics.map((metric) => (
          <Card
            key={metric.label}
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: 1,
              boxShadow: 'none',
              minHeight: 100,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isLoading ? (
              <Stack
                data-testid={`leave-overview-${metric.label.toLowerCase()}-loading`}
                spacing={1}
                sx={{ width: 1 }}
              >
                <Skeleton width={44} height={26} />
                <Skeleton width="64%" height={18} />
              </Stack>
            ) : (
              <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    flexShrink: 0,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: metric.color,
                    bgcolor: metric.bgColor,
                  }}
                >
                  <Iconify icon={metric.icon} width={22} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                    {formatLeaveDays(metric.value)}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', fontWeight: 800 }}
                  >
                    {metric.label}
                  </Typography>
                </Box>
              </Stack>
            )}
          </Card>
        ))}
      </Box>

      <Card
        variant="outlined"
        sx={{
          p: 1.5,
          borderRadius: 1,
          boxShadow: 'none',
          minHeight: 176,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
            <Iconify
              icon="solar:chart-2-bold-duotone"
              sx={{ width: 19, height: 19, color: 'primary.main', flexShrink: 0 }}
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              Utilization
            </Typography>
          </Stack>
          {isLoading ? (
            <Skeleton width={68} height={24} />
          ) : (
            <Chip
              size="small"
              color={
                utilizationPercent >= 80
                  ? 'error'
                  : utilizationPercent >= 50
                    ? 'warning'
                    : 'success'
              }
              variant="soft"
              label={`${utilizationPercent}% used`}
              sx={{ fontWeight: 800 }}
            />
          )}
        </Stack>

        {isLoading ? (
          <Stack data-testid="leave-overview-chart-loading" spacing={1} sx={{ mt: 2 }}>
            <Skeleton variant="circular" width={112} height={112} sx={{ mx: 'auto' }} />
            <Skeleton width="70%" height={18} sx={{ mx: 'auto' }} />
          </Stack>
        ) : hasFiniteEntitlement ? (
          <Stack direction={{ xs: 'column', sm: 'row', lg: 'column' }} spacing={1} sx={{ mt: 1 }}>
            <Chart
              type="donut"
              series={chartSeries}
              options={chartOptions}
              height={124}
              sx={{ mx: 'auto', maxWidth: 170 }}
            />
            <Stack spacing={0.5}>
              <Stack direction="row" justifyContent="space-between" spacing={1}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  Pending
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800 }}>
                  {formatLeaveDays(overview.pendingLeaveDays)}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" spacing={1}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  Buckets
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800 }}>
                  {overview.bucketBreakdown.length}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        ) : (
          <Stack
            data-testid="leave-overview-empty"
            spacing={0.75}
            alignItems="center"
            justifyContent="center"
            sx={{ flex: 1, textAlign: 'center', px: 1 }}
          >
            <Iconify
              icon="solar:calendar-minimalistic-bold-duotone"
              sx={{ width: 36, height: 36, color: 'text.disabled' }}
            />
            <Typography variant="body2" sx={{ fontWeight: 800 }}>
              No finite leave entitlement
            </Typography>
            {hasUnlimitedLeave ? (
              <Typography variant="caption" color="text.secondary">
                Unlimited unpaid leave is tracked in history.
              </Typography>
            ) : (
              <Typography variant="caption" color="text.secondary">
                Balance will appear after allocation.
              </Typography>
            )}
          </Stack>
        )}
      </Card>
    </Box>
  );
}
