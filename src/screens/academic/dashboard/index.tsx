'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useDispatch } from 'react-redux';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { academicType } from 'src/redux/tagTypes';
import { EmptyContent } from 'src/components/empty-content';
import { academicPaths } from 'src/constants/academic-menu';
import {
  Box,
  Card,
  Grid,
  Chip,
  Stack,
  Alert,
  Button,
  Skeleton,
  Typography,
  CardHeader,
  LinearProgress,
} from '@mui/material';
import {
  academicDashboardApi,
  type AcademicDashboardClassAssignment,
  type TeacherAcademicDashboardOverviewData,
  type TeacherAcademicDashboardAttentionData,
  type TeacherAcademicDashboardAssessmentData,
  type TeacherAcademicDashboardAssignmentsData,
} from 'src/redux/academicAPI/academicDashboardApi';

import { AcademicActionQueue } from '../components/command-center/AcademicActionQueue';
import { AcademicCommandHeader } from '../components/command-center/AcademicCommandHeader';
import { TodayAcademicTimeline } from '../components/today-timeline/TodayAcademicTimeline';
import { DashboardSectionState } from '../AcademicDashboard/Components/DashboardSectionState';
import { AcademicHealthScoreCard } from '../components/command-center/AcademicHealthScoreCard';
import { AcademicModuleHealthGrid } from '../components/command-center/AcademicModuleHealthGrid';
import { useTeacherAcademicDashboardSections } from './hooks/useTeacherAcademicDashboardSections';
import { DeferredDashboardSection } from '../AcademicDashboard/Components/DeferredDashboardSection';

import type {
  AcademicActionItem,
  AcademicModuleHealthItem,
} from '../components/command-center/types';

const DeferredTeacherDetails = dynamic(() => import('./components/DeferredTeacherDetails'), {
  loading: () => <Skeleton variant="rounded" height={390} />,
});

type TopSummaryTone = 'primary' | 'success' | 'info' | 'warning' | 'error' | 'secondary';

const formatCount = (value?: number | null) => new Intl.NumberFormat('en-IN').format(value || 0);

const toActionSeverity = (severity?: string): AcademicActionItem['severity'] => {
  if (severity === 'critical') {
    return 'critical';
  }
  if (severity === 'warning') {
    return 'warning';
  }
  return 'info';
};

const toTeacherActions = (
  data: Pick<
    TeacherAcademicDashboardOverviewData,
    'actionCenterItems' | 'pendingTasks' | 'insights'
  >
): AcademicActionItem[] => [
  ...(data.actionCenterItems || []).map((item) => ({
    id: `academic-action-${item.id}`,
    title: item.title,
    summary: `${formatCount(item.count)} pending - ${item.summary}`,
    severity: toActionSeverity(item.severity),
    source: item.source,
    actionLabel: item.actionLabel,
    actionHref: item.actionHref,
  })),
  ...data.insights.map((insight, index) => ({
    id: `teacher-insight-${index}`,
    title: insight.title,
    summary: insight.summary,
    severity: toActionSeverity(insight.severity),
    source: insight.source,
    actionLabel: insight.actionLabel,
    actionHref: insight.actionHref,
  })),
  ...data.pendingTasks.slice(0, 3).map((task) => ({
    id: `task-${task.id}`,
    title: task.title,
    summary: `${formatCount(task.count)} item${task.count === 1 ? '' : 's'} pending`,
    severity:
      task.priority === 'high'
        ? ('critical' as const)
        : task.priority === 'medium'
          ? ('warning' as const)
          : ('info' as const),
    source: 'teacher-workbench',
    actionLabel: task.action,
    actionHref: task.path,
  })),
];

