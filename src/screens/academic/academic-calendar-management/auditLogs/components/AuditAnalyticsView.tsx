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
  Avatar,
  CardHeader,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  TimetableSettingsSummaryCards,
  type ITimetableSummaryCard,
} from 'src/components/timetable-settings-summary-cards/TimetableSettingsSummaryCards';

import { buildMockAnalytics } from '../constants/auditLogs.mock';
import { RISK_LABELS, RISK_COLOR_KEYS } from '../constants/auditLogs.constants';

import type { AuditLog } from '../types/auditLogs.types';

interface Props {
  logs: AuditLog[];
}

const paletteFor = (key: string) => {
  const map: Record<string, string> = {
    success: '#00A76F',
    info: '#00B8D9',
    warning: '#FFAB00',
    error: '#FF5630',
    default: '#919EAB',
    primary: '#2065D1',
    secondary: '#7635DC',
  };
  return map[key] || map.default;
};

/** Dashboard-grade surface style consistent with Academic Dashboard */
const dashboardSurfaceSx = {
  bgcolor: 'background.paper',
  borderRadius: 2.5,
  boxShadow: (theme: any) => `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
  border: (theme: any) => `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease',
};

/** Analytics view: cards, charts, distributions, suspicious activity alerts. */
const AuditAnalyticsView = ({ logs }: Props) => {
  const theme = useTheme();
  const analytics = useMemo(() => buildMockAnalytics(logs || []), [logs]);

  const totalRiskEvents = useMemo(
    () => analytics.riskDistribution.reduce((acc, r) => acc + r.count, 0),
    [analytics.riskDistribution]
  );

  const maxActionCount = useMemo(
    () => Math.max(...analytics.actionDistribution.map((d) => d.count), 1),
    [analytics.actionDistribution]
  );

  // ─── Summary Cards Config (Matching Weekly Lectures Summary Cards) ──────────
  const summaryCards = useMemo<ITimetableSummaryCard[]>(
    () => [
      {
        label: 'Critical Changes',
        value: analytics.criticalCount,
        icon: 'mdi:alert-octagon-outline',
        color: 'error',
      },
      {
        label: 'High+ Risk Changes',
        value: analytics.highRiskCount,
        icon: 'mdi:alert-outline',
        color: 'warning',
      },
      {
        label: 'Pending Approvals',
        value: analytics.pendingApprovalCount,
        icon: 'mdi:clock-alert-outline',
        color: 'info',
      },
      {
        label: 'Total Audit Events',
        value: logs?.length || 0,
        icon: 'mdi:history',
        color: 'primary',
      },
    ],
    [analytics.criticalCount, analytics.highRiskCount, analytics.pendingApprovalCount, logs?.length]
  );

  // ─── Bar Chart Options (Action Type Distribution) ──────────────────────────
  const actionChartOptions = useChart({
    chart: {
      type: 'bar',
      height: 260,
      toolbar: { show: false },
    },
    colors: [
      theme.palette.primary.main,
      theme.palette.info.main,
      theme.palette.warning.main,
      theme.palette.secondary.main,
      theme.palette.error.main,
      theme.palette.success.main,
    ],
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth:
          analytics.actionDistribution.length === 1
            ? '24%'
            : analytics.actionDistribution.length <= 3
              ? '35%'
              : '48%',
        distributed: true,
        dataLabels: {
          position: 'top',
        },
      },
    },
    legend: { show: false },
    xaxis: {
      categories: analytics.actionDistribution.map((d) => d.label),
      labels: {
        show: true,
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '11px',
          fontWeight: 600,
        },
        rotate: -15,
        rotateAlways: false,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      max: Math.max(maxActionCount + 1, 4),
      tickAmount: Math.min(maxActionCount + 1, 5),
      forceNiceScale: false,
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '11px',
        },
        formatter: (val: any) => `${Math.round(val)}`,
      },
    },
    grid: {
      strokeDashArray: 3,
      borderColor: theme.palette.divider,
      padding: {
        top: 15,
        right: 15,
        bottom: 0,
        left: 10,
      },
    },
    dataLabels: {
      enabled: true,
      offsetY: -18,
      style: {
        fontSize: '11px',
        fontWeight: 700,
        colors: [theme.palette.text.primary],
      },
      formatter: (val: any) => `${val}`,
    },
  });

  // ─── Donut Chart Options (Risk Severity Distribution) ─────────────────────
  const riskChartOptions = useChart({
    chart: {
      type: 'donut',
      height: 260,
    },
    labels: analytics.riskDistribution.map((r) => RISK_LABELS[r.level]),
    colors: analytics.riskDistribution.map((r) => paletteFor(RISK_COLOR_KEYS[r.level])),
    stroke: {
      colors: [theme.palette.background.paper],
      width: 2,
    },
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '12px',
      fontWeight: 600,
      labels: {
        colors: theme.palette.text.primary,
      },
      markers: {
        width: 10,
        height: 10,
        radius: 12,
      },
      itemMargin: { horizontal: 8, vertical: 4 },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '12px',
              fontWeight: 600,
              color: theme.palette.text.secondary,
              offsetY: -4,
            },
            value: {
              show: true,
              fontSize: '22px',
              fontWeight: 800,
              color: theme.palette.text.primary,
              offsetY: 6,
              formatter: (val: any) => `${val}`,
            },
            total: {
              show: true,
              label: 'Total Events',
              fontSize: '12px',
              fontWeight: 600,
              color: theme.palette.text.secondary,
              formatter: () => `${totalRiskEvents}`,
            },
          },
        },
      },
    },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (val: any) =>
          `${val} events (${Math.round((Number(val) / (totalRiskEvents || 1)) * 100)}%)`,
      },
    },
    dataLabels: { enabled: false },
  });

  return (
    <Stack>
      {/* ── Top Summary Cards (Weekly Lectures Style) ───────────────────────── */}
      <TimetableSettingsSummaryCards cards={summaryCards} />

      {/* ── Charts Row (50-50 Equal Sized Cards) ─────────────────────────── */}
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              ...dashboardSurfaceSx,
              height: 380,
              display: 'flex',
              flexDirection: 'column',
              p: 2.5,
            }}
          >
            <CardHeader
              sx={{ p: 0, mb: 1.5 }}
              title="Action Type Distribution"
              subheader="Most common audit actions"
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
              subheaderTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
              avatar={
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Iconify icon="mdi:chart-bar" width={20} color="primary.main" />
                </Box>
              }
            />
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 0,
                width: '100%',
              }}
              dir="ltr"
            >
              {analytics.actionDistribution.length > 0 ? (
                <Chart
                  type="bar"
                  series={[
                    { name: 'Events', data: analytics.actionDistribution.map((d) => d.count) },
                  ]}
                  options={actionChartOptions}
                  height={260}
                  width="100%"
                />
              ) : (
                <Typography variant="caption" color="text.secondary">
                  No action distribution data available
                </Typography>
              )}
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              ...dashboardSurfaceSx,
              height: 380,
              display: 'flex',
              flexDirection: 'column',
              p: 2.5,
            }}
          >
            <CardHeader
              sx={{ p: 0, mb: 1.5 }}
              title="Risk Distribution"
              subheader="By severity level"
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
              subheaderTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
              avatar={
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Iconify icon="mdi:chart-donut" width={20} color="warning.main" />
                </Box>
              }
            />
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 0,
                width: '100%',
              }}
              dir="ltr"
            >
              {analytics.riskDistribution.length > 0 ? (
                <Chart
                  type="donut"
                  series={analytics.riskDistribution.map((r) => r.count)}
                  options={riskChartOptions}
                  height={260}
                  width="100%"
                />
              ) : (
                <Typography variant="caption" color="text.secondary">
                  No risk distribution data available
                </Typography>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* ── Top Entities & Users Row (50-50 Equal Sized Cards) ─────────────── */}
      <Grid container spacing={1} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              ...dashboardSurfaceSx,
              height: 340,
              display: 'flex',
              flexDirection: 'column',
              p: 2.5,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 2 }}
            >
              <Stack direction="row" alignItems="center" gap={1.25}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Iconify icon="mdi:format-list-bulleted" width={20} color="primary.main" />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Top Changed Entities
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Most frequently modified records
                  </Typography>
                </Box>
              </Stack>
              <Typography
                variant="caption"
                fontWeight={700}
                color="primary.main"
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                }}
              >
                {analytics.topEntities.length} Records
              </Typography>
            </Stack>

            <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5 }}>
              <Stack spacing={2}>
                {analytics.topEntities.map((e, i) => {
                  const max = analytics.topEntities[0]?.count || 1;
                  const pct = Math.round((e.count / max) * 100);
                  return (
                    <Box key={e.label}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 0.75 }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          noWrap
                          sx={{ maxWidth: 280 }}
                        >
                          {i + 1}. {e.label}
                        </Typography>
                        <Typography variant="caption" fontWeight={800} color="primary.main">
                          {e.count} {e.count === 1 ? 'event' : 'events'}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 7,
                          borderRadius: 4,
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.7)})`,
                          },
                        }}
                      />
                    </Box>
                  );
                })}
                {analytics.topEntities.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="caption" color="text.secondary">
                      No entities data available
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              ...dashboardSurfaceSx,
              height: 340,
              display: 'flex',
              flexDirection: 'column',
              p: 2.5,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 2 }}
            >
              <Stack direction="row" alignItems="center" gap={1.25}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Iconify icon="mdi:account-multiple-outline" width={20} color="success.main" />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Most Active Users
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Users with highest action count
                  </Typography>
                </Box>
              </Stack>
              <Typography
                variant="caption"
                fontWeight={700}
                color="success.main"
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.success.main, 0.08),
                }}
              >
                {analytics.topUsers.length} Users
              </Typography>
            </Stack>

            <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5 }}>
              <Stack spacing={1.5}>
                {analytics.topUsers.map((u, i) => (
                  <Stack
                    key={`${u.name}-${i}`}
                    direction="row"
                    alignItems="center"
                    gap={1.5}
                    sx={{
                      p: 1.25,
                      borderRadius: 2,
                      bgcolor: alpha(
                        theme.palette.background.neutral || theme.palette.action.hover,
                        0.5
                      ),
                      border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                    }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 1.5,
                        backgroundColor: alpha(theme.palette.primary.main, 0.12),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 800,
                        color: 'primary.main',
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </Box>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: 13,
                        fontWeight: 700,
                        bgcolor: alpha(theme.palette.primary.main, 0.15),
                        color: 'primary.main',
                      }}
                    >
                      {u.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        noWrap
                        sx={{ lineHeight: 1.2 }}
                      >
                        {u.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        sx={{ display: 'block' }}
                      >
                        {u.role}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        px: 1.25,
                        py: 0.5,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                      }}
                    >
                      <Typography variant="caption" fontWeight={800} color="primary.main">
                        {u.count} {u.count === 1 ? 'action' : 'actions'}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
                {analytics.topUsers.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="caption" color="text.secondary">
                      No active users data available
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* ── Suspicious Activity Alerts Card ─────────────────────────────── */}
      <Grid container spacing={1} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 12 }}>
          <Card
            sx={{
              ...dashboardSurfaceSx,
              p: 2.5,
              borderColor: alpha(theme.palette.warning.main, 0.3),
            }}
          >
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Iconify icon="mdi:shield-alert-outline" width={20} color="warning.main" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={700} color="warning.dark">
                  Suspicious Activity Alerts
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Automated security and anomaly detection
                </Typography>
              </Box>
              <Box
                sx={{
                  px: 1.25,
                  py: 0.25,
                  borderRadius: 1,
                  backgroundColor: alpha(theme.palette.warning.main, 0.12),
                }}
              >
                <Typography variant="caption" fontWeight={800} color="warning.dark">
                  {analytics.suspiciousAlerts.length} Alerts
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
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${alpha(color, 0.25)}`,
                      backgroundColor: alpha(color, 0.03),
                    }}
                  >
                    <Stack direction="row" alignItems="flex-start" gap={1.5}>
                      <Iconify
                        icon={alert.severity === 'error' ? 'mdi:alert-circle' : 'mdi:alert'}
                        width={22}
                        sx={{ color, mt: 0.2, flexShrink: 0 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ color }}>
                          {alert.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mt: 0.25, lineHeight: 1.5 }}
                        >
                          {alert.message}
                        </Typography>
                        <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 1 }}>
                          <Iconify icon="mdi:lightbulb-on-outline" width={14} color="info.main" />
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
        </Grid>
      </Grid>
    </Stack>
  );
};

export default AuditAnalyticsView;
