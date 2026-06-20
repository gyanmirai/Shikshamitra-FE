'use client';

import { useMemo } from 'react';
import { varAlpha } from 'src/theme/styles';
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
  color: 'success' | 'grey' | 'warning';
  bgColor: string;
  useLogo?: boolean;
};

const getPaletteMainColor = (theme: any, colorKey: 'success' | 'grey' | 'warning'): string => {
  if (colorKey === 'grey') {
    return theme.vars?.palette?.grey?.[500] || theme.palette?.grey?.[500] || '#919EAB';
  }
  return theme.vars?.palette?.[colorKey]?.main || theme.palette?.[colorKey]?.main || '';
};

const getPaletteChannel = (theme: any, colorKey: 'success' | 'grey' | 'warning'): string => {
  if (colorKey === 'grey') {
    return getGreyChannel(theme);
  }
  if (theme.vars?.palette?.[colorKey]?.mainChannel) {
    return theme.vars.palette[colorKey].mainChannel;
  }
  const hex = theme.palette?.[colorKey]?.main;
  if (hex && hex.startsWith('#')) {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return `${r} ${g} ${b}`;
  }
  const fallbacks = {
    success: '76 175 80',
    grey: '145 158 171',
    warning: '255 193 7',
  };
  return fallbacks[colorKey];
};

const getGreyChannel = (theme: any): string => {
  if (theme.vars?.palette?.grey?.['500Channel']) {
    return theme.vars.palette.grey['500Channel'];
  }
  const hex = theme.palette?.grey?.[500] || '#919EAB';
  if (hex.startsWith('#')) {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return `${r} ${g} ${b}`;
  }
  return '145 158 171';
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
    color: 'success',
    bgColor: 'success.lighter',
    useLogo: true,
  },
  {
    label: 'Accrued',
    value: overview.totalLeaves,
    icon: 'solar:clock-circle-bold-duotone',
    color: 'grey',
    bgColor: 'grey.lighter',
  },
  {
    label: 'Used',
    value: overview.usedLeaves,
    icon: 'solar:calendar-minus-bold-duotone',
    color: 'warning',
    bgColor: 'warning.lighter',
  },
];

export function LeaveCenterOverviewPanel({ overview, isLoading }: LeaveCenterOverviewPanelProps) {
  const theme = useTheme();
  const utilizationPercent = getLeaveUtilizationPercent(overview);
  const hasFiniteEntitlement = overview.totalLeaves > 0;
  const hasUnlimitedLeave = overview.bucketBreakdown.some((row) => row.isUnlimited);
  const metrics = useMemo(() => getOverviewMetrics(overview), [overview]);
  const hasAllocation = overview.bucketBreakdown && overview.bucketBreakdown.length > 0;

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
        gap: 2,
      }}
    >
      <Stack spacing={1.5} sx={{ minWidth: 0 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
            gap: 2,
            minWidth: 0,
          }}
        >
          {metrics.map((metric) => {
            const colorChannel = hasAllocation
              ? getPaletteChannel(theme, metric.color)
              : getGreyChannel(theme);
            const mainColor = hasAllocation
              ? getPaletteMainColor(theme, metric.color)
              : theme.palette?.text?.disabled || '#919EAB';

            return (
              <Card
                key={metric.label}
                variant="outlined"
                sx={{
                  p: 2.25,
                  borderRadius: 2,
                  boxShadow: 'none',
                  minHeight: 104,
                  display: 'flex',
                  alignItems: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  bgcolor: varAlpha(colorChannel, 0.04),
                  borderColor: varAlpha(colorChannel, 0.16),
                  transition: theme.transitions.create(
                    ['transform', 'box-shadow', 'border-color'],
                    {
                      duration: theme.transitions.duration.shorter,
                    }
                  ),
                  ...(hasAllocation && {
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: mainColor,
                      boxShadow: `0 12px 24px -4px ${varAlpha(colorChannel, 0.16)}`,
                      '& .metric-icon-box': {
                        transform: 'scale(1.08)',
                        bgcolor: varAlpha(colorChannel, 0.2),
                      },
                    },
                  }),
                }}
              >
                {isLoading ? (
                  <Stack
                    data-testid={`leave-overview-${metric.label.toLowerCase()}-loading`}
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ width: 1 }}
                  >
                    <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: 1.5 }} />
                    <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
                      <Skeleton width={40} height={28} />
                      <Skeleton width="60%" height={16} />
                    </Stack>
                  </Stack>
                ) : (
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ minWidth: 0, width: 1 }}
                  >
                    <Box
                      className="metric-icon-box"
                      sx={{
                        width: 48,
                        height: 48,
                        flexShrink: 0,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: mainColor,
                        bgcolor: varAlpha(colorChannel, 0.12),
                        transition: theme.transitions.create(['transform', 'background-color'], {
                          duration: theme.transitions.duration.shorter,
                        }),
                      }}
                    >
                      <Iconify icon={metric.icon} width={24} />
                    </Box>
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 800,
                          lineHeight: 1.1,
                          mb: 0.5,
                          color: hasAllocation ? 'text.primary' : 'text.disabled',
                        }}
                      >
                        {hasAllocation ? formatLeaveDays(metric.value) : '—'}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          display: 'block',
                          fontWeight: 700,
                          color: hasAllocation ? 'text.secondary' : 'text.disabled',
                        }}
                      >
                        {metric.label}
                      </Typography>
                    </Box>
                  </Stack>
                )}
              </Card>
            );
          })}
        </Box>

        {!hasAllocation && !isLoading && (
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              p: 1.25,
              borderRadius: 1,
              bgcolor: varAlpha(getGreyChannel(theme), 0.04),
              border: '1px dashed',
              borderColor: varAlpha(getGreyChannel(theme), 0.16),
            }}
          >
            <Iconify
              icon="solar:info-circle-bold-duotone"
              sx={{ color: 'text.secondary', width: 18, height: 18, flexShrink: 0 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              No leave allocation yet for this year — ask HR to set one up.
            </Typography>
          </Stack>
        )}
      </Stack>

      <Card
        variant="outlined"
        sx={{
          p: 2.25,
          borderRadius: 2,
          boxShadow: 'none',
          minHeight: 176,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: theme.vars?.palette?.background?.paper || theme.palette?.background?.paper,
          borderColor: varAlpha(getGreyChannel(theme), 0.16),
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
