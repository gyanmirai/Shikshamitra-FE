'use client';

import type { LabelColor } from 'src/components/label';

import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import {
  Box,
  Card,
  Grid,
  Stack,
  Collapse,
  Typography,
  IconButton,
  LinearProgress,
} from '@mui/material';

import { HealthScoreGauge } from './HealthScoreGauge';
import { Academic360EmptyState } from './Academic360EmptyState';
import { SubjectPerformanceCard } from './SubjectPerformanceCard';

import type {
  Academic360Response,
  Academic360Achievement,
  Academic360UpcomingItem,
} from '../types';

type SuccessOverviewProps = {
  data?: Academic360Response;
};

const severityColor = (severity?: string): 'error' | 'warning' | 'info' => {
  const s = (severity || '').toLowerCase();
  if (s.includes('urgent') || s.includes('critical') || s.includes('high')) return 'error';
  if (s.includes('important') || s.includes('attention') || s.includes('warn')) return 'warning';
  return 'info';
};

const trendColor = (trend?: string) => {
  const normalized = (trend || '').toLowerCase();
  if (normalized.includes('improv') || normalized.includes('up')) return 'success.main';
  if (normalized.includes('declin') || normalized.includes('down') || normalized.includes('drop'))
    return 'error.main';
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

const activityStatusColor = (item: Academic360UpcomingItem): LabelColor => {
  if (
    item.isOverdue ||
    (item.status || '').toLowerCase().includes('late') ||
    (item.status || '').toLowerCase().includes('overdue')
  ) {
    return 'error';
  }
  if ((item.status || '').toLowerCase().includes('today')) return 'warning';
  if ((item.status || '').toLowerCase().includes('complete')) return 'success';
  if (
    (item.status || '').toLowerCase().includes('upcom') ||
    (item.status || '').toLowerCase().includes('avail')
  )
    return 'info';
  return 'default';
};

function AchievementCard({ item }: { item: Academic360Achievement }) {
  const icon = achievementIcon(item.source);
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.25,
        p: 1.15,
        borderRadius: 1.25,
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
          width: 28,
          height: 28,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
          bgcolor: (theme) => `${theme.palette.success.main}18`,
          color: 'success.main',
        }}
      >
        <Iconify icon={icon} width={15} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="subtitle2" fontWeight={600} noWrap sx={{ fontSize: 12 }}>
          {item.title}
        </Typography>
        {item.description && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: 11, mt: 0.25, display: 'block', lineHeight: 1.3 }}
          >
            {item.description}
          </Typography>
        )}
        {item.source && (
          <Box sx={{ mt: 0.5 }}>
            <Label
              color="success"
              variant="soft"
              sx={{ height: 18, fontSize: 10, fontWeight: 600 }}
            >
              {item.source}
            </Label>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export function SuccessOverview({ data }: SuccessOverviewProps) {
  const [isCompletenessExpanded, setIsCompletenessExpanded] = useState(true);

  const health = data?.academicHealth;
  const alerts = data?.alerts || [];
  const upcoming = data?.upcomingItems || [];
  const achievements = data?.achievements || [];
  const completeness = data?.dataCompleteness;
  const attendance = data?.attendance;
  const hasAttendanceRecords = (attendance?.totalDays ?? 0) > 0;
  const learningTasks = data?.learningTasks;
  const exams = data?.exams || [];
  const kpis = data?.kpis || [];

  // Extract KPI metrics
  const attendanceKpi = kpis.find((k) => k.key === 'attendance');
  const homeworkKpi = kpis.find((k) => k.key === 'homework' || k.key === 'homeworkCompletion');
  const examKpi = kpis.find((k) => k.key === 'examAverage' || k.key === 'examResult');

  // Consistency & Improvement factors
  const consistencyFactor = health?.factors?.find((f) => /consistency/i.test(f.label || ''));
  const improvementFactor = health?.factors?.find((f) => /improv/i.test(f.label || ''));

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
    if (
      available.some((item) => keywords.some((kw) => item.toLowerCase().includes(kw.toLowerCase())))
    ) {
      return true;
    }
    return fallbackCheck;
  };

  const completenessCategories = [
    {
      label: 'Attendance History',
      isAvailable: isItemAvailable(
        ['attendance'],
        Boolean(
          attendance?.totalDays ||
          (attendanceKpi?.displayValue && !/no data|pending/i.test(attendanceKpi.displayValue))
        )
      ),
    },
    {
      label: 'Homework & Assignments',
      isAvailable: isItemAvailable(
        ['homework', 'assignment'],
        Boolean(
          learningTasks?.totalAssigned !== undefined ||
          (homeworkKpi?.displayValue && !/no data|pending/i.test(homeworkKpi.displayValue))
        )
      ),
    },
    {
      label: 'Examination Results',
      isAvailable: isItemAvailable(
        ['exam', 'examination', 'result'],
        exams.length > 0 ||
          Boolean(examKpi?.displayValue && !/no data|pending/i.test(examKpi.displayValue))
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
        Boolean(
          data?.student?.grNo ||
          data?.student?.rollNo ||
          data?.student?.studentName ||
          data?.student?.firstName
        )
      ),
    },
  ];

  // Derive smart academic insights
  const examAvg =
    exams.length > 0
      ? Math.round(exams.reduce((acc, e) => acc + (e.percentage || 0), 0) / exams.length)
      : undefined;

  const academicInsights: Array<{
    id: string;
    icon: string;
    title: string;
    description: string;
    color: 'success' | 'warning' | 'info';
  }> = [
    {
      id: 'attendance',
      icon: 'mdi:calendar-alert-outline',
      title:
        hasAttendanceRecords && attendance?.percentage != null
          ? `Attendance: ${attendance.percentage}% (${attendance.presentDays || 0} Present)`
          : 'Attendance needs attention',
      description:
        hasAttendanceRecords && attendance?.percentage != null
          ? `${attendance.presentDays || 0} days present out of ${attendance.totalDays || 0} tracked sessions.`
          : 'No attendance records are currently available. Configure attendance to view performance.',
      color:
        attendance?.percentage !== undefined && attendance.percentage >= 75 ? 'success' : 'warning',
    },
    {
      id: 'exams',
      icon: 'mdi:chart-line-variant',
      title:
        examAvg !== undefined
          ? `Exam average: ${examAvg}%`
          : examKpi?.displayValue && !/no data/i.test(examKpi.displayValue)
            ? `Exam average: ${examKpi.displayValue}`
            : 'Examination assessment',
      description:
        exams.length > 0
          ? `Cumulative score calculated across ${exams.length} completed examination records.`
          : 'No completed examination records are available for this student.',
      color: examAvg !== undefined && examAvg >= 60 ? 'info' : 'warning',
    },
    {
      id: 'homework',
      icon: 'mdi:clipboard-check-outline',
      title: homeworkKpi?.displayValue
        ? `Homework completion: ${homeworkKpi.displayValue}`
        : 'Homework & assignments',
      description: learningTasks?.late
        ? `${learningTasks.late} assignments marked late requiring timely completion.`
        : learningTasks?.totalAssigned
          ? `${learningTasks.submitted ?? 0} of ${learningTasks.totalAssigned} assigned tasks submitted.`
          : 'No assigned homework records are available.',
      color: learningTasks?.late ? 'warning' : 'success',
    },
    {
      id: 'growth',
      icon: 'mdi:trending-up',
      title: `Academic trajectory: ${health?.trend || 'Not available'}`,
      description: health?.status
        ? consistencyFactor?.earned !== undefined
          ? `${health.status}. Consistency: ${consistencyFactor.earned}/10.`
          : `${health.status}. Consistency data is not available.`
        : 'Regular monitoring recommended across all core subjects.',
      color: 'success',
    },
  ];

  const healthScoreColor: LabelColor = health?.status?.toLowerCase().includes('support')
    ? 'warning'
    : health?.score && health.score >= 75
      ? 'success'
      : 'info';

  const completenessColor: LabelColor =
    (completeness?.percentage ?? 0) >= 80 && (completeness?.missingItems || []).length === 0
      ? 'success'
      : (completeness?.percentage ?? 0) >= 50
        ? 'warning'
        : 'error';

  return (
    <Stack spacing={1.5}>
      {/* 1. TOP ROW: COMPACT UNIFORM ACADEMIC SNAPSHOT (KPI GRID) */}
      <Grid container spacing={1.5}>
        {/* Academic Health Card */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            variant="outlined"
            sx={{
              p: 1.5,
              height: 104,
              borderRadius: 1.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              bgcolor: 'background.paper',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 1,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: (theme) => `${theme.palette.primary.main}14`,
                    color: 'primary.main',
                  }}
                >
                  <Iconify icon="mdi:heart-pulse" width={16} />
                </Box>
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color="text.secondary"
                  sx={{ fontSize: 11.5 }}
                >
                  Academic Health
                </Typography>
              </Stack>
              <HealthScoreGauge score={health?.score} size={30} thickness={4} showSubtext={false} />
            </Stack>

            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ fontSize: '1.25rem', lineHeight: 1.1 }}
              >
                {health?.score !== null && health?.score !== undefined
                  ? `${health.score}/100`
                  : 'No score'}
              </Typography>
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                <Label
                  color={healthScoreColor}
                  variant="soft"
                  sx={{ height: 18, fontSize: 10, fontWeight: 700 }}
                >
                  {health?.status || 'Monitoring'}
                </Label>
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
                      width={13}
                      sx={{ color: trendColor(health.trend) }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: trendColor(health.trend), fontSize: 10, fontWeight: 600 }}
                    >
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
              p: 1.5,
              height: 104,
              borderRadius: 1.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              bgcolor: 'background.paper',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 1,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: (theme) => `${theme.palette.info.main}14`,
                  color: 'info.main',
                }}
              >
                <Iconify icon="mdi:calendar-check-outline" width={16} />
              </Box>
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
                sx={{ fontSize: 11.5 }}
              >
                Attendance
              </Typography>
            </Stack>

            <Box>
              {hasAttendanceRecords && attendance?.percentage != null ? (
                <>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{ fontSize: '1.25rem', lineHeight: 1.1 }}
                  >
                    {attendance.percentage}%
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.5, fontSize: 11 }}
                  >
                    {attendance.presentDays ?? 0} Present · {attendance.absentDays ?? 0} Absent
                  </Typography>
                </>
              ) : attendanceKpi?.displayValue && !/no data/i.test(attendanceKpi.displayValue) ? (
                <>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{ fontSize: '1.25rem', lineHeight: 1.1 }}
                  >
                    {attendanceKpi.displayValue}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.5, fontSize: 11 }}
                  >
                    {attendanceKpi.status || 'Active record'}
                  </Typography>
                </>
              ) : (
                <>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{ fontSize: '1.25rem', lineHeight: 1.1 }}
                  >
                    No data
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ display: 'block', mt: 0.5, fontSize: 11 }}
                  >
                    No attendance records
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
              p: 1.5,
              height: 104,
              borderRadius: 1.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              bgcolor: 'background.paper',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 1,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: (theme) => `${theme.palette.warning.main}14`,
                  color: 'warning.main',
                }}
              >
                <Iconify icon="mdi:clipboard-text-outline" width={16} />
              </Box>
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
                sx={{ fontSize: 11.5 }}
              >
                Homework
              </Typography>
            </Stack>

            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ fontSize: '1.25rem', lineHeight: 1.1 }}
              >
                {homeworkKpi?.displayValue ||
                  (learningTasks?.submitted !== undefined
                    ? `${learningTasks.submitted}/${learningTasks.totalAssigned || 0}`
                    : 'No data')}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.5, fontSize: 11 }}
              >
                {learningTasks?.pending !== undefined
                  ? `${learningTasks.pending} pending · ${learningTasks.late ?? 0} late`
                  : 'No task records'}
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Examination Average Card */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            variant="outlined"
            sx={{
              p: 1.5,
              height: 104,
              borderRadius: 1.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              bgcolor: 'background.paper',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 1,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: (theme) => `${theme.palette.success.main}14`,
                  color: 'success.main',
                }}
              >
                <Iconify icon="mdi:trophy-outline" width={16} />
              </Box>
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
                sx={{ fontSize: 11.5 }}
              >
                Exam Average
              </Typography>
            </Stack>

            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ fontSize: '1.25rem', lineHeight: 1.1 }}
              >
                {examKpi?.displayValue ||
                  (exams.length > 0
                    ? `${Math.round(exams.reduce((acc, e) => acc + (e.percentage || 0), 0) / exams.length)}%`
                    : 'No data')}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.5, fontSize: 11 }}
              >
                {exams.length > 0
                  ? `${exams.length} ${exams.length === 1 ? 'exam logged' : 'exams logged'}`
                  : 'No exams logged'}
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Academic Consistency / Improvement */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            variant="outlined"
            sx={{
              p: 1.5,
              height: 104,
              borderRadius: 1.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              bgcolor: 'background.paper',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 1,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: (theme) =>
                    `${theme.palette.secondary?.main ?? theme.palette.primary.main}14`,
                  color: 'secondary.main',
                }}
              >
                <Iconify icon="mdi:trending-up" width={16} />
              </Box>
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
                sx={{ fontSize: 11.5 }}
              >
                Consistency & Growth
              </Typography>
            </Stack>

            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ fontSize: '1.25rem', lineHeight: 1.1 }}
              >
                {consistencyFactor?.earned !== undefined
                  ? `${consistencyFactor.earned}/10`
                  : 'Not available'}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.5, fontSize: 11 }}
              >
                Improvement:{' '}
                {improvementFactor?.earned !== undefined
                  ? `${improvementFactor.earned}/10`
                  : 'Not available'}
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* 2. MAIN DASHBOARD CONTENT (BALANCED TWO-COLUMN LAYOUT) */}
      <Grid container spacing={1.5} alignItems="stretch">
        {/* LEFT COLUMN: CORE ACADEMIC INSIGHTS, SUBJECTS & ANALYTICS */}
        <Grid size={{ xs: 12, md: 7.5, lg: 8 }} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Stack
            spacing={1.5}
            sx={{ height: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            {/* Academic Health Diagnostic Breakdown (Hero Section) */}
            <Card variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
              <Stack spacing={1.25}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.25,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: (theme) => `${theme.palette.primary.main}14`,
                        color: 'primary.main',
                      }}
                    >
                      <Iconify icon="mdi:scale-balance" width={18} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        Academic Health Diagnostic
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                        Weighted score factors and contribution breakdown
                      </Typography>
                    </Box>
                  </Stack>

                  <Label
                    variant="soft"
                    color={healthScoreColor}
                    startIcon={<Iconify icon="mdi:check-decagram" width={13} />}
                    sx={{ fontWeight: 600, fontSize: 11, height: 22 }}
                  >
                    {health?.status || 'Support Recommended'}
                  </Label>
                </Stack>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: 12, lineHeight: 1.4 }}
                >
                  {health?.explanation ||
                    'Weighted from attendance, homework completion, examination average, consistency, and improvement.'}
                </Typography>

                {(health?.factors || []).length > 0 ? (
                  <Grid container spacing={1.25}>
                    {/* Separate factors into standard 2x2 grid and full-width improvement */}
                    {health!.factors!.map((factor) => {
                      const max =
                        factor.maximum ||
                        (factor.label?.toLowerCase().includes('exam')
                          ? 30
                          : factor.label?.toLowerCase().includes('improv')
                            ? 10
                            : 25);
                      const earned = factor.earned ?? 0;
                      const pct = Math.round((earned / max) * 100);
                      const barColor = pct >= 75 ? 'success' : pct >= 45 ? 'warning' : 'error';
                      const isImprovement = (factor.label || '').toLowerCase().includes('improv');

                      return (
                        <Grid key={factor.label} size={{ xs: 12, sm: isImprovement ? 12 : 6 }}>
                          <Box
                            sx={{
                              p: 1.15,
                              borderRadius: 1.25,
                              bgcolor: 'background.neutral',
                              border: 1,
                              borderColor: 'divider',
                            }}
                          >
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              sx={{ mb: 0.5 }}
                            >
                              <Typography
                                variant="subtitle2"
                                fontWeight={600}
                                sx={{ fontSize: 12 }}
                              >
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
                                height: 5,
                                borderRadius: 1,
                                bgcolor: (theme) => `${theme.palette.grey[500]}1A`,
                              }}
                            />
                            {factor.evidence && (
                              <Typography
                                variant="caption"
                                color="text.disabled"
                                sx={{ fontSize: 11, mt: 0.5, display: 'block' }}
                              >
                                {factor.evidence}
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                ) : (
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: 'background.neutral',
                      borderRadius: 1.25,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Factor breakdown metrics will calibrate as daily attendance and exam marks are
                      submitted.
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Card>

            {/* Subject Performance Card (Expands to balance total column height) */}
            <Box sx={{ flex: 1, minHeight: 220, display: 'flex', flexDirection: 'column' }}>
              <SubjectPerformanceCard subjectPerformance={data?.subjectPerformance} />
            </Box>

            {/* Academic Insights Section */}
            <Card variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
              <Stack spacing={1.25}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.25,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: (theme) => `${theme.palette.info.main}14`,
                        color: 'info.main',
                      }}
                    >
                      <Iconify icon="mdi:lightbulb-on-outline" width={18} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        Academic Insights
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                        Actionable synthesis and key focal points
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>

                <Grid container spacing={1.25}>
                  {academicInsights.map((insight) => (
                    <Grid key={insight.id} size={{ xs: 12, sm: 6 }}>
                      <Box
                        sx={{
                          p: 1.15,
                          borderRadius: 1.25,
                          border: 1,
                          borderColor: 'divider',
                          bgcolor: 'background.paper',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1.25,
                        }}
                      >
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: 1,
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: (theme) => `${theme.palette[insight.color].main}14`,
                            color: `${insight.color}.main`,
                            flexShrink: 0,
                          }}
                        >
                          <Iconify icon={insight.icon} width={16} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: 12 }}>
                            {insight.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: 11, display: 'block', mt: 0.25, lineHeight: 1.3 }}
                          >
                            {insight.description}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </Card>
          </Stack>
        </Grid>

        {/* RIGHT COLUMN: COMPACT UTILITY RAIL */}
        <Grid size={{ xs: 12, md: 4.5, lg: 4 }} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Stack spacing={1.5} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* 1. Action Center */}
            <Card variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.25,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: (theme) => `${theme.palette.warning.main}14`,
                        color: 'warning.main',
                      }}
                    >
                      <Iconify icon="mdi:alert-decagram-outline" width={18} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        Action Center
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                        Items requiring immediate review
                      </Typography>
                    </Box>
                  </Stack>

                  {alerts.length > 0 && (
                    <Label
                      color="warning"
                      variant="soft"
                      sx={{ fontWeight: 700, height: 22, fontSize: 11 }}
                    >
                      {alerts.length} {alerts.length === 1 ? 'Alert' : 'Alerts'}
                    </Label>
                  )}
                </Stack>

                {alerts.length === 0 ? (
                  <Academic360EmptyState
                    icon="mdi:check-circle-outline"
                    color="success"
                    title="Everything looks good"
                    description="No urgent academic flags or overdue tasks detected."
                    compact
                  />
                ) : (
                  <Scrollbar sx={{ maxHeight: 110, pr: 0.5 }}>
                    <Stack spacing={0.75}>
                      {alerts.map((alert, idx) => {
                        const color = severityColor(alert.severity);
                        return (
                          <Box
                            key={`${alert.source}-${alert.title}-${idx}`}
                            sx={{
                              p: 1.15,
                              borderRadius: 1.25,
                              border: 1,
                              borderColor: (theme) => `${theme.palette[color].main}30`,
                              bgcolor: (theme) => `${theme.palette[color].main}06`,
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="flex-start"
                              sx={{ mb: 0.25 }}
                            >
                              <Label
                                color={color}
                                variant="soft"
                                sx={{ height: 18, fontSize: 10, fontWeight: 700 }}
                              >
                                {alert.severity || 'Important'}
                              </Label>
                              {alert.source && (
                                <Typography
                                  variant="caption"
                                  color="text.disabled"
                                  sx={{ fontSize: 10 }}
                                >
                                  {alert.source}
                                </Typography>
                              )}
                            </Stack>

                            <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: 12 }}>
                              {alert.title}
                            </Typography>
                            {alert.message && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontSize: 11, display: 'block', mt: 0.25, lineHeight: 1.3 }}
                              >
                                {alert.message}
                              </Typography>
                            )}
                            {alert.evidence && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: 'block',
                                  mt: 0.5,
                                  fontStyle: 'italic',
                                  fontSize: 10.5,
                                }}
                              >
                                • {alert.evidence}
                              </Typography>
                            )}
                          </Box>
                        );
                      })}
                    </Stack>
                  </Scrollbar>
                )}
              </Stack>
            </Card>

            {/* 2. Today & Upcoming */}
            <Card variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.25,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: (theme) => `${theme.palette.info.main}14`,
                        color: 'info.main',
                      }}
                    >
                      <Iconify icon="mdi:calendar-clock-outline" width={18} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        Today & Upcoming
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                        Assignments, exams & timetable tasks
                      </Typography>
                    </Box>
                  </Stack>

                  {upcoming.length > 0 && (
                    <Label
                      color="default"
                      variant="soft"
                      sx={{ fontWeight: 600, fontSize: 11, height: 22 }}
                    >
                      {upcoming.length} Tasks
                    </Label>
                  )}
                </Stack>

                {upcoming.length > 0 ? (
                  <Scrollbar sx={{ maxHeight: 125, pr: 0.5 }}>
                    <Stack spacing={0.75}>
                      {upcoming.map((item, idx) => {
                        const color = activityStatusColor(item);
                        const icon = activityTypeIcon(item.type || item.title);
                        const formattedDate = formatActivityDate(item.date);

                        return (
                          <Box
                            key={`${item.type}-${item.title}-${idx}`}
                            sx={{
                              p: 0.9,
                              borderRadius: 1.25,
                              border: 1,
                              borderColor: 'divider',
                              bgcolor: 'background.paper',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 1,
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              sx={{ minWidth: 0, flex: 1 }}
                            >
                              <Box
                                sx={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: 1,
                                  display: 'grid',
                                  placeItems: 'center',
                                  bgcolor: (theme) =>
                                    color === 'default'
                                      ? `${theme.palette.grey[500]}14`
                                      : `${theme.palette[color].main}14`,
                                  color: (theme) =>
                                    color === 'default'
                                      ? theme.palette.text.secondary
                                      : `${color}.main`,
                                  flexShrink: 0,
                                }}
                              >
                                <Iconify icon={icon} width={13} />
                              </Box>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography
                                  variant="subtitle2"
                                  fontWeight={600}
                                  noWrap
                                  sx={{ fontSize: 11.5 }}
                                >
                                  {item.title}
                                </Typography>
                                {item.date && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontSize: 10, display: 'block' }}
                                  >
                                    Due: {formattedDate} {item.time ? `· ${item.time}` : ''}
                                  </Typography>
                                )}
                              </Box>
                            </Stack>

                            <Label
                              color={color}
                              variant="soft"
                              sx={{ height: 18, fontSize: 9.5, fontWeight: 700, flexShrink: 0 }}
                            >
                              {item.status || item.type || 'Scheduled'}
                            </Label>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Scrollbar>
                ) : (
                  <Academic360EmptyState
                    icon="mdi:calendar-blank-outline"
                    color="info"
                    title="No upcoming activities"
                    description="No exams, assignments or timetable deadlines found."
                    compact
                  />
                )}
              </Stack>
            </Card>

            {/* 3. Growth & Highlights */}
            <Card variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.25,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: (theme) => `${theme.palette.success.main}14`,
                        color: 'success.main',
                      }}
                    >
                      <Iconify icon="mdi:trophy-award" width={18} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        Growth & Highlights
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                        Recognized milestones and strengths
                      </Typography>
                    </Box>
                  </Stack>

                  {achievements.length > 0 && (
                    <Label
                      color="success"
                      variant="soft"
                      sx={{ fontWeight: 600, fontSize: 11, height: 22 }}
                    >
                      {achievements.length} Badges
                    </Label>
                  )}
                </Stack>

                {achievements.length > 0 ? (
                  <Scrollbar sx={{ maxHeight: 115, pr: 0.5 }}>
                    <Stack spacing={0.75}>
                      {achievements.map((item, idx) => (
                        <AchievementCard key={`${item.source}-${item.title}-${idx}`} item={item} />
                      ))}
                    </Stack>
                  </Scrollbar>
                ) : (
                  <Academic360EmptyState
                    icon="mdi:trophy-outline"
                    color="warning"
                    title="No highlights recorded yet"
                    description="Academic milestones, subject strengths and attendance streaks will appear here."
                    compact
                  />
                )}
              </Stack>
            </Card>

            {/* 4. Data Completeness (Collapsible) */}
            <Card variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.25,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: (theme) => `${theme.palette.primary.main}14`,
                        color: 'primary.main',
                      }}
                    >
                      <Iconify icon="mdi:database-check-outline" width={18} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        Data Completeness
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                        Record synchronization status
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Label
                      color={completenessColor}
                      variant="soft"
                      sx={{ fontWeight: 700, fontSize: 11, height: 22 }}
                    >
                      {completeness?.percentage != null
                        ? `${completeness.percentage}%`
                        : 'Not available'}
                    </Label>
                    <IconButton
                      size="small"
                      aria-label={
                        isCompletenessExpanded
                          ? 'Collapse data completeness'
                          : 'Expand data completeness'
                      }
                      aria-expanded={isCompletenessExpanded}
                      onClick={() => setIsCompletenessExpanded((prev) => !prev)}
                      sx={{ p: 0.25, width: 24, height: 24 }}
                    >
                      <Iconify
                        icon={isCompletenessExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                        width={18}
                      />
                    </IconButton>
                  </Stack>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={completeness?.percentage ?? 0}
                  color={
                    (completeness?.percentage ?? 0) >= 80 &&
                    (completeness?.missingItems || []).length === 0
                      ? 'success'
                      : (completeness?.percentage ?? 0) >= 50
                        ? 'warning'
                        : 'error'
                  }
                  sx={{ height: 5, borderRadius: 1 }}
                />

                <Collapse in={isCompletenessExpanded}>
                  <Scrollbar sx={{ maxHeight: 95, pr: 0.5 }}>
                    <Stack spacing={0.5} sx={{ pt: 0.5 }}>
                      {completenessCategories.map((cat) => (
                        <Stack
                          key={cat.label}
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: 11,
                              color: cat.isAvailable ? 'text.secondary' : 'text.primary',
                              fontWeight: cat.isAvailable ? 400 : 500,
                            }}
                          >
                            {cat.label}
                          </Typography>
                          <Iconify
                            icon={cat.isAvailable ? 'mdi:check-circle' : 'mdi:close-circle'}
                            width={14}
                            sx={{ color: cat.isAvailable ? 'success.main' : 'error.main' }}
                          />
                        </Stack>
                      ))}
                    </Stack>
                  </Scrollbar>
                </Collapse>
              </Stack>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
