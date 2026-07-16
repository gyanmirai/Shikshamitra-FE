'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { Chart, useChart } from 'src/components/chart';
import { academicPaths } from 'src/constants/academic-menu';
import {
  Box,
  Grid,
  Card,
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
  useRefreshAcademicDashboardMutation,
  type PrincipalAcademicDashboardData,
  useGetPrincipalAcademicDashboardQuery,
} from 'src/redux/academicAPI/academicDashboardApi';

import { PerformersList } from '../AcademicDashboard/Components/Performers';
import AcademicDashboardExams from '../dashboard/components/AcademicDashboardExams';
import SubjectPassFailChart from '../AcademicDashboard/Components/SubjectPassFailChart';
import ChapterCompletionChart from '../AcademicDashboard/Components/ChapterCompletionChart';
import TeacherPerformanceComparisonChart from '../AcademicDashboard/Components/TeacherPerformanceComparisonChart';
import { AcademicActionQueue } from '../components/command-center/AcademicActionQueue';
import { AcademicCommandHeader } from '../components/command-center/AcademicCommandHeader';
import { AcademicHealthScoreCard } from '../components/command-center/AcademicHealthScoreCard';
import { AcademicModuleHealthGrid } from '../components/command-center/AcademicModuleHealthGrid';

import type {
  AcademicActionItem,
  AcademicModuleHealthItem,
} from '../components/command-center/types';

const formatCount = (value?: number | null) => new Intl.NumberFormat('en-IN').format(value || 0);

const toPrincipalActions = (data: PrincipalAcademicDashboardData): AcademicActionItem[] =>
  data.insights.map((insight, index) => ({
    id: `principal-insight-${index}`,
    title: insight.title,
    summary: insight.summary,
    severity: insight.severity,
    source: insight.source,
    actionLabel: insight.actionLabel,
    actionHref: insight.actionHref,
  }));

const toPrincipalModuleHealth = (data: PrincipalAcademicDashboardData): AcademicModuleHealthItem[] => [
  {
    id: 'school-performance',
    module: 'School Performance',
    status: `${data.schoolAverageGrade} average grade`,
    progress: data.schoolPerformanceIndex,
    tone: data.schoolPerformanceIndex >= 80 ? 'success' : 'warning',
    icon: 'mdi:chart-line',
    href: academicPaths.examination.reports,
  },
  {
    id: 'syllabus',
    module: 'Syllabus Coverage',
    status: `${data.syllabusProgress}% complete`,
    progress: data.syllabusProgress,
    tone: data.syllabusProgress >= 80 ? 'success' : 'warning',
    icon: 'mdi:book-open-page-variant-outline',
    href: academicPaths.curriculum.chaptersManagement,
  },
  {
    id: 'assessment',
    module: 'Assessment Readiness',
    status: `${data.readinessRate}% ready`,
    progress: data.readinessRate,
    tone: data.readinessRate >= 85 ? 'success' : 'warning',
    icon: 'mdi:file-document-check-outline',
    href: academicPaths.examination.recordMarks,
  },
  {
    id: 'attendance',
    module: 'Attendance Health',
    status: data.averageAttendance,
    progress: Number.parseFloat(data.averageAttendance) || 0,
    tone: Number.parseFloat(data.averageAttendance) >= 90 ? 'success' : 'warning',
    icon: 'mdi:calendar-check-outline',
    href: academicPaths.studentAcademic360,
  },
];

type TopSummaryTone = 'primary' | 'success' | 'info' | 'warning' | 'error' | 'secondary';

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

