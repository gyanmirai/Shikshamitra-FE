'use client';

import { Iconify } from 'src/components/iconify';
import { varAlpha } from 'src/theme/styles';
import { Box, Card, Grid, Stack, Skeleton, Typography } from '@mui/material';

import { formatAuditTimestamp } from '../utils/auditFormatters';

import type { AuditSummary } from '../types/auditLogs.types';

interface Props {
  summary?: AuditSummary;
  loading?: boolean;
}

interface KpiProps {
  label: string;
  value: number | string;
  helper?: string;
  icon: string;
  colorKey: 'primary' | 'info' | 'warning' | 'error' | 'success';
  trend?: 'up' | 'down';
}

const KpiCard = ({ label, value, helper, icon, colorKey, trend }: KpiProps) => {
  return (
    <Card
      sx={{
        minHeight: 66,
        p: 1.5,
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.25,
            bgcolor: (theme) => varAlpha(theme.vars.palette[colorKey].mainChannel, 0.12),
            display: 'grid',
            placeItems: 'center',
            color: `${colorKey}.main`,
            flexShrink: 0,
          }}
        >
          <Iconify icon={icon} width={20} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1 }} noWrap>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap display="block" mt={0.5}>
            {label}
          </Typography>
          {helper && (
            <Stack direction="row" alignItems="center" gap={0.5} sx={{ mt: 0.25 }}>
              {trend && (
                <Iconify
                  icon={trend === 'up' ? 'mdi:trending-up' : 'mdi:trending-down'}
                  width={12}
                  sx={{ color: trend === 'up' ? 'success.main' : 'error.main' }}
                />
              )}
              <Typography variant="caption" color="text.secondary" noWrap>
                {helper}
              </Typography>
            </Stack>
          )}
        </Box>
      </Stack>
    </Card>
  );
};

const SkeletonCard = () => (
  <Card sx={{ minHeight: 66, p: 1.5, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
    <Stack direction="row" alignItems="center" spacing={1}>
      <Skeleton variant="rounded" width={36} height={36} />
      <Stack spacing={0.5} sx={{ flex: 1 }}>
        <Skeleton variant="text" width={60} height={24} />
        <Skeleton variant="text" width={90} />
      </Stack>
    </Stack>
  </Card>
);

/** Top KPI summary row (4 cards) shown above the audit table. */
const AuditSummaryCards = ({ summary, loading }: Props) => {
  if (loading || !summary) {
    return (
      <Grid container spacing={1}>
        {[0, 1, 2, 3].map((i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <SkeletonCard />
          </Grid>
        ))}
      </Grid>
    );
  }

  const weekDelta = (summary.changesThisWeek ?? 0) - (summary.changesLastWeek ?? 0);
  const lastSynced = summary.lastSyncedAt ? formatAuditTimestamp(summary.lastSyncedAt) : null;

  return (
    <Grid container spacing={1}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <KpiCard
          label="Total Audit Events"
          value={summary.totalAuditEvents}
          helper={lastSynced ? `Synced ${lastSynced.relative}` : 'All recorded activities'}
          icon="mdi:history"
          colorKey="primary"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <KpiCard
          label="Changes This Week"
          value={summary.changesThisWeek}
          helper={`${weekDelta >= 0 ? '+' : ''}${weekDelta} vs last week`}
          icon="mdi:calendar-refresh-outline"
          colorKey="info"
          trend={weekDelta >= 0 ? 'up' : 'down'}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <KpiCard
          label="Critical Changes"
          value={summary.criticalChanges}
          helper={summary.criticalChanges > 0 ? 'Needs review' : 'All clear'}
          icon="mdi:alert-octagon-outline"
          colorKey="error"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <KpiCard
          label="Most Active User"
          value={summary.mostActiveUser?.name ?? '—'}
          helper={
            summary.mostActiveUser
              ? `${summary.mostActiveUser.actionCount} actions this week`
              : 'No activity'
          }
          icon="mdi:account-clock-outline"
          colorKey="success"
        />
      </Grid>
    </Grid>
  );
};

export default AuditSummaryCards;
