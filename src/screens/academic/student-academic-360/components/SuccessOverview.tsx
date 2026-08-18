'use client';

import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import {
  Box,
  Card,
  Grid,
  Stack,
  Typography,
  LinearProgress,
  Chip,
  Button,
} from '@mui/material';

import { Academic360EmptyState } from './Academic360EmptyState';
import { SubjectPerformanceCard } from './SubjectPerformanceCard';
import { HealthScoreGauge } from './HealthScoreGauge';

import type {
  Academic360Response,
  Academic360Achievement,
  Academic360UpcomingItem,
} from '../types';

type SuccessOverviewProps = {
  data?: Academic360Response;
};

const severityColor = (severity?: string) => {
  const s = (severity || '').toLowerCase();
  if (s.includes('urgent') || s.includes('critical') || s.includes('high')) return 'error';
  if (s.includes('important') || s.includes('attention') || s.includes('warn')) return 'warning';
  return 'info';
};

const trendColor = (trend?: string) => {
  const normalized = (trend || '').toLowerCase();
  if (normalized.includes('improv') || normalized.includes('up')) return 'success.main';
  if (normalized.includes('declin') || normalized.includes('down') || normalized.includes('drop')) return 'error.main';
  return 'text.secondary';
};

const achievementIcon = (source?: string) => {
  const s = (source || '').toLowerCase();
  if (s.includes('attend')) return 'mdi:calendar-check';
  if (s.includes('exam') || s.includes('result') || s.includes('score')) return 'mdi:trophy';
  if (s.includes('homework') || s.includes('assignment')) return 'mdi:clipboard-check';
  if (s.includes('math')) return 'mdi:calculator-variant';
  if (s.includes('eng')) return 'mdi:book-open-page-variant';
  return 'mdi:star-circle';
};

const activityTypeIcon = (type?: string) => {
  const t = (type || '').toLowerCase();
  if (t.includes('exam') || t.includes('test')) return 'mdi:file-document-edit-outline';
  if (t.includes('assign')) return 'mdi:clipboard-text-outline';
  if (t.includes('home')) return 'mdi:home-edit-outline';
  if (t.includes('proj')) return 'mdi:folder-star-outline';
  return 'mdi:calendar-clock';
};

const formatActivityDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const activityStatusColor = (item: Academic360UpcomingItem): 'error' | 'warning' | 'info' | 'success' | 'default' => {
  if (item.isOverdue || (item.status || '').toLowerCase().includes('late') || (item.status || '').toLowerCase().includes('overdue')) {
    return 'error';
  }
  if ((item.status || '').toLowerCase().includes('today')) return 'warning';
  if ((item.status || '').toLowerCase().includes('complete')) return 'success';
  if ((item.status || '').toLowerCase().includes('upcom')) return 'info';
  return 'default';
};

function AchievementCard({ item }: { item: Academic360Achievement }) {
  const icon = achievementIcon(item.source);
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        p: 1.5,
        borderRadius: 1.5,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        transition: 'all 0.15s ease',
        '&:hover': {
          bgcolor: (theme) => `${theme.palette.success.main}0A`,
          borderColor: 'success.light',
        },
      }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
          bgcolor: (theme) => `${theme.palette.success.main}18`,
          color: 'success.main',
        }}
      >
        <Iconify icon={icon} width={18} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="subtitle2" fontWeight={600} noWrap>
          {item.title}
        </Typography>
        {item.description && (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, mt: 0.25 }}>
            {item.description}
          </Typography>
        )}
        {item.source && (
          <Chip
            size="small"
            label={item.source}
            variant="soft"
            color="success"
            sx={{ mt: 0.75, height: 20, fontSize: 10, fontWeight: 600 }}
          />
        )}
      </Box>
    </Box>
  );
}

