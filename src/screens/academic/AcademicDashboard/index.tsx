'use client';

import React from 'react';
import Link from 'next/link';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { Chart, useChart } from 'src/components/chart';
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
  type AdminAcademicDashboardData,
  useGetAdminAcademicDashboardQuery,
  useRefreshAcademicDashboardMutation,
} from 'src/redux/academicAPI/academicDashboardApi';

import RecentActivities from './Components/RecentActivities';
import OperationalStatus from './Components/OperationalStatus';
import ConfigurationStatus from './Components/ConfigurationStatus';
import SubjectPassFailChart from './Components/SubjectPassFailChart';
import PlannedVsActualProgressChart from './Components/PlannedVsActualProgressChart';
import { AcademicActionQueue } from '../components/command-center/AcademicActionQueue';
import { AcademicCommandHeader } from '../components/command-center/AcademicCommandHeader';
import { AcademicHealthScoreCard } from '../components/command-center/AcademicHealthScoreCard';
import { AcademicModuleHealthGrid } from '../components/command-center/AcademicModuleHealthGrid';

import type {
  AcademicActionItem,
  AcademicModuleHealthItem,
} from '../components/command-center/types';

const formatCount = (value?: number | null) => new Intl.NumberFormat('en-IN').format(value || 0);

const getPercent = (value: number, total: number) =>
  total > 0 ? Math.round((value / total) * 100) : 0;

const toActionQueue = (data: AdminAcademicDashboardData): AcademicActionItem[] => [
  ...data.insights.map((insight, index) => ({
    id: `insight-${index}`,
    title: insight.title,
    summary: insight.summary,
    severity: insight.severity,
    source: insight.source,
    actionLabel: insight.actionLabel,
    actionHref: insight.actionHref,
  })),
  ...(data.conflictsCount > 0
    ? [
        {
          id: 'timetable-conflicts',
          title: `${data.conflictsCount} timetable conflict${data.conflictsCount > 1 ? 's' : ''} need review`,
          summary: 'Resolve teacher, room or lecture overlap before the next working day.',
          severity: 'critical' as const,
          source: 'timetable',
          actionLabel: 'Resolve',
          actionHref: academicPaths.timetable.management,
        },
      ]
    : []),
];