const toTeacherModuleHealth = (
  data: TeacherAcademicDashboardOverviewData
): AcademicModuleHealthItem[] => [
  {
    id: 'lectures',
    module: 'Today Lectures',
    status: `${data.lecturesDone}/${data.todaysLecturesCount} completed`,
    progress: data.todaysLecturesCount
      ? Math.round((data.lecturesDone / data.todaysLecturesCount) * 100)
      : 0,
    tone: data.pendingAttendanceClasses > 0 ? 'warning' : 'success',
    icon: 'mdi:calendar-clock-outline',
    href: academicPaths.timetable.management,
  },
  {
    id: 'attendance',
    module: 'Attendance',
    status: `${data.pendingAttendanceClasses} pending classes`,
    progress: data.attendanceRate,
    tone: data.pendingAttendanceClasses > 0 ? 'warning' : 'success',
    icon: 'mdi:calendar-check-outline',
    href: academicPaths.timetable.management,
  },
  {
    id: 'evaluation',
    module: 'Evaluation',
    status: `${data.pendingEvaluations} pending reviews`,
    progress: data.evaluationsRate,
    tone: data.pendingEvaluations > 0 ? 'warning' : 'success',
    icon: 'mdi:clipboard-check-outline',
    href: academicPaths.homework.assessment,
  },
  {
    id: 'students',
    module: 'Student Attention',
    status: `${data.studentsAttentionCount} students need review`,
    progress: Math.max(0, 100 - data.studentsAttentionCount * 5),
    tone: data.studentsAttentionCount > 0 ? 'error' : 'success',
    icon: 'mdi:account-alert-outline',
    href: academicPaths.studentAcademic360,
  },
  ...(data.readinessItems || []).slice(0, 4).map((item) => ({
    id: `readiness-${item.key}`,
    module: item.title,
    status:
      item.missingCount > 0
        ? `${formatCount(item.missingCount)} missing`
        : `${formatCount(item.completedCount)} ready`,
    progress: item.totalCount ? Math.round((item.completedCount / item.totalCount) * 100) : 0,
    tone:
      item.severity === 'critical'
        ? ('error' as const)
        : item.severity === 'warning'
          ? ('warning' as const)
          : ('success' as const),
    icon: 'mdi:clipboard-check-outline',
    href: item.actionHref,
  })),
];

const getToneMain = (theme: any, tone: TopSummaryTone) => {
  if (tone === 'primary') return theme.palette.primary.main;
  if (tone === 'success') return theme.palette.success.main;
  if (tone === 'info') return theme.palette.info.main;
  if (tone === 'warning') return theme.palette.warning.main;
  if (tone === 'error') return theme.palette.error.main;
  if (tone === 'secondary') return theme.palette.secondary.main;
  return theme.palette.info.main;
};

const getToneContrast = (theme: any, tone: TopSummaryTone) => {
  if (tone === 'primary') return theme.palette.primary.dark || theme.palette.primary.main;
  if (tone === 'success') return theme.palette.success.dark || theme.palette.success.main;
  if (tone === 'info') return theme.palette.info.dark || theme.palette.info.main;
  if (tone === 'warning') return theme.palette.warning.dark || theme.palette.warning.main;
  if (tone === 'error') return theme.palette.error.dark || theme.palette.error.main;
  if (tone === 'secondary') return theme.palette.secondary.dark || theme.palette.secondary.main;
  return theme.palette.info.main;
};

const dashboardSurfaceSx = {
  bgcolor: 'background.paper',
  boxShadow: (theme: any) => `0 8px 20px ${alpha(theme.palette.common.black, 0.08)}`,
  border: (theme: any) => `1px solid ${theme.palette.divider}`,
};

const DashboardSectionCard = ({
  title,
  subheader,
  action,
  minHeight,
  height,
  contentSx,
  children,
}: {
  title: string;
  subheader?: string;
  action?: React.ReactNode;
  minHeight?: number | string;
  height?: number | string;
  contentSx?: any;
  children: React.ReactNode;
}) => (
  <Card
    sx={{
      height,
      minHeight,
      p: 2,
      overflow: 'visible',
      position: 'relative',
      ...dashboardSurfaceSx,
    }}
  >
    <CardHeader sx={{ p: 0, mb: 1.5 }} title={title} subheader={subheader} action={action} />
    <Box sx={contentSx}>{children}</Box>
  </Card>
);