const SchoolAcademicSnapshotCard = ({ data }: { data: PrincipalAcademicDashboardData }) => {
  const theme = useTheme();
  const { schoolPerformanceIndex } = data;

  const schoolChartOptions = useChart({
    labels: ['Completed', 'Target Remaining'],
    colors: [theme.palette.primary.main, theme.palette.info.main],
    stroke: { width: 0 },
    legend: { show: false },
    tooltip: { y: { formatter: (value: number) => `${value}%` } },
    plotOptions: {
      pie: {
        donut: {
          size: '74%',
          labels: {
            show: false,
          },
        },
      },
    },
  });

  return (
    <DashboardSectionCard
      title="School Academic Summary"
      subheader="Macro school performance & size"
      height="100%"
      minHeight={236}
    >
      <Stack spacing={1}>
        <Stack
          direction={{ xs: 'column', sm: 'row', lg: 'column', xl: 'row' }}
          spacing={1}
          alignItems="center"
        >
          <Box
            sx={{
              width: { xs: '100%', sm: 170, lg: '100%', xl: 170 },
              height: 158,
              position: 'relative',
              display: 'grid',
              placeItems: 'center',
              borderRadius: 1,
              bgcolor: (muiTheme) => alpha(muiTheme.palette.primary.main, 0.035),
              border: (muiTheme) => `1px solid ${alpha(muiTheme.palette.primary.main, 0.14)}`,
            }}
          >
            <Chart
              type="donut"
              series={[schoolPerformanceIndex, 100 - schoolPerformanceIndex]}
              options={schoolChartOptions}
              sx={{ width: 138, height: 138 }}
            />
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                pointerEvents: 'none',
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ lineHeight: 1 }}>
                  {data.schoolAverageGrade}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Avg Grade
                </Typography>
              </Box>
            </Box>
          </Box>

          <Stack spacing={1} sx={{ width: 1, minWidth: 0 }}>
            <CommandMetricRow
              label="Avg Student Attendance"
              value={data.averageAttendance}
              helper={`${data.averageAttendance} present overall`}
              icon="solar:users-group-two-rounded-bold"
              tone="success"
            />
            <CommandMetricRow
              label="Total Teachers"
              value={formatCount(data.totalTeachers)}
              helper="48 teaching staff"
              icon="solar:graduation-cap-bold"
              tone="primary"
            />
          </Stack>
        </Stack>

        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TopMetricTile
              label="Total Students"
              value={formatCount(data.totalStudents)}
              helper="12 standards"
              icon="solar:users-group-two-rounded-bold"
              tone="info"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TopMetricTile
              label="Performance Index"
              value={`${schoolPerformanceIndex} / 100`}
              helper={data.performanceIndexHelper}
              icon="solar:chart-square-bold"
              tone="secondary"
            />
          </Grid>
        </Grid>
      </Stack>
    </DashboardSectionCard>
  );
};

const SyllabusCoveragePulseCard = ({ data }: { data: PrincipalAcademicDashboardData }) => {
  const { syllabusProgress } = data;

  return (
    <DashboardSectionCard
      title="Syllabus & Coverage Pulse"
      subheader="Overall curriculum progress vs schedule"
      height="100%"
      minHeight={236}
      action={
        <Button component={Link} href={academicPaths.curriculum.chaptersManagement} size="small">
          View Tracker
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
                Curriculum Syllabus Progress
              </Typography>
              <Typography variant="h2" sx={{ lineHeight: 1 }}>
                {syllabusProgress}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                On Track across scholastic courses
              </Typography>
            </Box>
            <Chip label="On Track" color="success" size="small" sx={{ fontWeight: 700 }} />
          </Stack>

          <Box sx={{ mt: 1.5 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
              <Typography variant="caption" color="text.secondary">
                Completion progress
              </Typography>
              <Typography variant="caption" fontWeight={700}>
                {syllabusProgress}%
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
              <Box sx={{ width: `${syllabusProgress}%`, height: 1, bgcolor: 'success.main' }} />
            </Box>
          </Box>
        </Box>

        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 6, xl: 4 }}>
            <CommandMetricRow
              label="Math Syllabus"
              value={`${data.mathProgress}%`}
              helper={`Target: ${data.mathTarget}%`}
              icon="solar:book-bold"
              tone="primary"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, xl: 4 }}>
            <CommandMetricRow
              label="Science Syllabus"
              value={`${data.scienceProgress}%`}
              helper={`Target: ${data.scienceTarget}%`}
              icon="solar:book-bookmark-bold"
              tone="warning"
              emphasis={data.scienceProgress < data.scienceTarget}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, xl: 4 }}>
            <CommandMetricRow
              label="English Syllabus"
              value={`${data.englishProgress}%`}
              helper={`Target: ${data.englishTarget}%`}
              icon="solar:book-open-bold"
              tone="info"
            />
          </Grid>
        </Grid>
      </Stack>
    </DashboardSectionCard>
  );
};