const toModuleHealth = (data: AdminAcademicDashboardData): AcademicModuleHealthItem[] => [
  {
    id: 'curriculum',
    module: 'Curriculum',
    status: `${data.curriculumCompletion}% completion`,
    progress: data.curriculumCompletion,
    tone: data.curriculumCompletion >= 80 ? 'success' : 'warning',
    icon: 'mdi:book-open-page-variant-outline',
    href: academicPaths.curriculum.chaptersManagement,
  },
  {
    id: 'timetable',
    module: 'Timetable',
    status: `${data.activeTimetables} active | ${data.pendingTimetables} pending`,
    progress: data.timetableRate,
    tone: data.conflictsCount > 0 ? 'error' : data.timetableRate >= 80 ? 'success' : 'warning',
    icon: 'mdi:calendar-clock-outline',
    href: academicPaths.timetable.management,
  },
  {
    id: 'homework',
    module: 'Homework Evaluation',
    status: `${formatCount(data.pendingEvaluations)} pending`,
    progress: Math.max(0, 100 - data.pendingEvaluations),
    tone: data.pendingEvaluations > 20 ? 'warning' : 'success',
    icon: 'mdi:clipboard-check-outline',
    href: academicPaths.homework.assessment,
  },
  {
    id: 'examination',
    module: 'Examination',
    status: `${formatCount(data.pendingGradeEntries)} grade entries pending`,
    progress: data.readinessRate,
    tone: data.pendingGradeEntries > 0 ? 'warning' : 'success',
    icon: 'mdi:file-document-edit-outline',
    href: academicPaths.examination.recordMarks,
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

const CurriculumSnapshotCard = ({ data }: { data: AdminAcademicDashboardData }) => {
  const theme = useTheme();
  const curriculumPercentage = data.curriculumCompletion;

  const curriculumChartOptions = useChart({
    labels: ['Completed', 'Pending'],
    colors: [theme.palette.success.main, theme.palette.warning.main],
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
      title="Curriculum & Class Composition"
      subheader="Syllabus & student status"
      height="100%"
      minHeight={236}
      action={
        <Button component={Link} href={academicPaths.curriculum.chaptersManagement} size="small">
          Curriculum
        </Button>
      }
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
              bgcolor: (muiTheme) => alpha(muiTheme.palette.success.main, 0.035),
              border: (muiTheme) => `1px solid ${alpha(muiTheme.palette.success.main, 0.14)}`,
            }}
          >
            <Chart
              type="donut"
              series={[curriculumPercentage, 100 - curriculumPercentage]}
              options={curriculumChartOptions}
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
                  {curriculumPercentage}%
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Completed
                </Typography>
              </Box>
            </Box>
          </Box>

          <Stack spacing={1} sx={{ width: 1, minWidth: 0 }}>
            <CommandMetricRow
              label="Total Students"
              value={formatCount(data.totalStudents)}
              helper="Across 12 classes"
              icon="solar:users-group-two-rounded-bold"
              tone="primary"
            />
            <CommandMetricRow
              label="Total Teachers"
              value={formatCount(data.totalTeachers)}
              helper="48 teaching staff"
              icon="solar:graduation-cap-bold"
              tone="success"
            />
          </Stack>
        </Stack>

        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TopMetricTile
              label="Assigned Subjects"
              value={formatCount(data.assignedSubjects)}
              helper="Core & electives"
              icon="solar:book-bookmark-bold"
              tone="info"
              href={academicPaths.curriculum.subjectsAssignment}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TopMetricTile
              label="Elective Groups"
              value={formatCount(data.electiveGroups)}
              helper={`${formatCount(data.pendingElectiveGroups)} pending setup`}
              icon="solar:users-group-two-rounded-bold"
              tone="warning"
              href={academicPaths.curriculum.settings.electiveGroupCreation}
            />
          </Grid>
        </Grid>
      </Stack>
    </DashboardSectionCard>
  );
};

const TimetablePulseCard = ({ data }: { data: AdminAcademicDashboardData }) => {
  const { timetableRate } = data;

  return (
    <DashboardSectionCard
      title="Timetable & Operations Pulse"
      subheader="Operational scheduling status"
      height="100%"
      minHeight={236}
      action={
        <Button
          component={Link}
          href={academicPaths.timetable.management}
          size="small"
          startIcon={<Iconify icon="solar:calendar-mark-linear" />}
        >
          Timetables
        </Button>
      }
    >
      <Stack spacing={1}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1,
            bgcolor: (theme) => alpha(theme.palette.info.main, 0.07),
            border: (theme) => `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
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
                Timetable Setup Progress
              </Typography>
              <Typography variant="h2" sx={{ lineHeight: 1 }}>
                {timetableRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatCount(data.activeTimetables)} of{' '}
                {formatCount(data.activeTimetables + data.pendingTimetables)} classes configured
              </Typography>
            </Box>
            <Button
              component={Link}
              href={academicPaths.timetable.management}
              variant="contained"
              size="small"
              startIcon={<Iconify icon="solar:play-circle-bold" />}
              sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, flexShrink: 0 }}
            >
              Configure Setup
            </Button>
          </Stack>

          <Box sx={{ mt: 1.5 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
              <Typography variant="caption" color="text.secondary">
                Completeness progress
              </Typography>
              <Typography variant="caption" fontWeight={700}>
                {timetableRate}%
              </Typography>
            </Stack>
            <Box
              sx={{
                height: 10,
                borderRadius: 1,
                overflow: 'hidden',
                bgcolor: (theme) => alpha(theme.palette.info.main, 0.14),
              }}
            >
              <Box sx={{ width: `${timetableRate}%`, height: 1, bgcolor: 'info.main' }} />
            </Box>
          </Box>
        </Box>

        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 6, xl: 4 }}>
            <CommandMetricRow
              label="Active TT"
              value={formatCount(data.activeTimetables)}
              icon="solar:calendar-bold"
              tone="success"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, xl: 4 }}>
            <CommandMetricRow
              label="Pending TT"
              value={formatCount(data.pendingTimetables)}
              helper="Needs marking"
              icon="solar:calendar-remove-bold"
              tone="warning"
              emphasis={data.pendingTimetables > 0}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, xl: 4 }}>
            <CommandMetricRow
              label="Lecture Slots"
              value="Active"
              icon="solar:clock-circle-bold"
              tone="info"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, xl: 6 }}>
            <CommandMetricRow
              label="Weekly Targets"
              value="Configured"
              helper="All subjects set"
              icon="solar:list-bold"
              tone="secondary"
            />
          </Grid>
          <Grid size={{ xs: 12, xl: 6 }}>
            <CommandMetricRow
              label="Conflicts"
              value={formatCount(data.conflictsCount)}
              helper="Teacher overlap"
              icon="solar:danger-triangle-bold"
              tone="error"
              emphasis={data.conflictsCount > 0}
            />
          </Grid>
        </Grid>
      </Stack>
    </DashboardSectionCard>
  );
};

const GradingReadinessCard = ({ data }: { data: AdminAcademicDashboardData }) => {
  const { readinessRate } = data;

  return (
    <DashboardSectionCard
      title="Grading & Exam Readiness"
      subheader="Assessment cycle readiness"
      height="100%"
      minHeight={236}
      action={
        <Chip
          size="small"
          variant="outlined"
          label={data.pendingGradeEntries > 0 ? 'Action Needed' : 'Ready'}
          sx={{
            color: data.pendingGradeEntries > 0 ? 'error.main' : 'success.main',
            borderColor: (theme) =>
              alpha(
                data.pendingGradeEntries > 0
                  ? theme.palette.error.main
                  : theme.palette.success.main,
                0.32
              ),
            bgcolor: (theme) =>
              alpha(
                data.pendingGradeEntries > 0
                  ? theme.palette.error.main
                  : theme.palette.success.main,
                0.06
              ),
            fontWeight: 700,
          }}
        />
      }
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
            bgcolor: (theme) =>
              alpha(
                data.pendingGradeEntries > 0
                  ? theme.palette.error.main
                  : theme.palette.success.main,
                0.06
              ),
            border: (theme) =>
              `1px solid ${alpha(data.pendingGradeEntries > 0 ? theme.palette.error.main : theme.palette.success.main, 0.18)}`,
          }}
        >
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" spacing={1}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Assessment Cycle
                </Typography>
                <Typography variant="h3" sx={{ lineHeight: 1.05 }}>
                  {data.pendingGradeEntries > 0 ? 'Pending Grade Entry' : 'Compiled'}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 1,
                  display: 'grid',
                  placeItems: 'center',
                  color: data.pendingGradeEntries > 0 ? 'error.main' : 'success.main',
                  bgcolor: (theme) =>
                    alpha(
                      data.pendingGradeEntries > 0
                        ? theme.palette.error.main
                        : theme.palette.success.main,
                      0.1
                    ),
                  flexShrink: 0,
                }}
              >
                <Iconify icon="solar:wallet-money-bold" width={24} />
              </Box>
            </Stack>

            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Grade Compilation Progress
                </Typography>
                <Typography variant="caption" fontWeight={700}>
                  {readinessRate}%
                </Typography>
              </Stack>
              <Box
                sx={{
                  height: 8,
                  borderRadius: 1,
                  bgcolor: (theme) =>
                    alpha(
                      data.pendingGradeEntries > 0
                        ? theme.palette.error.main
                        : theme.palette.success.main,
                      0.13
                    ),
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: `${readinessRate}%`,
                    height: 1,
                    bgcolor: data.pendingGradeEntries > 0 ? 'error.main' : 'success.main',
                  }}
                />
              </Box>
            </Box>
          </Stack>
        </Box>

        <Grid container spacing={1}>
          <Grid size={{ xs: 6 }}>
            <TopMetricTile
              label="Pending Grade"
              value={formatCount(data.pendingGradeEntries)}
              icon="solar:document-text-bold"
              tone="error"
              href={academicPaths.examination.recordMarks}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TopMetricTile
              label="Pending Homework"
              value={formatCount(data.pendingEvaluations)}
              icon="solar:notebook-bold"
              tone="warning"
              href={academicPaths.homework.assessment}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TopMetricTile
              label="Upcoming Exams"
              value={formatCount(data.upcomingExams)}
              helper="Starting this week"
              icon="solar:medal-star-linear"
              tone="info"
              href={academicPaths.examination.schedule}
            />
          </Grid>
        </Grid>
      </Stack>
    </DashboardSectionCard>
  );
};

const insightIcon = (severity: string) => {
  if (severity === 'critical') return 'solar:danger-triangle-bold';
  if (severity === 'warning') return 'solar:info-circle-bold';
  return 'solar:lightbulb-bold';
};

const SmartAcademicInsightsCard = ({ data }: { data: AdminAcademicDashboardData }) => (
  <DashboardSectionCard
    title="Smart Academic Insights & System Alerts"
    subheader="Real-time operational alerts & critical compliance notices"
    height="100%"
    minHeight={220}
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
                <Iconify icon={insightIcon(insight.severity)} width={18} />
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
      <Grid size={{ xs: 12, md: 6 }}>
        <Skeleton variant="rounded" height={320} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Skeleton variant="rounded" height={320} />
      </Grid>
    </Grid>
  </Stack>
);

const AcademicDashboardScreen = () => {
  const { data, isLoading, isFetching, isError, refetch } = useGetAdminAcademicDashboardQuery();
  const [refresh, { isLoading: isRefreshing }] = useRefreshAcademicDashboardMutation();

  const handleRefresh = async () => {
    try {
      await refresh().unwrap();
      refetch();
    } catch {
      // Ignored fallback handles it
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Academic Dashboard
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
          Academic dashboard data could not be loaded.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pb: 2 }}>
      <AcademicCommandHeader
        eyebrow="Admin View"
        title="Academic Command Center"
        description="Control setup quality, daily operations, assessment readiness and module health from one place."
        lastUpdatedLabel="Live academic snapshot"
        isBusy={isRefreshing || isFetching}
        onRefresh={handleRefresh}
        actions={[
          { label: 'Student 360', href: academicPaths.studentAcademic360, icon: 'mdi:account-school-outline' },
          { label: 'Timetables', href: academicPaths.timetable.management, icon: 'solar:calendar-linear' },
          {
            label: 'Schedule Exam',
            href: academicPaths.examination.schedule,
            icon: 'solar:clipboard-text-linear',
            variant: 'contained',
          },
        ]}
      />

      {isRefreshing || isFetching ? <LinearProgress /> : null}

      <Grid container spacing={1} alignItems="stretch">
        <Grid size={{ xs: 12, lg: 4 }}>
          <AcademicHealthScoreCard
            title="Academic Health"
            score={Math.round((data.curriculumCompletion + data.timetableRate + data.readinessRate) / 3)}
            status={data.conflictsCount > 0 || data.pendingGradeEntries > 0 ? 'Needs Attention' : 'Healthy'}
            description="Weighted from curriculum progress, timetable readiness and grading readiness."
            factors={[
              { label: 'Curriculum', value: `${data.curriculumCompletion}%`, tone: 'success' },
              { label: 'Timetable', value: `${data.timetableRate}%`, tone: data.conflictsCount ? 'error' : 'info' },
              { label: 'Readiness', value: `${data.readinessRate}%`, tone: 'warning' },
              { label: 'Pending Work', value: `${data.pendingGradeEntries + data.pendingEvaluations}`, tone: 'warning' },
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <AcademicActionQueue
            title="Priority Action Queue"
            subtitle="Most important academic issues to close first"
            items={toActionQueue(data)}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <AcademicModuleHealthGrid items={toModuleHealth(data)} />
        </Grid>
      </Grid>

      {/* Snapshot Cards */}
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <CurriculumSnapshotCard data={data} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <TimetablePulseCard data={data} />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <GradingReadinessCard data={data} />
        </Grid>
      </Grid>

      {/* Smart Insights & System Alerts */}
      <Grid container spacing={1}>
        <Grid size={{ xs: 12 }}>
          <SmartAcademicInsightsCard data={data} />
        </Grid>
      </Grid>

      {/* Row 3 - Charts */}
      <Grid container spacing={1} alignItems="stretch">
        <Grid size={{ xs: 12, md: 6 }}>
          <SubjectPassFailChart chartData={data.subjectPassFailChart} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <PlannedVsActualProgressChart chartData={data.plannedVsActualProgressChart} />
        </Grid>
      </Grid>

      {/* Row 4 - Operational Compliance Lists */}
      <Grid container spacing={1} alignItems="stretch">
        <Grid size={{ xs: 12, lg: 4 }}>
          <RecentActivities activities={data.recentActivities} />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <ConfigurationStatus items={data.configurationStatus} />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <OperationalStatus items={data.operationalStatus} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AcademicDashboardScreen;
