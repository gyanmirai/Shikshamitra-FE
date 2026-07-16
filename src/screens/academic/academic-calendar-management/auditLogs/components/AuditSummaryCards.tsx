'use client';

import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Card, Grid, Stack, Skeleton, Typography, CardContent } from '@mui/material';

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
  const theme = useTheme();
  const color = theme.palette[colorKey].main;
  return (
    <Card
      sx={{
        borderRadius: 2.5,
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${alpha(color, 0.15)}`,
        boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.04)}`,
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: `0 8px 24px ${alpha(color, 0.18)}`,
          borderColor: alpha(color, 0.35),
        },
      }}
    >
      {/* Accent bar */}
      <Box
        sx={{ height: 3, background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.4)})` }}
      />
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{ color: theme.vars.palette.text.primary, lineHeight: 1.1, mb: 0.25 }}
            >
              {value}
            </Typography>
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              sx={{ lineHeight: 1.2, display: 'block' }}
              noWrap
            >
              {label}
            </Typography>
            {helper && (
              <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 0.5 }}>
                {trend && (
                  <Iconify
                    icon={trend === 'up' ? 'mdi:trending-up' : 'mdi:trending-down'}
                    width={12}
                    sx={{
                      color: trend === 'up' ? theme.palette.success.main : theme.palette.error.main,
                    }}
                  />
                )}
                <Typography variant="caption" color="text.secondary">
                  {helper}
                </Typography>
              </Stack>
            )}
          </Box>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              backgroundColor: alpha(color, 0.12),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Iconify icon={icon} width={22} sx={{ color }} />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

const SkeletonCard = () => {
  const theme = useTheme();
  return (
    <Card sx={{ borderRadius: 2.5, border: `1px solid ${theme.palette.divider}` }}>
      <Box sx={{ height: 3, backgroundColor: theme.palette.divider }} />
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
          <Stack spacing={1} sx={{ flex: 1 }}>
            <Skeleton variant="text" width={60} height={32} />
            <Skeleton variant="text" width={90} />
            <Skeleton variant="text" width={70} />
          </Stack>
          <Skeleton variant="circular" width={44} height={44} />
        </Stack>
      </CardContent>
    </Card>
  );
};

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
