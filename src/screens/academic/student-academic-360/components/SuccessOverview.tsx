'use client';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Box, Card, Grid, Stack, Button, Typography, LinearProgress } from '@mui/material';

import { HealthScoreGauge } from './HealthScoreGauge';
import { Academic360EmptyState } from './Academic360EmptyState';

import type { Academic360Response } from '../types';

type SuccessOverviewProps = {
  data?: Academic360Response;
};

const severityColor = (severity?: string) => {
  if (severity === 'Urgent') return 'error';
  if (severity === 'Important') return 'warning';
  if (severity === 'Attention') return 'warning';
  return 'info';
};

const kpiIcon = (key?: string) => {
  switch (key) {
    case 'attendance':
      return 'mdi:calendar-check-outline';
    case 'homework':
    case 'homeworkCompletion':
      return 'mdi:clipboard-text-outline';
    case 'examAverage':
    case 'examResult':
      return 'mdi:trophy-outline';
    case 'academicHealth':
      return 'mdi:heart-pulse';
    default:
      return 'mdi:chart-box-outline';
  }
};

const trendColor = (trend?: string) => {
  const normalized = (trend || '').toLowerCase();
  if (normalized.includes('improv') || normalized.includes('up')) return 'success.main';
  if (normalized.includes('declin') || normalized.includes('down') || normalized.includes('drop')) return 'error.main';
  return 'text.secondary';
};

export function SuccessOverview({ data }: SuccessOverviewProps) {
  const health = data?.academicHealth;
  const alerts = data?.alerts || [];
  const upcoming = data?.upcomingItems || [];
  const achievements = data?.achievements || [];
  const completeness = data?.dataCompleteness;

  return (
    <Stack spacing={1}>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ p: 2.5, height: '100%', borderRadius: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <HealthScoreGauge score={health?.score} />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1">Academic Health</Typography>
                <Label
                  sx={{ mt: 0.5 }}
                  color={health?.score ? 'success' : 'default'}
                  variant="soft"
                >
                  {health?.status || 'Insufficient Data'}
                </Label>
              </Box>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              {health?.explanation ||
                'We need a few more attendance, homework and exam records before we can calculate this score.'}
            </Typography>
          </Card>
        </Grid>
        {(data?.kpis || []).map((kpi) => {
          const isEmpty = !kpi.displayValue || /no data/i.test(kpi.displayValue);

          return (
            <Grid key={kpi.key} size={{ xs: 12, sm: 6, md: 2 }}>
              <Card
                variant="outlined"
                sx={{
                  p: 2,
                  height: '100%',
                  borderRadius: 2,
                  ...(isEmpty && { bgcolor: 'background.neutral' }),
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: (theme) =>
                        isEmpty ? `${theme.palette.grey[500]}1F` : `${theme.palette.primary.main}14`,
                      color: isEmpty ? 'text.disabled' : 'primary.main',
                    }}
                  >
                    <Iconify icon={kpiIcon(kpi.key)} width={18} />
                  </Box>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {kpi.label}
                  </Typography>
                </Stack>
                {isEmpty ? (
                  <Typography variant="body2" sx={{ mt: 1, color: 'text.disabled' }}>
                    No data yet
                  </Typography>
                ) : (
                  <Typography variant="h5" sx={{ mt: 1 }}>{kpi.displayValue}</Typography>
                )}
                {kpi.trend && !isEmpty && (
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
                    <Iconify
                      icon={
                        trendColor(kpi.trend) === 'success.main'
                          ? 'mdi:trending-up'
                          : trendColor(kpi.trend) === 'error.main'
                            ? 'mdi:trending-down'
                            : 'mdi:trending-neutral'
                      }
                      width={14}
                      sx={{ color: trendColor(kpi.trend) }}
                    />
                    <Typography variant="caption" sx={{ color: trendColor(kpi.trend) }}>
                      {kpi.trend}
                    </Typography>
                  </Stack>
                )}
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <Iconify icon="mdi:alert-circle-outline" width={20} />
          <Typography variant="subtitle1">Attention Required</Typography>
          {alerts.length > 0 && <Label color="warning" variant="soft">{alerts.length}</Label>}
        </Stack>
        {alerts.length === 0 ? (
          <Academic360EmptyState
            icon="mdi:check-decagram-outline"
            color="success"
            title="Everything looks good"
            description="No urgent academic actions are required for this student right now. New alerts will show up here as soon as they're detected."
            compact
          />
        ) : (
          <Stack spacing={1}>
            {alerts.map((alert) => (
              <Box key={`${alert.source}-${alert.title}`} sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1.5 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} justifyContent="space-between">
                  <Box>
                    <Label color={severityColor(alert.severity)} variant="soft">{alert.severity || 'Information'}</Label>
                    <Typography variant="subtitle2" sx={{ mt: 1 }}>{alert.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{alert.message}</Typography>
                    <Typography variant="caption" color="text.secondary">{alert.evidence}</Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button size="small" variant="outlined">View Details</Button>
                    <Button size="small" variant="contained">Create Intervention</Button>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Card>

      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Today & Upcoming</Typography>
            {upcoming.length > 0 ? (
              <Stack spacing={1}>
                {upcoming.slice(0, 6).map((item) => (
                  <Stack key={`${item.type}-${item.title}-${item.date}`} direction="row" justifyContent="space-between" gap={1}>
                    <Typography variant="body2">{item.title}</Typography>
                    <Label color={item.isOverdue ? 'error' : 'default'}>{item.status || item.type}</Label>
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Academic360EmptyState
                icon="mdi:calendar-blank-outline"
                color="info"
                title="Nothing scheduled"
                description="No upcoming exams, homework or timetable activity found for this student."
                compact
              />
            )}
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Data Completeness</Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h5">{completeness?.percentage ?? 0}%</Typography>
              <Typography variant="body2" color="text.secondary">{completeness?.status || 'Limited data'}</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={completeness?.percentage || 0} sx={{ my: 1, height: 8, borderRadius: 1 }} />
            <Typography variant="caption" color="text.secondary">
              {(completeness?.missingItems || []).length > 0
                ? `Missing: ${(completeness?.missingItems || []).join(', ')}`
                : 'All expected academic records are available for this student.'}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Achievements & Positive Development</Typography>
        {achievements.length > 0 ? (
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {achievements.map((item) => (
              <Label key={`${item.source}-${item.title}`} color="success" variant="soft">{`${item.title}: ${item.description}`}</Label>
            ))}
          </Stack>
        ) : (
          <Academic360EmptyState
            icon="mdi:trophy-award"
            color="warning"
            title="No achievements recorded yet"
            description="Positive academic highlights, like strong exam results or attendance streaks, will appear here as records grow."
            compact
          />
        )}
      </Card>
    </Stack>
  );
}
