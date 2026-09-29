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
  academicDashboardApi,
  type PrincipalAcademicDashboardOverviewData,
  type PrincipalAcademicDashboardCurriculumData,
  type PrincipalAcademicDashboardOperationsData,
  type PrincipalAcademicDashboardPerformanceData,
} from 'src/redux/academicAPI/academicDashboardApi';

import { AcademicActionQueue } from '../components/command-center/AcademicActionQueue';
import { AcademicCommandHeader } from '../components/command-center/AcademicCommandHeader';
import { DashboardSectionState } from '../AcademicDashboard/Components/DashboardSectionState';
import { AcademicHealthScoreCard } from '../components/command-center/AcademicHealthScoreCard';
import { AcademicModuleHealthGrid } from '../components/command-center/AcademicModuleHealthGrid';
import { DeferredDashboardSection } from '../AcademicDashboard/Components/DeferredDashboardSection';
import { usePrincipalAcademicDashboardSections } from './hooks/usePrincipalAcademicDashboardSections';

import type {
  AcademicActionItem,
  AcademicModuleHealthItem,
} from '../components/command-center/types';

const formatCount = (value?: number | null) => new Intl.NumberFormat('en-IN').format(value || 0);

const PrincipalDetails = dynamic(() => import('./Components/PrincipalDetails'), {
  loading: () => <Skeleton variant="rounded" height={390} />,
});

const toPrincipalActions = (data: PrincipalAcademicDashboardOperationsData): AcademicActionItem[] =>
  data.insights.map((insight, index) => ({
    id: `principal-insight-${index}`,
    title: insight.title,
    summary: insight.summary,
    severity: insight.severity,
    source: insight.source,
    actionLabel: insight.actionLabel,
    actionHref: insight.actionHref,
  }));

