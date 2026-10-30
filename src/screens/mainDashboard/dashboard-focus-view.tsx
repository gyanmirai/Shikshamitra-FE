'use client';

import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Stack, Button, Skeleton, Typography } from '@mui/material';

import { DashboardFocusChart } from './dashboard-focus-chart';
import { DashboardFocusItems } from './dashboard-focus-items';
import { DashboardFocusMetrics } from './dashboard-focus-metrics';

import type { DashboardFocus } from './dashboard-focus-types';

type Props = {
  focus: DashboardFocus | undefined;
  isLoading?: boolean;
  onRetry?: () => void;
  isRefreshing?: boolean;
};

export function DashboardFocusView({ focus, isLoading, onRetry, isRefreshing }: Props) {
  const ready = focus?.status === 'ready';
  const payroll = focus?.kind === 'payroll';
  const asOf = focus?.asOfUtc && !Number.isNaN(Date.parse(focus.asOfUtc))
    ? fDateTime(focus.asOfUtc) : undefined;
  const isChart = focus && ['collections', 'attendance', 'pipeline', 'results'].includes(focus.kind);
  const message = focus?.message || (focus?.status === 'empty'
    ? 'No focus data is available for this period.' : 'Focus data is unavailable.');

  return (
    <FormSectionCard title={focus?.title || 'Dashboard Focus'} description={focus?.description}
      aria-label={focus?.title || 'Dashboard focus'} sx={{ minWidth: 0, height: 1 }}>
      <Stack spacing={2} sx={{ minWidth: 0 }} aria-busy={!!isLoading || !!isRefreshing}>
        {isLoading ? (
          <Box role="status" aria-label="Loading focus data">
            <Typography variant="caption" color="text.secondary">Loading focus data…</Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }} aria-hidden>
              <Skeleton width="30%" height={48} /><Skeleton width="30%" height={48} />
            </Stack>
            <Skeleton variant="rounded" height={240} aria-hidden />
          </Box>
        ) : !ready || !focus ? (
          <Stack spacing={1} justifyContent="center" alignItems="flex-start" sx={{ minHeight: 240 }}>
            <Typography role={focus?.status === 'error' ? 'alert' : 'status'} variant="body2"
              color="text.secondary">{message}</Typography>
            {onRetry && focus?.status !== 'empty' && (
              <Button size="small" variant="outlined" color="inherit" onClick={onRetry}
                disabled={isRefreshing} startIcon={<Iconify icon="mdi:refresh" width={18} aria-hidden />}>
                Retry
              </Button>
            )}
          </Stack>
        ) : (
          <>
            {(focus.periodLabel || asOf || payroll || isRefreshing) && (
              <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
                {(focus.periodLabel || payroll) && <Typography variant="caption" color="text.secondary">
                  {focus.periodLabel || 'Period unavailable'}
                </Typography>}
                {(asOf || payroll) && <Typography variant="caption" color="text.secondary">
                  {asOf ? `As of ${asOf}` : 'Snapshot time unavailable'}
                </Typography>}
                {isRefreshing && <Typography role="status" variant="caption" color="text.secondary">
                  Refreshing focus data…
                </Typography>}
              </Stack>
            )}
            <DashboardFocusMetrics metrics={focus.metrics} unit={focus.unit} />
            {isChart && <DashboardFocusChart focus={focus} />}
            <DashboardFocusItems focus={focus} />
            {!isChart && !focus.metrics.length && !focus.items.length && (
              <Typography variant="body2" color="text.secondary" sx={{ minHeight: 240 }}>
                {focus.message || (payroll ? 'Saved payroll evidence is unavailable.' : 'No records are available.')}
              </Typography>
            )}
          </>
        )}
      </Stack>
    </FormSectionCard>
  );
}