const TopMetricTile = ({
  label,
  value,
  icon,
  helper,
  tone = 'primary',
  href,
  onClick,
}: {
  label: string;
  value: string | number;
  icon: string;
  helper?: string;
  tone?: TopSummaryTone;
  href?: string;
  onClick?: () => void;
}) => {
  const tileSx = {
    width: '100%',
    p: 1.25,
    minHeight: 86,
    borderRadius: 1,
    textAlign: 'left' as const,
    color: 'text.primary',
    textDecoration: 'none',
    bgcolor: (theme: any) => alpha(getToneMain(theme, tone), 0.06),
    border: (theme: any) => `1px solid ${alpha(getToneMain(theme, tone), 0.18)}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    cursor: href || onClick ? 'pointer' : 'default',
    transition: (theme: any) =>
      theme.transitions.create(['background-color', 'border-color', 'transform'], {
        duration: theme.transitions.duration.shorter,
      }),
    ...(href || onClick
      ? {
          '&:hover': {
            transform: 'translateY(-1px)',
            bgcolor: (theme: any) => alpha(getToneMain(theme, tone), 0.1),
            borderColor: (theme: any) => alpha(getToneMain(theme, tone), 0.28),
          },
        }
      : {}),
  };

  const content = (
    <>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', fontWeight: 700, lineHeight: 1.2 }}
          noWrap
        >
          {label}
        </Typography>
        <Typography variant="h5" sx={{ mt: 0.25, lineHeight: 1.08 }}>
          {value}
        </Typography>
        {helper ? (
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
            {helper}
          </Typography>
        ) : null}
      </Box>
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: 1,
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          color: (theme: any) => getToneMain(theme, tone),
          bgcolor: (theme: any) => alpha(getToneMain(theme, tone), 0.1),
        }}
      >
        <Iconify icon={icon} width={19} />
      </Box>
    </>
  );

  if (href) {
    return (
      <Box component={Link} href={href} sx={tileSx}>
        {content}
      </Box>
    );
  }

  if (onClick) {
    return (
      <Box component="button" type="button" onClick={onClick} sx={tileSx}>
        {content}
      </Box>
    );
  }

  return <Box sx={tileSx}>{content}</Box>;
};

const CommandMetricRow = ({
  label,
  value,
  icon,
  tone = 'primary',
  helper,
  emphasis = false,
}: {
  label: string;
  value: string | number;
  icon: string;
  tone?: TopSummaryTone;
  helper?: string;
  emphasis?: boolean;
}) => (
  <Box
    sx={{
      px: 1.25,
      py: 1,
      borderRadius: 1,
      bgcolor: (theme: any) => alpha(getToneMain(theme, tone), emphasis ? 0.1 : 0.045),
      border: (theme: any) =>
        `1px solid ${alpha(getToneMain(theme, tone), emphasis ? 0.26 : 0.14)}`,
    }}
  >
    <Stack direction="row" spacing={1} alignItems="center">
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: 1,
          display: 'grid',
          placeItems: 'center',
          color: (theme: any) => getToneMain(theme, tone),
          bgcolor: (theme: any) => alpha(getToneMain(theme, tone), 0.1),
          flexShrink: 0,
        }}
      >
        <Iconify icon={icon} width={17} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: emphasis ? 700 : 600 }} noWrap>
          {label}
        </Typography>
        {helper ? (
          <Typography variant="caption" color="text.secondary" noWrap>
            {helper}
          </Typography>
        ) : null}
      </Box>
      <Typography
        variant="h6"
        sx={{ lineHeight: 1, color: (theme: any) => getToneContrast(theme, tone) }}
      >
        {value}
      </Typography>
    </Stack>
  </Box>
);

const TeacherAssignmentSnapshotCard = ({
  data,
  alertCount,
}: {
  data: TeacherAcademicDashboardAssignmentsData;
  alertCount?: number;
}) => {
  const hasAssignments = data.assignedClassesCount > 0 || data.assignedSubjectsCount > 0;

  return (
    <DashboardSectionCard
      title="Teaching Assignment"
      subheader="Classes, subjects and academic follow-up"
      height="100%"
      minHeight={236}
      action={
        <Button component={Link} href={academicPaths.timetable.management} size="small">
          Timetable
        </Button>
      }
    >
      {hasAssignments ? (
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TopMetricTile
              label="Assigned Classes"
              value={`${data.assignedClassesCount} Grades`}
              helper={`Across ${data.assignedSubjectsCount} subjects`}
              icon="solar:book-bookmark-bold"
              tone="info"
              href={academicPaths.curriculum.chaptersManagement}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TopMetricTile
              label="System Alerts"
              value={alertCount === undefined ? '—' : formatCount(alertCount)}
              helper="Action required"
              icon="solar:bell-bing-bold"
              tone="error"
            />
          </Grid>
        </Grid>
      ) : (
        <EmptyContent
          filled
          title="No teaching assignment"
          description="Assigned classes and subjects will appear here."
          sx={{ minHeight: 168 }}
          slotProps={{ img: { maxWidth: 88 } }}
        />
      )}
    </DashboardSectionCard>
  );
};

const TeacherEvaluationsPulseCard = ({
  data,
  pendingHomework,
}: {
  data: TeacherAcademicDashboardAssessmentData;
  pendingHomework?: number;
}) => {
  const { evaluationsRate } = data;

  return (
    <DashboardSectionCard
      title="Evaluations & Homework Pulse"
      subheader="Grading & feedback status"
      height="100%"
      minHeight={236}
      action={
        <Button component={Link} href={academicPaths.homework.assessment} size="small">
          Evaluations
        </Button>
      }
    >
      <Stack spacing={1}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1,
            bgcolor: (theme) => alpha(theme.palette.success.main, 0.07),
            border: (theme) => `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                Grading Completeness Ratio
              </Typography>
              <Typography variant="h2" sx={{ lineHeight: 1 }}>
                {evaluationsRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatCount(data.pendingEvaluations)} pending review evaluations
              </Typography>
            </Box>
            <Chip label="On Track" color="success" size="small" sx={{ fontWeight: 700 }} />
          </Stack>

          <Box sx={{ mt: 1.5 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
              <Typography variant="caption" color="text.secondary">
                Grading Progress
              </Typography>
              <Typography variant="caption" fontWeight={700}>
                {evaluationsRate}%
              </Typography>
            </Stack>
            <Box
              sx={{
                height: 10,
                borderRadius: 1,
                overflow: 'hidden',
                bgcolor: (theme) => alpha(theme.palette.success.main, 0.14),
              }}
            >
              <Box sx={{ width: `${evaluationsRate}%`, height: 1, bgcolor: 'success.main' }} />
            </Box>
          </Box>
        </Box>

        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 6, xl: 4 }}>
            <CommandMetricRow
              label="Pending Homework"
              value={pendingHomework === undefined ? '—' : formatCount(pendingHomework)}
              helper="Due soon"
              icon="solar:notebook-bookmark-bold"
              tone="warning"
              emphasis={pendingHomework !== undefined && pendingHomework > 0}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, xl: 4 }}>
            <CommandMetricRow
              label="Pending Evaluations"
              value={formatCount(data.pendingEvaluations)}
              helper="HW & Assignments"
              icon="solar:clipboard-check-bold"
              tone="info"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, xl: 4 }}>
            <CommandMetricRow
              label="Upcoming Exams"
              value={formatCount(data.upcomingExams)}
              helper="In next 2 days"
              icon="solar:medal-star-bold"
              tone="secondary"
            />
          </Grid>
        </Grid>
      </Stack>
    </DashboardSectionCard>
  );
};

