'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Card,
  Chip,
  Grid,
  Stack,
  Button,
  Dialog,
  Divider,
  Tooltip,
  Skeleton,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import { Academic360EmptyState } from './Academic360EmptyState';
import type { Academic360LearningTask, Academic360LearningTasks } from '../types';

type HomeworkAssignmentDashboardCardProps = {
  learningTasks?: Academic360LearningTasks;
  isLoading?: boolean;
  onViewAll?: () => void;
};

type TaskStatusCategory =
  | 'ALL'
  | 'PENDING'
  | 'LATE'
  | 'SUBMITTED'
  | 'EVALUATION_PENDING'
  | 'EVALUATED'
  | 'RESUBMISSION_REQUIRED';

type TaskStatusInfo = {
  key: TaskStatusCategory;
  label: string;
  color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  icon: string;
  priority: number;
};

function normalizeStatus(task: Academic360LearningTask): TaskStatusInfo {
  const statusStr = (task.status || '').toLowerCase().trim();
  const titleStr = (task.title || '').toLowerCase();

  if (
    task.resubmissionRequired ||
    statusStr.includes('resubmi') ||
    titleStr.includes('resubmi')
  ) {
    return {
      key: 'RESUBMISSION_REQUIRED',
      label: 'Resubmission Required',
      color: 'error',
      icon: 'mdi:keyboard-return',
      priority: 1,
    };
  }

  if (
    task.isOverdue ||
    statusStr.includes('late') ||
    statusStr.includes('overdue')
  ) {
    return {
      key: 'LATE',
      label: 'Late',
      color: 'error',
      icon: 'mdi:alert-circle-outline',
      priority: 2,
    };
  }

  if (
    statusStr.includes('evaluation') ||
    statusStr.includes('review') ||
    (statusStr === 'submitted' && (task.marks === null || task.marks === undefined))
  ) {
    return {
      key: 'EVALUATION_PENDING',
      label: 'Evaluation Pending',
      color: 'info',
      icon: 'mdi:clock-outline',
      priority: 5,
    };
  }

  if (
    statusStr.includes('evaluated') ||
    statusStr.includes('graded') ||
    (typeof task.marks === 'number' && task.marks >= 0)
  ) {
    return {
      key: 'EVALUATED',
      label: 'Evaluated',
      color: 'success',
      icon: 'mdi:check-decagram-outline',
      priority: 6,
    };
  }

  if (statusStr.includes('submitted')) {
    return {
      key: 'SUBMITTED',
      label: 'Submitted',
      color: 'success',
      icon: 'mdi:check-circle-outline',
      priority: 4,
    };
  }

  return {
    key: 'PENDING',
    label: 'Pending',
    color: 'warning',
    icon: 'mdi:timer-sand',
    priority: 3,
  };
}

function formatDueInfo(dueDateStr?: string): { text: string; isOverdue: boolean } {
  if (!dueDateStr) return { text: 'No due date', isOverdue: false };

  const parsed = new Date(dueDateStr);
  if (isNaN(parsed.getTime())) {
    return { text: dueDateStr, isOverdue: false };
  }

  const now = new Date();
  const diffMs = parsed.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const daysAgo = Math.abs(diffDays);
    return {
      text: daysAgo === 1 ? '1 day overdue' : `${daysAgo} days overdue`,
      isOverdue: true,
    };
  }

  if (diffDays === 0) {
    return { text: 'Due today', isOverdue: false };
  }

  if (diffDays === 1) {
    return { text: 'Due tomorrow', isOverdue: false };
  }

  if (diffDays <= 7) {
    return { text: `Due in ${diffDays} days`, isOverdue: false };
  }

  const day = parsed.getDate();
  const month = parsed.toLocaleString('en-US', { month: 'short' });
  return { text: `Due: ${day} ${month}`, isOverdue: false };
}