const PrincipalReadinessCard = ({ data }: { data: PrincipalAcademicDashboardData }) => {
  const { readinessRate } = data;

  return (
    <DashboardSectionCard
      title="Evaluation & Exam Readiness"
      subheader="Macro assessment progress"
      height="100%"
      minHeight={236}
    >
      <Stack spacing={1}>
        <Box
          component={Link}
          href={academicPaths.examination.recordMarks}
          sx={{
            p: 1.5,
            borderRadius: 1,
            color: 'text.primary',
            textDecoration: 'none',
            bgcolor: (theme) => alpha(theme.palette.success.main, 0.06),
            border: (theme) => `1px solid ${alpha(theme.palette.success.main, 0.18)}`,
          }}
        >
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" spacing={1}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Assessment Compile
                </Typography>
                <Typography variant="h3" sx={{ lineHeight: 1.05 }}>
                  Grades Compiled
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 1,
                  display: 'grid',
                  placeItems: 'center',
                  color: 'success.main',
                  bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                  flexShrink: 0,
                }}
              >
                <Iconify icon="solar:clipboard-check-bold" width={24} />
              </Box>
            </Stack>

            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Grade entry compiled
                </Typography>
                <Typography variant="caption" fontWeight={700}>
                  {readinessRate}%
                </Typography>
              </Stack>
              <Box
                sx={{
                  height: 8,
                  borderRadius: 1,
                  bgcolor: (theme) => alpha(theme.palette.success.main, 0.13),
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: `${readinessRate}%`,
                    height: 1,
                    bgcolor: 'success.main',
                  }}
                />
              </Box>
            </Box>
          </Stack>
        </Box>

        <Grid container spacing={1}>
          <Grid size={{ xs: 6 }}>
            <TopMetricTile
              label="Evaluation Lag"
              value={data.evaluationLag}
              icon="solar:clock-circle-bold"
              tone="info"
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TopMetricTile
              label="Upcoming Exams"
              value={formatCount(data.upcomingExams)}
              icon="solar:medal-star-linear"
              tone="secondary"
            />
          </Grid>
        </Grid>
      </Stack>
    </DashboardSectionCard>
  );
};

const PrincipalInsightsCard = ({ data }: { data: PrincipalAcademicDashboardData }) => (
  <DashboardSectionCard
    title="Smart Principal Insights & Alerts"
    subheader="School performance & compliance notifications"
    height="100%"
    minHeight={180}
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
        <Skeleton variant="rounded" height={180} />
      </Grid>
    </Grid>
    <Grid container spacing={1}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Grid key={index} size={{ xs: 12, md: 6 }}>
          <Skeleton variant="rounded" height={300} />
        </Grid>
      ))}
    </Grid>
  </Stack>
);