const TeacherStudentAttentionCard = ({ data }: { data: TeacherAcademicDashboardAttentionData }) => (
  <DashboardSectionCard
    title="Student Performance"
    subheader="Attention & class summary"
    height="100%"
    minHeight={236}
  >
    <Stack spacing={1}>
      <Box
        sx={{
          p: 1.5,
          borderRadius: 1,
          color: 'text.primary',
          textDecoration: 'none',
          bgcolor: (theme) => alpha(theme.palette.error.main, 0.06),
          border: (theme) => `1px solid ${alpha(theme.palette.error.main, 0.18)}`,
        }}
      >
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between" spacing={1}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                Support Needed
              </Typography>
              <Typography variant="h3" sx={{ lineHeight: 1.05 }}>
                {formatCount(data.studentsAttentionCount)} Students
              </Typography>
            </Box>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1,
                display: 'grid',
                placeItems: 'center',
                color: 'error.main',
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                flexShrink: 0,
              }}
            >
              <Iconify icon="solar:danger-circle-bold" width={24} />
            </Box>
          </Stack>

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              Low attendance or critical performance drop
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Grid container spacing={1}>
        <Grid size={{ xs: 12 }}>
          <TopMetricTile
            label="Students Attention"
            value={`${data.studentsAttentionCount} Students`}
            icon="solar:danger-circle-bold"
            tone="error"
          />
        </Grid>
      </Grid>
    </Stack>
  </DashboardSectionCard>
);