export function SuccessOverview({ data }: SuccessOverviewProps) {
  const [showAlertsExpanded, setShowAlertsExpanded] = useState(false);
  const [showAchievementsExpanded, setShowAchievementsExpanded] = useState(false);

  const health = data?.academicHealth;
  const alerts = data?.alerts || [];
  const upcoming = data?.upcomingItems || [];
  const achievements = data?.achievements || [];
  const completeness = data?.dataCompleteness;
  const attendance = data?.attendance;
  const learningTasks = data?.learningTasks;
  const exams = data?.exams || [];
  const kpis = data?.kpis || [];

  // Extract KPI metrics
  const attendanceKpi = kpis.find((k) => k.key === 'attendance');
  const homeworkKpi = kpis.find((k) => k.key === 'homework' || k.key === 'homeworkCompletion');
  const examKpi = kpis.find((k) => k.key === 'examAverage' || k.key === 'examResult');

  const displayedAlerts = showAlertsExpanded ? alerts : alerts.slice(0, 3);
  const displayedAchievements = showAchievementsExpanded ? achievements : achievements.slice(0, 3);

  // Completeness category helpers
  const isItemMissing = (keywords: string[]) => {
    const missing = completeness?.missingItems || [];
    return missing.some((item) =>
      keywords.some((kw) => item.toLowerCase().includes(kw.toLowerCase()))
    );
  };

  const isItemAvailable = (keywords: string[], fallbackCheck: boolean) => {
    if (isItemMissing(keywords)) return false;
    const available = completeness?.availableItems || [];
    if (available.some((item) => keywords.some((kw) => item.toLowerCase().includes(kw.toLowerCase())))) {
      return true;
    }
    return fallbackCheck;
  };

  const completenessCategories = [
    {
      label: 'Attendance History',
      isAvailable: isItemAvailable(
        ['attendance'],
        Boolean(attendance?.totalDays || (attendanceKpi?.displayValue && !/no data|pending/i.test(attendanceKpi.displayValue)))
      ),
    },
    {
      label: 'Homework & Assignments',
      isAvailable: isItemAvailable(
        ['homework', 'assignment'],
        Boolean(learningTasks?.totalAssigned !== undefined || (homeworkKpi?.displayValue && !/no data|pending/i.test(homeworkKpi.displayValue)))
      ),
    },
    {
      label: 'Examination Results',
      isAvailable: isItemAvailable(
        ['exam', 'examination', 'result'],
        exams.length > 0 || Boolean(examKpi?.displayValue && !/no data|pending/i.test(examKpi.displayValue))
      ),
    },
    {
      label: 'Subject Performance',
      isAvailable: isItemAvailable(
        ['subject', 'performance'],
        (data?.subjectPerformance || []).length > 0
      ),
    },
    {
      label: 'Student Profile Record',
      isAvailable: isItemAvailable(
        ['profile', 'student record'],
        Boolean(data?.student?.grNo || data?.student?.rollNo || data?.student?.studentName || data?.student?.firstName)
      ),
    },
  ];

  return (
    <Stack spacing={1}>
      {/* 1. TOP ROW: COMPACT ACADEMIC SNAPSHOT (KPI GRID) */}
      <Grid container spacing={1}>
        {/* Academic Health Card */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            variant="outlined"
            sx={{
              p: 2,
              height: '100%',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              bgcolor: 'background.paper',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: (theme) => `${theme.palette.primary.main}14`,
                    color: 'primary.main',
                  }}
                >
                  <Iconify icon="mdi:heart-pulse" width={18} />
                </Box>
                <Typography variant="caption" fontWeight={600} color="text.secondary">
                  Academic Health
                </Typography>
              </Stack>
              <HealthScoreGauge score={health?.score} size={36} thickness={4} showSubtext={false} />
            </Stack>

            <Box sx={{ mt: 1.5 }}>
              <Typography variant="h5" fontWeight={700}>
                {health?.score !== null && health?.score !== undefined ? `${health.score}/100` : 'No score'}
              </Typography>
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.5 }}>
                <Chip
                  size="small"
                  variant="soft"
                  color={
                    health?.status?.toLowerCase().includes('support')
                      ? 'warning'
                      : health?.score && health.score >= 75
                        ? 'success'
                        : 'info'
                  }
                  label={health?.status || 'Monitoring'}
                  sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
                />
                {health?.trend && (
                  <Stack direction="row" spacing={0.25} alignItems="center">
                    <Iconify
                      icon={
                        trendColor(health.trend) === 'success.main'
                          ? 'mdi:trending-up'
                          : trendColor(health.trend) === 'error.main'
                            ? 'mdi:trending-down'
                            : 'mdi:trending-neutral'
                      }
                      width={14}
                      sx={{ color: trendColor(health.trend) }}
                    />
                    <Typography variant="caption" sx={{ color: trendColor(health.trend), fontSize: 10, fontWeight: 600 }}>
                      {health.trend}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Box>
          </Card>
        </Grid>

        {/* Attendance Card */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            variant="outlined"
            sx={{
              p: 2,
              height: '100%',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              bgcolor: 'background.paper',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: (theme) => `${theme.palette.info.main}14`,
                  color: 'info.main',
                }}
              >
                <Iconify icon="mdi:calendar-check-outline" width={18} />
              </Box>
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                Attendance
              </Typography>
            </Stack>

            <Box sx={{ mt: 1.5 }}>
              {attendance?.percentage !== undefined ? (
                <>
                  <Typography variant="h5" fontWeight={700}>
                    {attendance.percentage}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                    {attendance.presentDays ?? 0} Present · {attendance.absentDays ?? 0} Absent
                  </Typography>
                </>
              ) : attendanceKpi?.displayValue && !/no data/i.test(attendanceKpi.displayValue) ? (
                <>
                  <Typography variant="h5" fontWeight={700}>
                    {attendanceKpi.displayValue}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                    {attendanceKpi.status || 'Active record'}
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="h6" color="text.disabled">
                    No data yet
                  </Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.25 }}>
                    Pending sync
                  </Typography>
                </>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Homework & Assignments Card */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            variant="outlined"
            sx={{
              p: 2,
              height: '100%',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              bgcolor: 'background.paper',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: (theme) => `${theme.palette.warning.main}14`,
                  color: 'warning.main',
                }}
              >
                <Iconify icon="mdi:clipboard-text-outline" width={18} />
              </Box>
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                Homework
              </Typography>
            </Stack>

            <Box sx={{ mt: 1.5 }}>
              <Typography variant="h5" fontWeight={700}>
                {homeworkKpi?.displayValue || (learningTasks?.submitted !== undefined ? `${learningTasks.submitted}/${learningTasks.totalAssigned || 0}` : '100%')}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                {learningTasks?.pending !== undefined
                  ? `${learningTasks.pending} pending · ${learningTasks.late ?? 0} late`
                  : '0 pending tasks'}
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Examination Average Card */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            variant="outlined"
            sx={{
              p: 2,
              height: '100%',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              bgcolor: 'background.paper',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: (theme) => `${theme.palette.success.main}14`,
                  color: 'success.main',
                }}
              >
                <Iconify icon="mdi:trophy-outline" width={18} />
              </Box>
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                Exam Average
              </Typography>
            </Stack>

            <Box sx={{ mt: 1.5 }}>
              <Typography variant="h5" fontWeight={700}>
                {examKpi?.displayValue || (exams.length > 0 ? `${Math.round(exams.reduce((acc, e) => acc + (e.percentage || 0), 0) / exams.length)}%` : 'No exams')}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                {exams.length} {exams.length === 1 ? 'exam logged' : 'exams logged'}
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Academic Consistency / Improvement */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            variant="outlined"
            sx={{
              p: 2,
              height: '100%',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              bgcolor: 'background.paper',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: (theme) => `${theme.palette.secondary?.main ?? theme.palette.primary.main}14`,
                  color: 'secondary.main',
                }}
              >
                <Iconify icon="mdi:trending-up" width={18} />
              </Box>
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                Consistency & Growth
              </Typography>
            </Stack>

            <Box sx={{ mt: 1.5 }}>
              <Typography variant="h5" fontWeight={700}>
                {health?.factors?.find((f) => /consistency/i.test(f.label || ''))?.earned !== undefined
                  ? `${health.factors.find((f) => /consistency/i.test(f.label || ''))!.earned}/10`
                  : 'Stable'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                Improvement: {health?.factors?.find((f) => /improv/i.test(f.label || ''))?.earned ?? 6}/10
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* 2. MAIN DASHBOARD CONTENT (2-COLUMN BALANCED LAYOUT) */}
      <Grid container spacing={1}>
        {/* LEFT COLUMN: CORE ACADEMIC INSIGHTS & ANALYTICS (8 COLS) */}
        <Grid size={{ xs: 12, md: 7.5, lg: 8 }}>
          <Stack spacing={1}>
            {/* Academic Health Diagnostic Breakdown */}
            <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 1.5,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: (theme) => `${theme.palette.primary.main}14`,
                        color: 'primary.main',
                      }}
                    >
                      <Iconify icon="mdi:scale-balance" width={20} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        Academic Health Diagnostic
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Weighted score factors and contribution breakdown
                      </Typography>
                    </Box>
                  </Stack>

                  <Chip
                    size="small"
                    variant="soft"
                    color={
                      health?.status?.toLowerCase().includes('support')
                        ? 'warning'
                        : health?.score && health.score >= 75
                          ? 'success'
                          : 'info'
                    }
                    icon={<Iconify icon="mdi:check-decagram" width={14} />}
                    label={health?.status || 'Data Aggregation'}
                    sx={{ fontWeight: 600, fontSize: 11 }}
                  />
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, lineHeight: 1.5 }}>
                  {health?.explanation ||
                    'Weighted aggregate derived from attendance records, homework completion, examination averages, consistency metrics, and semester improvement.'}
                </Typography>

                {(health?.factors || []).length > 0 ? (
                  <Grid container spacing={1.5} sx={{ pt: 0.5 }}>
                    {health!.factors!.map((factor) => {
                      const max = factor.maximum || 25;
                      const earned = factor.earned ?? 0;
                      const pct = Math.round((earned / max) * 100);
                      const barColor = pct >= 75 ? 'success' : pct >= 45 ? 'warning' : 'error';

                      return (
                        <Grid key={factor.label} size={{ xs: 12, sm: 6 }}>
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 1.5,
                              bgcolor: 'background.neutral',
                              border: 1,
                              borderColor: 'divider',
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                              <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: 13 }}>
                                {factor.label}
                              </Typography>
                              <Typography variant="caption" fontWeight={700} color="text.secondary">
                                {earned} / {max} ({pct}%)
                              </Typography>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={pct}
                              color={barColor}
                              sx={{
                                height: 6,
                                borderRadius: 1,
                                bgcolor: (theme) => `${theme.palette.grey[500]}1A`,
                              }}
                            />
                            {factor.evidence && (
                              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11, mt: 0.5, display: 'block' }}>
                                {factor.evidence}
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                ) : (
                  <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1.5, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Factor breakdown metrics will calibrate as daily attendance and exam marks are submitted.
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Card>

            {/* Subject Performance Card */}
            <SubjectPerformanceCard subjectPerformance={data?.subjectPerformance} />
          </Stack>
        </Grid>

        {/* RIGHT COLUMN: ACTION CENTER, UPCOMING, DATA COMPLETENESS & ACHIEVEMENTS (4 COLS) */}
        <Grid size={{ xs: 12, md: 4.5, lg: 4 }}>
          <Stack spacing={1}>
            {/* Attention Required / Action Center */}
            <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 1.5,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: (theme) => `${theme.palette.warning.main}14`,
                        color: 'warning.main',
                      }}
                    >
                      <Iconify icon="mdi:alert-decagram-outline" width={20} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        Action Center
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Items requiring immediate review
                      </Typography>
                    </Box>
                  </Stack>

                  {alerts.length > 0 && (
                    <Label color="warning" variant="soft" sx={{ fontWeight: 700 }}>
                      {alerts.length} {alerts.length === 1 ? 'Alert' : 'Alerts'}
                    </Label>
                  )}
                </Stack>

                {alerts.length === 0 ? (
                  <Academic360EmptyState
                    icon="mdi:check-circle-outline"
                    color="success"
                    title="Everything looks good"
                    description="No urgent academic flags or overdue tasks detected for this student."
                    compact
                  />
                ) : (
                  <Stack spacing={1.25}>
                    {displayedAlerts.map((alert, idx) => {
                      const color = severityColor(alert.severity);
                      return (
                        <Box
                          key={`${alert.source}-${alert.title}-${idx}`}
                          sx={{
                            p: 1.5,
                            borderRadius: 1.5,
                            border: 1,
                            borderColor: (theme) => `${theme.palette[color].main}30`,
                            bgcolor: (theme) => `${theme.palette[color].main}06`,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5 }}>
                            <Label color={color} variant="soft" sx={{ height: 20, fontSize: 10, fontWeight: 700 }}>
                              {alert.severity || 'Important'}
                            </Label>
                            {alert.source && (
                              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
                                {alert.source}
                              </Typography>
                            )}
                          </Stack>

                          <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 0.5 }}>
                            {alert.title}
                          </Typography>
                          {alert.message && (
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12, mt: 0.25 }}>
                              {alert.message}
                            </Typography>
                          )}
                          {alert.evidence && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic', fontSize: 11 }}>
                              • {alert.evidence}
                            </Typography>
                          )}
                        </Box>
                      );
                    })}

                    {alerts.length > 3 && (
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => setShowAlertsExpanded((prev) => !prev)}
                        endIcon={<Iconify icon={showAlertsExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'} />}
                        sx={{ textTransform: 'none', fontWeight: 600, alignSelf: 'center' }}
                      >
                        {showAlertsExpanded ? 'Show Less' : `View All (${alerts.length}) Alerts`}
                      </Button>
                    )}
                  </Stack>
                )}
              </Stack>
            </Card>

            {/* Today & Upcoming Academic Activities */}
            <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 1.5,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: (theme) => `${theme.palette.info.main}14`,
                        color: 'info.main',
                      }}
                    >
                      <Iconify icon="mdi:calendar-clock-outline" width={20} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        Today & Upcoming
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Assignments, exams & timetable tasks
                      </Typography>
                    </Box>
                  </Stack>

                  {upcoming.length > 0 && (
                    <Chip
                      size="small"
                      variant="soft"
                      color="default"
                      label={`${upcoming.length} Tasks`}
                      sx={{ fontWeight: 600, fontSize: 11 }}
                    />
                  )}
                </Stack>

                {upcoming.length > 0 ? (
                  <Stack
                    spacing={1}
                    sx={{
                      maxHeight: 280,
                      overflowY: 'auto',
                      pr: 0.5,
                      mr: -0.5,
                      '&::-webkit-scrollbar': {
                        width: 5,
                      },
                      '&::-webkit-scrollbar-thumb': {
                        borderRadius: 4,
                        bgcolor: (theme) => `${theme.palette.grey[500]}33`,
                      },
                    }}
                  >
                    {upcoming.map((item, idx) => {
                      const color = activityStatusColor(item);
                      const icon = activityTypeIcon(item.type || item.title);
                      const formattedDate = formatActivityDate(item.date);

                      return (
                        <Box
                          key={`${item.type}-${item.title}-${idx}`}
                          sx={{
                            p: 1.25,
                            borderRadius: 1.5,
                            border: 1,
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1.5,
                          }}
                        >
                          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                            <Box
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: 1,
                                display: 'grid',
                                placeItems: 'center',
                                bgcolor: (theme) =>
                                  color === 'default'
                                    ? `${theme.palette.grey[500]}14`
                                    : `${theme.palette[color].main}14`,
                                color: (theme) =>
                                  color === 'default' ? theme.palette.text.secondary : `${color}.main`,
                                flexShrink: 0,
                              }}
                            >
                              <Iconify icon={icon} width={16} />
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="subtitle2" fontWeight={600} noWrap sx={{ fontSize: 13 }}>
                                {item.title}
                              </Typography>
                              {item.date && (
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                                  Due: {formattedDate} {item.time ? `· ${item.time}` : ''}
                                </Typography>
                              )}
                            </Box>
                          </Stack>

                          <Label color={color} variant="soft" sx={{ height: 20, fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                            {item.status || item.type || 'Scheduled'}
                          </Label>
                        </Box>
                      );
                    })}
                  </Stack>
                ) : (
                  <Academic360EmptyState
                    icon="mdi:calendar-blank-outline"
                    color="info"
                    title="No upcoming activities"
                    description="No exams, assignments or timetable deadlines found for this student."
                    compact
                  />
                )}
              </Stack>
            </Card>

            {/* Data Completeness */}
            <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 1.5,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: (theme) => `${theme.palette.primary.main}14`,
                        color: 'primary.main',
                      }}
                    >
                      <Iconify icon="mdi:database-check-outline" width={20} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        Data Completeness
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Record synchronization status
                      </Typography>
                    </Box>
                  </Stack>

                  <Chip
                    size="small"
                    variant="soft"
                    color={
                      (completeness?.percentage ?? 80) >= 80 && (completeness?.missingItems || []).length === 0
                        ? 'success'
                        : (completeness?.percentage ?? 80) >= 50
                          ? 'warning'
                          : 'error'
                    }
                    label={`${completeness?.percentage ?? 80}%`}
                    sx={{ fontWeight: 700, fontSize: 11 }}
                  />
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={completeness?.percentage ?? 80}
                  color={
                    (completeness?.percentage ?? 80) >= 80 && (completeness?.missingItems || []).length === 0
                      ? 'success'
                      : (completeness?.percentage ?? 80) >= 50
                        ? 'warning'
                        : 'error'
                  }
                  sx={{ height: 6, borderRadius: 1 }}
                />

                <Stack spacing={0.75} sx={{ pt: 0.5 }}>
                  {completenessCategories.map((cat) => (
                    <Stack key={cat.label} direction="row" justifyContent="space-between" alignItems="center">
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: 12,
                          color: cat.isAvailable ? 'text.secondary' : 'text.primary',
                          fontWeight: cat.isAvailable ? 400 : 500,
                        }}
                      >
                        {cat.label}
                      </Typography>
                      <Iconify
                        icon={cat.isAvailable ? 'mdi:check-circle' : 'mdi:close-circle'}
                        width={16}
                        sx={{ color: cat.isAvailable ? 'success.main' : 'error.main' }}
                      />
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Card>

            {/* Student Growth & Achievements */}
            <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 1.5,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: (theme) => `${theme.palette.success.main}14`,
                        color: 'success.main',
                      }}
                    >
                      <Iconify icon="mdi:trophy-award" width={20} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        Growth & Highlights
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Recognized milestones and strengths
                      </Typography>
                    </Box>
                  </Stack>

                  {achievements.length > 0 && (
                    <Chip
                      size="small"
                      variant="soft"
                      color="success"
                      label={`${achievements.length} Badges`}
                      sx={{ fontWeight: 600, fontSize: 11 }}
                    />
                  )}
                </Stack>

                {achievements.length > 0 ? (
                  <Stack spacing={1.25}>
                    {displayedAchievements.map((item, idx) => (
                      <AchievementCard key={`${item.source}-${item.title}-${idx}`} item={item} />
                    ))}

                    {achievements.length > 3 && (
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => setShowAchievementsExpanded((prev) => !prev)}
                        endIcon={<Iconify icon={showAchievementsExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'} />}
                        sx={{ textTransform: 'none', fontWeight: 600, alignSelf: 'center' }}
                      >
                        {showAchievementsExpanded ? 'Show Less' : `View All (${achievements.length}) Highlights`}
                      </Button>
                    )}
                  </Stack>
                ) : (
                  <Academic360EmptyState
                    icon="mdi:trophy-outline"
                    color="warning"
                    title="No highlights recorded yet"
                    description="Academic milestones, subject strengths and attendance streaks will be highlighted here as records grow."
                    compact
                  />
                )}
              </Stack>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