const AcademicPrincipalDashboardScreen = () => {
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClasses] = useState<string>('');

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const { data, isLoading, isFetching, isError, refetch } = useGetPrincipalAcademicDashboardQuery();
  const [refresh, { isLoading: isRefreshing }] = useRefreshAcademicDashboardMutation();

  const handleRefresh = async () => {
    try {
      await refresh().unwrap();
      refetch();
    } catch {
      // Ignored fallback
    }
  };

  useEffect(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  const topPerformersData = [
    {
      id: '1',
      name: 'Priya Patel',
      avatarUrl: '/static/images/avatars/avatar_1.png',
      totalMarks: 98,
    },
    {
      id: '2',
      name: 'Raj Kumar',
      avatarUrl: '/static/images/avatars/avatar_2.png',
      totalMarks: 95,
    },
    {
      id: '3',
      name: 'Meera Singh',
      avatarUrl: '/static/images/avatars/avatar_3.png',
      totalMarks: 92,
    },
  ];

  const bottomPerformersData = [
    {
      id: '1',
      name: 'Rohan Singh',
      avatarUrl: '/static/images/avatars/avatar_4.png',
      totalMarks: 45,
    },
    {
      id: '2',
      name: 'Sneha Kumari',
      avatarUrl: '/static/images/avatars/avatar_5.png',
      totalMarks: 42,
    },
    {
      id: '3',
      name: 'Vijay Pratap',
      avatarUrl: '/static/images/avatars/avatar_6.png',
      totalMarks: 38,
    },
  ];

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Principal Dashboard
        </Typography>
        <DashboardSkeleton />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Principal academic dashboard data could not be loaded.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pb: 2 }}>
      <AcademicCommandHeader
        eyebrow="Principal View"
        title="School Academic Command Center"
        description="Track school quality, weak areas, student risk and academic readiness before issues become visible late."
        lastUpdatedLabel="Macro academic overview"
        isBusy={isRefreshing || isFetching}
        onRefresh={handleRefresh}
        actions={[
          { label: 'Student 360', href: academicPaths.studentAcademic360, icon: 'mdi:account-school-outline' },
          { label: 'Curriculum', href: academicPaths.curriculum.chaptersManagement, icon: 'solar:book-open-linear' },
          {
            label: 'Timetables',
            href: academicPaths.timetable.management,
            icon: 'solar:calendar-linear',
            variant: 'contained',
          },
        ]}
      />

      {isRefreshing || isFetching ? <LinearProgress /> : null}

      <Grid container spacing={1} alignItems="stretch">
        <Grid size={{ xs: 12, lg: 4 }}>
          <AcademicHealthScoreCard
            title="School Academic Health"
            score={Math.round((data.schoolPerformanceIndex + data.syllabusProgress + data.readinessRate) / 3)}
            status={data.readinessRate >= 85 && data.syllabusProgress >= 80 ? 'Healthy' : 'Needs Attention'}
            description="Combines performance index, syllabus progress and assessment readiness."
            factors={[
              { label: 'Performance', value: `${data.schoolPerformanceIndex}`, tone: 'success' },
              { label: 'Attendance', value: data.averageAttendance, tone: 'info' },
              { label: 'Syllabus', value: `${data.syllabusProgress}%`, tone: 'warning' },
              { label: 'Readiness', value: `${data.readinessRate}%`, tone: 'success' },
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <AcademicActionQueue
            title="Leadership Attention Queue"
            subtitle="School-level academic signals requiring follow-up"
            items={toPrincipalActions(data)}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <AcademicModuleHealthGrid items={toPrincipalModuleHealth(data)} />
        </Grid>
      </Grid>

      {/* Snapshot Cards */}
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <SchoolAcademicSnapshotCard data={data} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <SyllabusCoveragePulseCard data={data} />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <PrincipalReadinessCard data={data} />
        </Grid>
      </Grid>

      {/* Smart Alerts & Insights */}
      <Grid container spacing={1}>
        <Grid size={{ xs: 12 }}>
          <PrincipalInsightsCard data={data} />
        </Grid>
      </Grid>

      {/* Charts & Detail Grid */}
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChapterCompletionChart chartData={data.chapterCompletionChart} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SubjectPassFailChart chartData={data.subjectPassFailChart} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TeacherPerformanceComparisonChart chartData={data.teacherPerformanceComparison} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <AcademicDashboardExams list={data.upcomingExamsList} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <PerformersList
            title="Top Performers"
            list={
              data.topPerformers && data.topPerformers.length > 0
                ? data.topPerformers
                : topPerformersData
            }
            type="top"
            sx={{ height: '100%' }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <PerformersList
            title="Bottom Performers"
            list={
              data.bottomPerformers && data.bottomPerformers.length > 0
                ? data.bottomPerformers
                : bottomPerformersData
            }
            type="bottom"
            sx={{ height: '100%' }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AcademicPrincipalDashboardScreen;