const TeacherInsightsCard = ({ data }: { data: TeacherAcademicDashboardAttentionData }) => (
  <DashboardSectionCard
    title="Smart Teacher Insights & Alerts"
    subheader="Actionable alerts regarding student performance & teaching deliverables"
    height="100%"
    minHeight={200}
  >
    <Stack spacing={1}>
      {data.insights.map((insight, index) => (
        <Box
          key={`${insight.source}-${index}`}
          sx={{
            p: 1.5,
            borderRadius: 1,
            bgcolor: 'background.neutral',
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'stretch', sm: 'flex-start' }}
            justifyContent="space-between"
            spacing={1}
          >
            <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ minWidth: 0 }}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: 1,
                  display: 'grid',
                  placeItems: 'center',
                  color: (theme: any) =>
                    insight.severity === 'critical'
                      ? theme.palette.error.main
                      : insight.severity === 'warning'
                        ? theme.palette.warning.main
                        : theme.palette.info.main,
                  bgcolor: (theme: any) =>
                    alpha(
                      insight.severity === 'critical'
                        ? theme.palette.error.main
                        : insight.severity === 'warning'
                          ? theme.palette.warning.main
                          : theme.palette.info.main,
                      0.08
                    ),
                  flexShrink: 0,
                }}
              >
                <Iconify
                  icon={
                    insight.severity === 'critical'
                      ? 'solar:danger-triangle-bold'
                      : 'solar:info-circle-bold'
                  }
                  width={18}
                />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2">{insight.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {insight.summary}
                </Typography>
              </Box>
            </Stack>
            {insight.actionHref ? (
              <Button
                component={Link}
                href={insight.actionHref}
                size="small"
                variant="text"
                sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, flexShrink: 0 }}
              >
                {insight.actionLabel || 'Open'}
              </Button>
            ) : null}
          </Stack>
        </Box>
      ))}
    </Stack>
  </DashboardSectionCard>
);

