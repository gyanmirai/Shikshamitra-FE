'use client';

import { useMemo } from 'react';
import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Grid,
  Card,
  Stack,
  Paper,
  CardHeader,
  Typography,
  LinearProgress,
} from '@mui/material';

import { buildMockAnalytics } from '../constants/auditLogs.mock';
import { RISK_LABELS, RISK_COLOR_KEYS } from '../constants/auditLogs.constants';

import type { AuditLog } from '../types/auditLogs.types';

interface Props {
  logs: AuditLog[];
}

const paletteFor = (key: string) => {
  const map: Record<string, string> = {
    success: '#22C55E',
    info: '#3B82F6',
    warning: '#F59E0B',
    error: '#EF4444',
    default: '#9E9E9E',
    primary: '#6366F1',
    secondary: '#A855F7',
  };
  return map[key] || map.default;
};

/** Analytics view: charts, distributions, suspicious activity alerts. */
const AuditAnalyticsView = ({ logs }: Props) => {
  const theme = useTheme();
  const analytics = useMemo(() => buildMockAnalytics(logs), [logs]);

  // ─── Charts ──────────────────────────────────────────────────────────────

  const actionChartOptions = useChart({
    chart: { type: 'bar' },
    plotOptions: { bar: { borderRadius: 6, distributed: false } },
    colors: [theme.palette.primary.main],
    xaxis: {
      categories: analytics.actionDistribution.map((d) => d.label),
      labels: { style: { fontSize: '10px' } },
    },
    dataLabels: { enabled: false },
  });

  const riskChartOptions = useChart({
    chart: { type: 'donut' },
    labels: analytics.riskDistribution.map((r) => RISK_LABELS[r.level]),
    colors: analytics.riskDistribution.map((r) => paletteFor(RISK_COLOR_KEYS[r.level])),
    legend: { position: 'bottom', fontSize: '12px' },
    plotOptions: { pie: { donut: { size: '68%' } } },
    dataLabels: { enabled: true, style: { fontSize: '12px' } },
  });

  // ─── Stat tiles ──────────────────────────────────────────────────────────

  const tiles = [
    {
      label: 'Critical Changes',
      value: analytics.criticalCount,
      icon: 'mdi:alert-octagon-outline',
      color: theme.palette.error.main,
    },
    {
      label: 'High+ Risk Changes',
      value: analytics.highRiskCount,
      icon: 'mdi:alert-outline',
      color: theme.palette.warning.main,
    },
    {
      label: 'Pending Approvals',
      value: analytics.pendingApprovalCount,
      icon: 'mdi:clock-alert-outline',
      color: theme.palette.info.main,
    },
    {
      label: 'Total Events',
      value: logs.length,
      icon: 'mdi:history',
      color: theme.palette.primary.main,
    },
  ];

  return (
    <Stack spacing={2}>
      {/* Top stat tiles */}
      <Grid container spacing={1.5}>
        {tiles.map((t) => (
          <Grid size={{ xs: 6, md: 3 }} key={t.label}>
            <Card sx={{ p: 2, borderRadius: 2.5, border: `1px solid ${alpha(t.color, 0.15)}` }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h5" fontWeight={800} sx={{ color: t.color }}>
                    {t.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    {t.label}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    backgroundColor: alpha(t.color, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon={t.icon} width={20} sx={{ color: t.color }} />
                </Box>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts row */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardHeader
              title="Action Type Distribution"
              subheader="Most common audit actions"
              titleTypographyProps={{ variant: 'subtitle2', fontWeight: 700 }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <Box sx={{ p: 2, pt: 0 }} dir="ltr">
              {analytics.actionDistribution.length > 0 ? (
                <Chart
                  type="bar"
                  series={[
                    { name: 'Events', data: analytics.actionDistribution.map((d) => d.count) },
                  ]}
                  options={actionChartOptions}
                  height={300}
                />
              ) : (
                <Typography variant="caption" color="text.secondary">
                  No data
                </Typography>
              )}
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardHeader
              title="Risk Distribution"
              subheader="By severity"
              titleTypographyProps={{ variant: 'subtitle2', fontWeight: 700 }}
              subheaderTypographyProps={{ variant: 'caption' }}
            />
            <Box sx={{ p: 2, pt: 0 }} dir="ltr">
              {analytics.riskDistribution.length > 0 ? (
                <Chart
                  type="donut"
                  series={analytics.riskDistribution.map((r) => r.count)}
                  options={riskChartOptions}
                  height={300}
                />
              ) : (
                <Typography variant="caption" color="text.secondary">
                  No data
                </Typography>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Top entities + users */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, p: 2 }}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
              <Iconify icon="mdi:format-list-bulleted" width={16} color="primary.main" />
              <Typography variant="subtitle2" fontWeight={700}>
                Top Changed Entities
              </Typography>
            </Stack>
            <Stack spacing={1}>
              {analytics.topEntities.map((e, i) => {
                const max = analytics.topEntities[0]?.count || 1;
                const pct = Math.round((e.count / max) * 100);
                return (
                  <Box key={e.label}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.25 }}>
                      <Typography variant="caption" fontWeight={600} noWrap sx={{ maxWidth: 220 }}>
                        {i + 1}. {e.label}
                      </Typography>
                      <Typography variant="caption" fontWeight={800} color="primary.main">
                        {e.count}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                );
              })}
              {analytics.topEntities.length === 0 && (
                <Typography variant="caption" color="text.secondary">
                  No data
                </Typography>
              )}
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, p: 2 }}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
              <Iconify icon="mdi:account-multiple-outline" width={16} color="primary.main" />
              <Typography variant="subtitle2" fontWeight={700}>
                Most Active Users
              </Typography>
            </Stack>
            <Stack spacing={1}>
              {analytics.topUsers.map((u, i) => (
                <Stack key={`${u.name}-${i}`} direction="row" alignItems="center" gap={1.25}>
                  <Box
                    component="span"
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: 1.5,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 800,
                      color: 'primary.main',
                    }}
                  >
                    {i + 1}
                  </Box>
                  <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }} noWrap>
                    {u.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {u.role}
                  </Typography>
                  <Typography variant="caption" fontWeight={800} color="primary.main">
                    {u.count}
                  </Typography>
                </Stack>
              ))}
              {analytics.topUsers.length === 0 && (
                <Typography variant="caption" color="text.secondary">
                  No data
                </Typography>
              )}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Suspicious Activity Alerts */}
      <Card
        sx={{
          borderRadius: 3,
          p: 2,
          border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
        }}
      >
        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
          <Iconify icon="mdi:shield-alert-outline" width={18} color="warning.main" />
          <Typography variant="subtitle2" fontWeight={700} color="warning.main">
            Suspicious Activity Alerts
          </Typography>
          <Box
            sx={{
              px: 0.75,
              borderRadius: 1,
              backgroundColor: alpha(theme.palette.warning.main, 0.1),
            }}
          >
            <Typography variant="caption" fontWeight={800} color="warning.main">
              {analytics.suspiciousAlerts.length}
            </Typography>
          </Box>
        </Stack>
        <Stack spacing={1.5}>
          {analytics.suspiciousAlerts.map((alert) => {
            const color =
              alert.severity === 'error' ? theme.palette.error.main : theme.palette.warning.main;
            return (
              <Paper
                key={alert.id}
                variant="outlined"
                sx={{
                  p: 1.75,
                  borderRadius: 2,
                  borderColor: alpha(color, 0.25),
                  backgroundColor: alpha(color, 0.02),
                }}
              >
                <Stack direction="row" alignItems="flex-start" gap={1.5}>
                  <Iconify
                    icon={alert.severity === 'error' ? 'mdi:alert-circle' : 'mdi:alert'}
                    width={20}
                    sx={{ color, mt: 0.2 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={700} sx={{ color }}>
                      {alert.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 0.25 }}
                    >
                      {alert.message}
                    </Typography>
                    <Stack direction="row" alignItems="center" gap={0.5} sx={{ mt: 0.75 }}>
                      <Iconify icon="mdi:lightbulb-on-outline" width={12} color="info.main" />
                      <Typography variant="caption" color="info.main" fontWeight={600}>
                        {alert.suggestedAction}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      </Card>
    </Stack>
  );
};

export default AuditAnalyticsView;