export function HomeworkAssignmentDashboardCard({
  learningTasks,
  isLoading = false,
  onViewAll,
}: HomeworkAssignmentDashboardCardProps) {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<TaskStatusCategory>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [activeTaskModal, setActiveTaskModal] = useState<Academic360LearningTask | null>(null);

  const tasks = useMemo(() => learningTasks?.recentTasks || [], [learningTasks]);

  const subjects = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.subjectName) set.add(t.subjectName);
    });
    return Array.from(set);
  }, [tasks]);

  const metrics = useMemo(() => {
    const total = learningTasks?.totalAssigned ?? tasks.length;
    const submitted = learningTasks?.submitted ?? tasks.filter((t) => {
      const st = normalizeStatus(t).key;
      return st === 'SUBMITTED' || st === 'EVALUATED' || st === 'EVALUATION_PENDING';
    }).length;

    const pending = learningTasks?.pending ?? tasks.filter((t) => normalizeStatus(t).key === 'PENDING').length;
    const late = learningTasks?.late ?? tasks.filter((t) => normalizeStatus(t).key === 'LATE').length;
    const evalPending = learningTasks?.pendingEvaluation ?? tasks.filter((t) => normalizeStatus(t).key === 'EVALUATION_PENDING').length;
    const resubmitCount = learningTasks?.resubmissionRequired ?? tasks.filter((t) => normalizeStatus(t).key === 'RESUBMISSION_REQUIRED').length;

    const submittedOnTime = learningTasks?.submittedOnTime ?? Math.max(0, submitted - late);
    const submissionRate = total > 0 ? Math.min(100, Math.round((submitted / total) * 100)) : 0;
    const onTimeRate = submitted > 0 ? Math.min(100, Math.round((submittedOnTime / submitted) * 100)) : 100;

    let healthStatus: 'ON_TRACK' | 'MONITOR' | 'NEEDS_ATTENTION' = 'ON_TRACK';
    if (late > 0 || resubmitCount > 0 || submissionRate < 60) {
      healthStatus = 'NEEDS_ATTENTION';
    } else if (submissionRate < 80 || pending > 2) {
      healthStatus = 'MONITOR';
    }

    return {
      total,
      submitted,
      pending,
      late,
      evalPending,
      resubmitCount,
      submissionRate,
      onTimeRate,
      healthStatus,
    };
  }, [learningTasks, tasks]);

  const needsAttentionTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        const st = normalizeStatus(t).key;
        return st === 'RESUBMISSION_REQUIRED' || st === 'LATE' || st === 'PENDING' || st === 'EVALUATION_PENDING';
      })
      .sort((a, b) => normalizeStatus(a).priority - normalizeStatus(b).priority)
      .slice(0, 3);
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const st = normalizeStatus(t).key;
      const matchFilter = selectedFilter === 'ALL' || st === selectedFilter;
      const matchSubject = selectedSubject === 'ALL' || t.subjectName === selectedSubject;
      return matchFilter && matchSubject;
    });
  }, [tasks, selectedFilter, selectedSubject]);

  const upcomingTasks = useMemo(() => {
    return tasks.filter((t) => {
      const st = normalizeStatus(t).key;
      const dueInfo = formatDueInfo(t.dueDate);
      return st === 'PENDING' && !dueInfo.isOverdue;
    }).slice(0, 3);
  }, [tasks]);

  const handleNavigateAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      router.push('/academic/homeworkCreation');
    }
  };

  if (isLoading) {
    return (
      <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Skeleton variant="rectangular" width={220} height={28} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: 1 }} />
          </Stack>
          <Grid container spacing={1}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Grid key={i} size={{ xs: 6, sm: 2.4 }}>
                <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
              </Grid>
            ))}
          </Grid>
          <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 1 }} />
        </Stack>
      </Card>
    );
  }

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: (theme) => theme.customShadows?.z1 || '0 1px 3px 0 rgba(0,0,0,0.05)',
      }}
    >
      <Stack spacing={2}>
        {/* CARD HEADER */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 1.5,
                display: 'grid',
                placeItems: 'center',
                bgcolor: (theme) => `${theme.palette.primary.main}14`,
                color: 'primary.main',
              }}
            >
              <Iconify icon="mdi:clipboard-text-outline" width={22} />
            </Box>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle1" fontWeight={700}>
                  Homework & Assignment
                </Typography>
                <Chip
                  size="small"
                  variant="soft"
                  color="default"
                  label={`${metrics.total} Assigned`}
                  sx={{ fontWeight: 600, height: 24 }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Academic assignment performance, submissions & pending tasks
              </Typography>
            </Box>
          </Stack>

          <Button
            size="small"
            variant="text"
            color="primary"
            endIcon={<Iconify icon="mdi:arrow-right" width={16} />}
            onClick={handleNavigateAll}
            sx={{ fontWeight: 600, textTransform: 'none' }}
          >
            View All
          </Button>
        </Stack>

        {/* SUMMARY METRICS BADGES */}
        <Grid container spacing={1}>
          <Grid size={{ xs: 6, sm: 2.4 }}>
            <Box
              sx={{
                py: 1,
                px: 1.5,
                borderRadius: 1.5,
                bgcolor: (theme) => `${theme.palette.grey[500]}12`,
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                Assigned
              </Typography>
              <Typography variant="h6" fontWeight={700} color="text.primary">
                {metrics.total}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, sm: 2.4 }}>
            <Box
              sx={{
                py: 1,
                px: 1.5,
                borderRadius: 1.5,
                bgcolor: (theme) => `${theme.palette.success.main}14`,
                color: 'success.dark',
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" fontWeight={600} display="block">
                Submitted
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {metrics.submitted}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, sm: 2.4 }}>
            <Box
              sx={{
                py: 1,
                px: 1.5,
                borderRadius: 1.5,
                bgcolor: (theme) => `${theme.palette.warning.main}14`,
                color: 'warning.dark',
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" fontWeight={600} display="block">
                Pending
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {metrics.pending}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, sm: 2.4 }}>
            <Box
              sx={{
                py: 1,
                px: 1.5,
                borderRadius: 1.5,
                bgcolor: (theme) => `${theme.palette.error.main}14`,
                color: 'error.dark',
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" fontWeight={600} display="block">
                Late
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {metrics.late}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 2.4 }}>
            <Box
              sx={{
                py: 1,
                px: 1.5,
                borderRadius: 1.5,
                bgcolor: (theme) => `${theme.palette.info.main}14`,
                color: 'info.dark',
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" fontWeight={600} display="block">
                Evaluation Pending
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {metrics.evalPending}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* SUBMISSION PROGRESS & HEALTH ROW */}
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ p: 1.5, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.neutral' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                <Typography variant="body2" fontWeight={600}>
                  Submission Progress
                </Typography>
                <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                  {metrics.total > 0 ? `${metrics.submissionRate}%` : '0%'}
                </Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={metrics.submissionRate}
                color={metrics.submissionRate >= 80 ? 'success' : metrics.submissionRate >= 50 ? 'warning' : 'error'}
                sx={{ height: 8, borderRadius: 1, mb: 0.75 }}
              />

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  {metrics.total > 0
                    ? `${metrics.submitted} of ${metrics.total} assignments submitted`
                    : 'No assignments assigned'}
                </Typography>
                {metrics.submitted > 0 && (
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    On-Time Rate: <b>{metrics.onTimeRate}%</b>
                  </Typography>
                )}
              </Stack>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor:
                  metrics.healthStatus === 'NEEDS_ATTENTION'
                    ? 'error.light'
                    : metrics.healthStatus === 'MONITOR'
                      ? 'warning.light'
                      : 'success.light',
                bgcolor:
                  metrics.healthStatus === 'NEEDS_ATTENTION'
                    ? (theme) => `${theme.palette.error.main}08`
                    : metrics.healthStatus === 'MONITOR'
                      ? (theme) => `${theme.palette.warning.main}08`
                      : (theme) => `${theme.palette.success.main}08`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5 }}>
                Assignment Health
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor:
                      metrics.healthStatus === 'NEEDS_ATTENTION'
                        ? 'error.main'
                        : metrics.healthStatus === 'MONITOR'
                          ? 'warning.main'
                          : 'success.main',
                  }}
                />
                <Typography variant="subtitle2" fontWeight={700}>
                  {metrics.healthStatus === 'NEEDS_ATTENTION'
                    ? 'Needs Attention'
                    : metrics.healthStatus === 'MONITOR'
                      ? 'Monitor'
                      : 'On Track'}
                </Typography>
              </Stack>
            </Box>
          </Grid>
        </Grid>

        <Divider />

        {/* NEEDS ATTENTION SECTION */}
        {needsAttentionTasks.length > 0 && (
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify icon="mdi:alert-circle-outline" width={18} sx={{ color: 'warning.main' }} />
              <Typography variant="subtitle2" fontWeight={700}>
                Needs Attention
              </Typography>
              <Chip
                size="small"
                color="warning"
                variant="soft"
                label={needsAttentionTasks.length}
                sx={{ height: 20, fontSize: 11, fontWeight: 700 }}
              />
            </Stack>

            <Grid container spacing={1.5}>
              {needsAttentionTasks.map((task) => {
                const statusInfo = normalizeStatus(task);
                const dueInfo = formatDueInfo(task.dueDate);

                return (
                  <Grid key={task.id || task.title} size={{ xs: 12, sm: 4 }}>
                    <Card
                      variant="outlined"
                      onClick={() => setActiveTaskModal(task)}
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        borderColor:
                          statusInfo.key === 'RESUBMISSION_REQUIRED' || statusInfo.key === 'LATE'
                            ? 'error.light'
                            : 'divider',
                        bgcolor: (theme) =>
                          statusInfo.key === 'RESUBMISSION_REQUIRED'
                            ? `${theme.palette.error.main}08`
                            : statusInfo.key === 'LATE'
                              ? `${theme.palette.error.main}04`
                              : 'background.paper',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: (theme) => theme.customShadows?.z4 || '0 2px 8px 0 rgba(0,0,0,0.1)',
                        },
                      }}
                    >
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                          <Typography variant="subtitle2" noWrap fontWeight={600}>
                            {task.title || 'Untitled Task'}
                          </Typography>
                          <Chip
                            size="small"
                            color={statusInfo.color}
                            variant="soft"
                            label={statusInfo.label}
                            sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
                          />
                        </Stack>

                        <Typography variant="caption" color="text.secondary" noWrap display="block">
                          {task.type || 'Assignment'} · {task.subjectName || 'General'}
                        </Typography>

                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography
                            variant="caption"
                            fontWeight={600}
                            color={dueInfo.isOverdue || statusInfo.key === 'LATE' ? 'error.main' : 'warning.dark'}
                          >
                            {dueInfo.text}
                          </Typography>
                          <Button size="small" variant="outlined" sx={{ py: 0.25, px: 1, minWidth: 0, fontSize: 11 }}>
                            View
                          </Button>
                        </Stack>
                      </Stack>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Stack>
        )}

        {needsAttentionTasks.length > 0 && <Divider />}

        {/* RECENT ASSIGNMENTS SECTION WITH FILTERING */}
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
            <Typography variant="subtitle2" fontWeight={700}>
              Recent Assignments
            </Typography>

            {/* LIGHTWEIGHT FILTER CHIPS / SELECT */}
            <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
              {(
                [
                  { key: 'ALL', label: 'All' },
                  { key: 'PENDING', label: 'Pending' },
                  { key: 'LATE', label: 'Late' },
                  { key: 'SUBMITTED', label: 'Submitted' },
                  { key: 'EVALUATION_PENDING', label: 'Evaluation' }
                ] as const
              ).map((f) => (
                <Chip
                  key={f.key}
                  size="small"
                  label={f.label}
                  variant={selectedFilter === f.key ? 'filled' : 'outlined'}
                  color={selectedFilter === f.key ? 'primary' : 'default'}
                  onClick={() => setSelectedFilter(f.key)}
                  sx={{
                    fontSize: 11,
                    height: 24,
                    cursor: 'pointer',
                    fontWeight: selectedFilter === f.key ? 700 : 400,
                  }}
                />
              ))}
            </Stack>
          </Stack>

          {/* ASSIGNMENT ROWS LIST */}
          {filteredTasks.length > 0 ? (
            <Scrollbar sx={{ maxHeight: 320, pr: 1 }}>
              <Stack spacing={1}>
                {filteredTasks.map((task) => {
                  const statusInfo = normalizeStatus(task);
                  const dueInfo = formatDueInfo(task.dueDate);
                  const hasMarks = typeof task.marks === 'number' && typeof task.totalMarks === 'number';
                  const percentage = hasMarks && task.totalMarks! > 0 ? Math.round((task.marks! / task.totalMarks!) * 100) : null;
                  const hasFeedback = Boolean(task.feedback && task.feedback.trim());

                  return (
                    <Box
                      key={task.id || task.title}
                      onClick={() => setActiveTaskModal(task)}
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: 'action.hover',
                          borderColor: 'primary.light',
                        },
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1.5} flexWrap="wrap">
                        {/* Left Details */}
                        <Box sx={{ minWidth: 200, flex: 1 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                              {task.title || 'Untitled Task'}
                            </Typography>
                            {hasFeedback && (
                              <Tooltip title={`Feedback: ${task.feedback}`}>
                                <Chip
                                  size="small"
                                  icon={<Iconify icon="mdi:comment-text-outline" width={12} />}
                                  label="Feedback available"
                                  color="info"
                                  variant="soft"
                                  sx={{ height: 18, fontSize: 10 }}
                                />
                              </Tooltip>
                            )}
                          </Stack>

                          <Typography variant="caption" color="text.secondary">
                            {task.type || 'Assignment'} · {task.subjectName || 'General'}
                            {' • '}
                            <Typography
                              component="span"
                              variant="caption"
                              color={dueInfo.isOverdue || statusInfo.key === 'LATE' ? 'error.main' : 'text.secondary'}
                              fontWeight={dueInfo.isOverdue ? 600 : 400}
                            >
                              {dueInfo.text}
                            </Typography>
                          </Typography>
                        </Box>

                        {/* Right Marks & Status */}
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          {hasMarks && (
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="subtitle2" fontWeight={700} color="success.dark">
                                {task.marks} / {task.totalMarks}
                              </Typography>
                              {percentage !== null && (
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                  {percentage}%
                                </Typography>
                              )}
                            </Box>
                          )}

                          <Chip
                            size="small"
                            color={statusInfo.color}
                            variant="soft"
                            icon={<Iconify icon={statusInfo.icon} width={14} />}
                            label={statusInfo.label}
                            sx={{ fontWeight: 600 }}
                          />

                          <Iconify icon="mdi:chevron-right" width={18} sx={{ color: 'text.secondary' }} />
                        </Stack>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </Scrollbar>
          ) : (
            <Academic360EmptyState
              icon="mdi:clipboard-check-outline"
              title="No assignments match filter"
              description="Try selecting a different status filter or viewing all assignments."
              compact
            />
          )}
        </Stack>

        {/* UPCOMING ASSIGNMENTS PREVIEW SECTION */}
        {upcomingTasks.length > 0 && selectedFilter === 'ALL' && (
          <>
            <Divider />
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon="mdi:calendar-clock" width={16} sx={{ color: 'info.main' }} />
                <Typography variant="subtitle2" fontWeight={700}>
                  Upcoming Assignments
                </Typography>
                <Chip size="small" variant="soft" color="info" label={upcomingTasks.length} sx={{ height: 18, fontSize: 10 }} />
              </Stack>

              <Grid container spacing={1}>
                {upcomingTasks.map((task) => {
                  const dueInfo = formatDueInfo(task.dueDate);
                  return (
                    <Grid key={task.id || task.title} size={{ xs: 12, sm: 6 }}>
                      <Box
                        onClick={() => setActiveTaskModal(task)}
                        sx={{
                          p: 1.25,
                          borderRadius: 1.5,
                          bgcolor: 'background.neutral',
                          border: '1px solid',
                          borderColor: 'divider',
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {task.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {task.subjectName || 'General'}
                            </Typography>
                          </Box>
                          <Typography variant="caption" fontWeight={600} color="primary.main">
                            {dueInfo.text}
                          </Typography>
                        </Stack>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Stack>
          </>
        )}
      </Stack>

      {/* TASK DETAIL & FEEDBACK DIALOG */}
      <Dialog
        open={Boolean(activeTaskModal)}
        onClose={() => setActiveTaskModal(null)}
        maxWidth="sm"
        fullWidth
      >
        {activeTaskModal && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {activeTaskModal.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {activeTaskModal.type || 'Assignment'} · {activeTaskModal.subjectName || 'General'}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  color={normalizeStatus(activeTaskModal).color}
                  variant="soft"
                  label={normalizeStatus(activeTaskModal).label}
                  sx={{ fontWeight: 700 }}
                />
              </Stack>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ py: 2 }}>
              <Stack spacing={2}>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Due Date
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatDueInfo(activeTaskModal.dueDate).text}
                    </Typography>
                  </Grid>

                  {typeof activeTaskModal.marks === 'number' && (
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Marks / Grade
                      </Typography>
                      <Typography variant="body2" fontWeight={700} color="success.dark">
                        {activeTaskModal.marks} / {activeTaskModal.totalMarks || 100}
                      </Typography>
                    </Grid>
                  )}
                </Grid>

                {activeTaskModal.feedback && (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: (theme) => `${theme.palette.info.main}10`,
                      border: '1px solid',
                      borderColor: 'info.light',
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Iconify icon="mdi:comment-text-outline" width={16} sx={{ color: 'info.main' }} />
                      <Typography variant="caption" fontWeight={700} color="info.dark">
                        Teacher Feedback
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.primary">
                      {activeTaskModal.feedback}
                    </Typography>
                  </Box>
                )}

                {activeTaskModal.resubmissionRequired && (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: (theme) => `${theme.palette.error.main}10`,
                      border: '1px solid',
                      borderColor: 'error.light',
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Iconify icon="mdi:alert-circle-outline" width={16} sx={{ color: 'error.main' }} />
                      <Typography variant="caption" fontWeight={700} color="error.dark">
                        Resubmission Requested
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.primary">
                      The teacher has requested corrections for this assignment. Please review and resubmit.
                    </Typography>
                  </Box>
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button variant="outlined" color="inherit" onClick={() => setActiveTaskModal(null)}>
                Close
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Iconify icon="mdi:open-in-new" />}
                onClick={() => {
                  setActiveTaskModal(null);
                  handleNavigateAll();
                }}
              >
                Go to Homework Management
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Card>
  );
}