const toPrincipalModuleHealth = (
  data: PrincipalAcademicDashboardOverviewData
): AcademicModuleHealthItem[] => [
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

const SchoolAcademicSnapshotCard = ({
  data,
}: {
  data: PrincipalAcademicDashboardPerformanceData;
}) => {
  const { schoolPerformanceIndex } = data;

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
            <Box
              role="img"
              aria-label={`${schoolPerformanceIndex} out of 100 school performance index`}
              sx={{
                width: 138,
                height: 138,
                borderRadius: '50%',
                background: (muiTheme) =>
                  `conic-gradient(${muiTheme.palette.primary.main} 0 ${Math.max(0, Math.min(100, schoolPerformanceIndex))}%, ${alpha(muiTheme.palette.info.main, 0.2)} ${Math.max(0, Math.min(100, schoolPerformanceIndex))}% 100%)`,
                display: 'grid',
                placeItems: 'center',
                '&::after': {
                  content: '""',
                  width: 102,
                  height: 102,
                  borderRadius: '50%',
                  bgcolor: 'background.paper',
                },
              }}
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

const SyllabusCoveragePulseCard = ({
  data,
}: {
  data: PrincipalAcademicDashboardCurriculumData;
}) => {
  const { syllabusProgress } = data;
  const hasSubjectBreakdown =
    data.mathTarget > 0 || data.scienceTarget > 0 || data.englishTarget > 0;

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

        {hasSubjectBreakdown ? (
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
        ) : (
          <EmptyContent
            filled
            title="Subject-level progress is not configured"
            description="The overall syllabus score is available. Subject targets will appear after they are configured."
            sx={{ minHeight: 132 }}
            slotProps={{ img: { maxWidth: 72 } }}
          />
        )}
      </Stack>
    </DashboardSectionCard>
  );
};

const PrincipalReadinessCard = ({ data }: { data: PrincipalAcademicDashboardOperationsData }) => {
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

const PrincipalInsightsCard = ({ data }: { data: PrincipalAcademicDashboardOperationsData }) => (
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

const AcademicPrincipalDashboardScreen = ({
  supportsSections = false,
}: {
  supportsSections?: boolean;
}) => {
  const dispatch = useDispatch();
  const {
    legacy,
    performance,
    curriculum,
    operations,
    performanceData,
    curriculumData,
    operationsData,
    data,
    isFetching,
    retryAll,
  } = usePrincipalAcademicDashboardSections(supportsSections);

  const handleRefresh = () => {
    dispatch(academicDashboardApi.util.invalidateTags([academicType.academicReport]));
  };

  if (!supportsSections && legacy.isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Principal Dashboard
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
          Principal academic dashboard data could not be loaded.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pb: 2 }}>
      <AcademicCommandHeader
        title="School Academic Command Center"
        description="Track school quality, weak areas, student risk and academic readiness before issues become visible late."
        isBusy={isFetching}
        onRefresh={handleRefresh}
        actions={[
          {
            label: 'Student 360',
            href: academicPaths.studentAcademic360,
            icon: 'mdi:account-school-outline',
          },
          {
            label: 'Curriculum',
            href: academicPaths.curriculum.chaptersManagement,
            icon: 'solar:book-open-linear',
          },
          {
            label: 'Timetables',
            href: academicPaths.timetable.management,
            icon: 'solar:calendar-linear',
            variant: 'contained',
          },
        ]}
      />

      {isFetching ? <LinearProgress /> : null}

      <Grid container spacing={1} alignItems="stretch">
        <Grid size={{ xs: 12, lg: 4 }}>
          <DashboardSectionState
            dataAvailable={Boolean(data)}
            isLoading={performance.isLoading || curriculum.isLoading || operations.isLoading}
            isError={performance.isError || curriculum.isError || operations.isError}
            onRetry={retryAll}
            height={260}
          >
            {data ? (
              <AcademicHealthScoreCard
                title="School Academic Health"
                score={Math.round(
                  (data.schoolPerformanceIndex + data.syllabusProgress + data.readinessRate) / 3
                )}
                status={
                  data.readinessRate >= 85 && data.syllabusProgress >= 80
                    ? 'Healthy'
                    : 'Needs Attention'
                }
                description="Combines performance index, syllabus progress and assessment readiness."
                factors={[
                  {
                    label: 'Performance',
                    value: `${data.schoolPerformanceIndex}`,
                    tone: 'success',
                  },
                  { label: 'Attendance', value: data.averageAttendance, tone: 'info' },
                  { label: 'Syllabus', value: `${data.syllabusProgress}%`, tone: 'warning' },
                  { label: 'Readiness', value: `${data.readinessRate}%`, tone: 'success' },
                ]}
              />
            ) : null}
          </DashboardSectionState>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <DashboardSectionState
            dataAvailable={Boolean(operationsData)}
            isLoading={supportsSections ? operations.isLoading : legacy.isLoading}
            isError={supportsSections ? operations.isError : legacy.isError}
            onRetry={supportsSections ? operations.refetch : legacy.refetch}
            height={260}
          >
            {operationsData ? (
              <AcademicActionQueue
                title="Leadership Attention Queue"
                subtitle="School-level academic signals requiring follow-up"
                items={toPrincipalActions(operationsData)}
              />
            ) : null}
          </DashboardSectionState>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <DashboardSectionState
            dataAvailable={Boolean(data)}
            isLoading={performance.isLoading || curriculum.isLoading || operations.isLoading}
            isError={performance.isError || curriculum.isError || operations.isError}
            onRetry={retryAll}
            height={260}
          >
            {data ? <AcademicModuleHealthGrid items={toPrincipalModuleHealth(data)} /> : null}
          </DashboardSectionState>
        </Grid>
      </Grid>

      {/* Snapshot Cards */}
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <DashboardSectionState
            dataAvailable={Boolean(performanceData)}
            isLoading={supportsSections ? performance.isLoading : legacy.isLoading}
            isError={supportsSections ? performance.isError : legacy.isError}
            onRetry={supportsSections ? performance.refetch : legacy.refetch}
          >
            {performanceData ? <SchoolAcademicSnapshotCard data={performanceData} /> : null}
          </DashboardSectionState>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <DashboardSectionState
            dataAvailable={Boolean(curriculumData)}
            isLoading={supportsSections ? curriculum.isLoading : legacy.isLoading}
            isError={supportsSections ? curriculum.isError : legacy.isError}
            onRetry={supportsSections ? curriculum.refetch : legacy.refetch}
          >
            {curriculumData ? <SyllabusCoveragePulseCard data={curriculumData} /> : null}
          </DashboardSectionState>
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <DashboardSectionState
            dataAvailable={Boolean(operationsData)}
            isLoading={supportsSections ? operations.isLoading : legacy.isLoading}
            isError={supportsSections ? operations.isError : legacy.isError}
            onRetry={supportsSections ? operations.refetch : legacy.refetch}
          >
            {operationsData ? <PrincipalReadinessCard data={operationsData} /> : null}
          </DashboardSectionState>
        </Grid>
      </Grid>

      {/* Smart Alerts & Insights */}
      <Grid container spacing={1}>
        <Grid size={{ xs: 12 }}>
          <DashboardSectionState
            dataAvailable={Boolean(operationsData)}
            isLoading={supportsSections ? operations.isLoading : legacy.isLoading}
            isError={supportsSections ? operations.isError : legacy.isError}
            onRetry={supportsSections ? operations.refetch : legacy.refetch}
            height={180}
          >
            {operationsData ? <PrincipalInsightsCard data={operationsData} /> : null}
          </DashboardSectionState>
        </Grid>
      </Grid>

      <DeferredDashboardSection>
        <PrincipalDetails legacyAnalytics={supportsSections ? undefined : legacy.data} />
      </DeferredDashboardSection>
    </Box>
  );
};

export default AcademicPrincipalDashboardScreen;