const DashboardSkeleton = () => (
  <Stack spacing={1}>
    <Grid container spacing={1}>
      {Array.from({ length: 3 }).map((_, index) => (
        <Grid key={index} size={{ xs: 12, lg: index === 1 ? 5 : index === 2 ? 3 : 4 }}>
          <Skeleton variant="rounded" height={260} />
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={1}>
      <Grid size={{ xs: 12 }}>
        <Skeleton variant="rounded" height={200} />
      </Grid>
    </Grid>
    <Grid container spacing={1}>
      <Grid size={{ xs: 12 }}>
        <Skeleton variant="rounded" height={100} />
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <Skeleton variant="rounded" height={320} />
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <Skeleton variant="rounded" height={320} />
      </Grid>
    </Grid>
  </Stack>
);

type AcademicTeacherDashboardScreenProps = {
  mode?: 'teacher' | 'classTeacher';
  classAssignments?: AcademicDashboardClassAssignment[];
  supportsSections?: boolean;
};

const AcademicTeacherDashboardScreen = ({
  mode = 'teacher',
  classAssignments = [],
  supportsSections = false,
}: AcademicTeacherDashboardScreenProps) => {
  const dispatch = useDispatch();
  const {
    legacy,
    assignments,
    assessment,
    attention,
    assignmentData,
    assessmentData,
    attentionData,
    actionData,
    data,
    isFetching,
    retryAll,
  } = useTeacherAcademicDashboardSections(supportsSections);

  const handleRefresh = () => {
    dispatch(
      academicDashboardApi.util.invalidateTags([
        academicType.academicReport,
        academicType.lessonPlan,
      ])
    );
  };

  if (!supportsSections && legacy.isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Teacher Dashboard
        </Typography>
        <DashboardSkeleton />
      </Box>
    );
  }

  if (!supportsSections && (legacy.isError || !legacy.data)) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={retryAll}>
              Retry
            </Button>
          }
        >
          Teacher academic dashboard data could not be loaded.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pb: 2 }}>
      <AcademicCommandHeader
        title={
          mode === 'classTeacher' ? 'My Class Academic Workbench' : 'Teacher Academic Workbench'
        }
        description={
          mode === 'classTeacher'
            ? 'Track your class, today’s teaching timeline, academic follow-ups and students needing attention.'
            : 'See today’s classes, pending academic work, student risks and the next best action without searching.'
        }
        isBusy={isFetching}
        onRefresh={handleRefresh}
        actions={[
          {
            label: 'Student 360',
            href: academicPaths.studentAcademic360,
            icon: 'mdi:account-school-outline',
          },
          {
            label: 'Add Homework',
            href: academicPaths.homework.learningTasks,
            icon: 'solar:notebook-linear',
          },
          {
            label: 'Record Marks',
            href: academicPaths.examination.recordMarks,
            icon: 'solar:clipboard-text-linear',
            variant: 'contained',
          },
        ]}
      />

      {isFetching ? <LinearProgress /> : null}

      <Grid container spacing={1} alignItems="stretch">
        <Grid size={{ xs: 12, lg: 4 }}>
          <DashboardSectionState
            dataAvailable={Boolean(data)}
            isLoading={assignments.isLoading || assessment.isLoading || attention.isLoading}
            isError={assignments.isError || assessment.isError || attention.isError}
            onRetry={retryAll}
            height={260}
          >
            {data ? (
              <AcademicHealthScoreCard
                title="My Academic Health"
                score={Math.round(
                  (data.evaluationsRate + Math.max(0, 100 - data.studentsAttentionCount * 5)) / 2
                )}
                status={
                  data.studentsAttentionCount > 0 || data.pendingEvaluations > 0
                    ? 'Needs Attention'
                    : 'Healthy'
                }
                description="Combines evaluation progress and the current student-attention workload."
                factors={[
                  {
                    label: 'Classes',
                    value: `${data.assignedClassesCount} assigned`,
                    tone: 'info',
                  },
                  {
                    label: 'Subjects',
                    value: `${data.assignedSubjectsCount} assigned`,
                    tone: 'success',
                  },
                  { label: 'Evaluation', value: `${data.evaluationsRate}%`, tone: 'warning' },
                  {
                    label: 'Students',
                    value: `${data.studentsAttentionCount} alerts`,
                    tone: 'error',
                  },
                ]}
              />
            ) : null}
          </DashboardSectionState>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <DashboardSectionState
            dataAvailable={Boolean(actionData)}
            isLoading={assessment.isLoading || attention.isLoading}
            isError={assessment.isError || attention.isError}
            onRetry={retryAll}
            height={260}
          >
            {actionData ? (
              <AcademicActionQueue
                title="Today Action Queue"
                subtitle="Teaching, evaluation and student follow-up work"
                items={toTeacherActions(actionData)}
              />
            ) : null}
          </DashboardSectionState>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <DashboardSectionState
            dataAvailable={Boolean(data)}
            isLoading={assignments.isLoading || assessment.isLoading || attention.isLoading}
            isError={assignments.isError || assessment.isError || attention.isError}
            onRetry={retryAll}
            height={260}
          >
            {data ? <AcademicModuleHealthGrid items={toTeacherModuleHealth(data)} /> : null}
          </DashboardSectionState>
        </Grid>
      </Grid>

      {/* Snapshot Cards */}
      <Grid container spacing={1}>
        <Grid size={{ xs: 12 }}>
          <TodayAcademicTimeline
            contextLabel={
              mode === 'classTeacher' && classAssignments.length > 0
                ? `${classAssignments.map((assignment) => assignment.displayName).join(', ')} · Timetable and lesson-plan progress`
                : undefined
            }
          />
        </Grid>
      </Grid>

      <Grid container spacing={1}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <DashboardSectionState
            dataAvailable={Boolean(assignmentData)}
            isLoading={supportsSections ? assignments.isLoading : legacy.isLoading}
            isError={supportsSections ? assignments.isError : legacy.isError}
            onRetry={supportsSections ? assignments.refetch : legacy.refetch}
          >
            {assignmentData ? (
              <TeacherAssignmentSnapshotCard
                data={assignmentData}
                alertCount={assessmentData?.systemAlertsCount}
              />
            ) : null}
          </DashboardSectionState>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <DashboardSectionState
            dataAvailable={Boolean(assessmentData)}
            isLoading={supportsSections ? assessment.isLoading : legacy.isLoading}
            isError={supportsSections ? assessment.isError : legacy.isError}
            onRetry={supportsSections ? assessment.refetch : legacy.refetch}
          >
            {assessmentData ? (
              <TeacherEvaluationsPulseCard
                data={assessmentData}
                pendingHomework={assignmentData?.pendingHomework}
              />
            ) : null}
          </DashboardSectionState>
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <DashboardSectionState
            dataAvailable={Boolean(attentionData)}
            isLoading={supportsSections ? attention.isLoading : legacy.isLoading}
            isError={supportsSections ? attention.isError : legacy.isError}
            onRetry={supportsSections ? attention.refetch : legacy.refetch}
          >
            {attentionData ? <TeacherStudentAttentionCard data={attentionData} /> : null}
          </DashboardSectionState>
        </Grid>
      </Grid>

      {/* Smart Alerts & Insights */}
      <Grid container spacing={1}>
        <Grid size={{ xs: 12 }}>
          <DashboardSectionState
            dataAvailable={Boolean(attentionData)}
            isLoading={supportsSections ? attention.isLoading : legacy.isLoading}
            isError={supportsSections ? attention.isError : legacy.isError}
            onRetry={supportsSections ? attention.refetch : legacy.refetch}
            height={200}
          >
            {attentionData ? <TeacherInsightsCard data={attentionData} /> : null}
          </DashboardSectionState>
        </Grid>
      </Grid>

      <DeferredDashboardSection>
        {data ? (
          <DeferredTeacherDetails
            data={data}
            legacyAnalytics={supportsSections ? undefined : legacy.data}
          />
        ) : (
          <Skeleton variant="rounded" height={390} />
        )}
      </DeferredDashboardSection>
    </Box>
  );
};

export default AcademicTeacherDashboardScreen;
