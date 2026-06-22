'use client';

import React from 'react';
import Link from 'next/link';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { Chart, useChart } from 'src/components/chart';
import { academicPaths } from 'src/constants/academic-menu';
import { HomeworkStatus } from 'src/screens/student/dashboard/teacher/charts';
import { UpcomingExams } from 'src/screens/student/dashboard/teacher/OperationsTasks';
import { DashboardWidgetWrapper } from 'src/screens/mainDashboard/component/dashboard-widget-wrapper';
import {
  Box,
  Card,
  Grid,
  Chip,
  Stack,
  Alert,
  Avatar,
  Button,
  Skeleton,
  Typography,
  CardHeader,
  LinearProgress,
} from '@mui/material';
import {
  type TeacherAcademicDashboardData,
  useGetTeacherAcademicDashboardQuery,
  useRefreshAcademicDashboardMutation,
} from 'src/redux/academicAPI/academicDashboardApi';

import AcademicDashbordAnalysisChart from './components/AcademicDashbordAnalysisChart';
import AcademicDashboardChapterProgress from './components/AcademicDashboardChapterProgress';

const metricColor = {
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  primary: '#2563EB',
  secondary: '#8B5CF6',
} as const;

type TopSummaryTone = 'primary' | 'success' | 'info' | 'warning' | 'error' | 'secondary';

const formatCount = (value?: number | null) => new Intl.NumberFormat('en-IN').format(value || 0);

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

const TeacherLecturesSnapshotCard = ({ data }: { data: TeacherAcademicDashboardData }) => {
  const theme = useTheme();
  const { attendanceRate } = data;

  const lecturesChartOptions = useChart({
    labels: ['Marked', 'Pending'],
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
      title="Today's Lecture & Attendance"
      subheader="My daily timetable schedule status"
      height="100%"
      minHeight={236}
      action={
        <Button component={Link} href={academicPaths.timetable.management} size="small">
          Timetable
        </Button>
      }
    >
      <Stack spacing={1.25}>
        <Stack
          direction={{ xs: 'column', sm: 'row', lg: 'column', xl: 'row' }}
          spacing={1.25}
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
              series={[attendanceRate, 100 - attendanceRate]}
              options={lecturesChartOptions}
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
                  {attendanceRate}%
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Att Marked
                </Typography>
              </Box>
            </Box>
          </Box>

          <Stack spacing={1} sx={{ width: 1, minWidth: 0 }}>
            <CommandMetricRow
              label="Today's Lectures"
              value={formatCount(data.todaysLecturesCount)}
              helper={`${data.lecturesDone} completed, ${data.lecturesOngoing} ongoing`}
              icon="solar:book-2-bold"
              tone="primary"
            />
            <CommandMetricRow
              label="Pending Attendance"
              value={`${formatCount(data.pendingAttendanceClasses)} classes`}
              helper="Requires marking today"
              icon="solar:user-check-rounded-bold"
              tone="warning"
              emphasis={data.pendingAttendanceClasses > 0}
            />
          </Stack>
        </Stack>

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
              value={formatCount(data.systemAlertsCount)}
              helper="Action required"
              icon="solar:bell-bing-bold"
              tone="error"
            />
          </Grid>
        </Grid>
      </Stack>
    </DashboardSectionCard>
  );
};

const TeacherEvaluationsPulseCard = ({ data }: { data: TeacherAcademicDashboardData }) => {
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
      <Stack spacing={1.25}>
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
            spacing={1.25}
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
              value={formatCount(data.pendingHomework)}
              helper="Due soon"
              icon="solar:notebook-bookmark-bold"
              tone="warning"
              emphasis={data.pendingHomework > 0}
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

const TeacherStudentAttentionCard = ({ data }: { data: TeacherAcademicDashboardData }) => (
  <DashboardSectionCard
    title="Student Performance"
    subheader="Attention & class summary"
    height="100%"
    minHeight={236}
  >
    <Stack spacing={1.25}>
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

const TeacherInsightsCard = ({ data }: { data: TeacherAcademicDashboardData }) => (
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
            <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ minWidth: 0 }}>
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

type ScheduleStatus = 'completed' | 'ongoing' | 'upcoming';

type TodayScheduleItem = {
  id: string;
  time: string;
  subject: string;
  classDivision: string;
  room: string;
  status: ScheduleStatus;
  attendanceMarked: boolean;
};

const todaySchedule: TodayScheduleItem[] = [
  {
    id: 'lec-1',
    time: '08:00 - 08:45',
    subject: 'Mathematics',
    classDivision: 'Class 10 - A',
    room: 'Room 204',
    status: 'completed',
    attendanceMarked: true,
  },
  {
    id: 'lec-2',
    time: '09:00 - 09:45',
    subject: 'Mathematics',
    classDivision: 'Class 11 - B',
    room: 'Lab 2',
    status: 'ongoing',
    attendanceMarked: false,
  },
  {
    id: 'lec-3',
    time: '10:00 - 10:45',
    subject: 'Mathematics ',
    classDivision: 'Class 9 - A',
    room: 'Room 110',
    status: 'upcoming',
    attendanceMarked: false,
  },
  {
    id: 'lec-4',
    time: '11:20 - 12:05',
    subject: 'Mathematics',
    classDivision: 'Class 10 - B',
    room: 'Room 307',
    status: 'upcoming',
    attendanceMarked: false,
  },
];

const pendingTasks = [
  {
    id: 'p2',
    title: 'Homework Reviews Pending',
    count: 12,
    priority: 'high' as const,
    action: 'Review',
    icon: 'solar:notebook-bold',
    path: academicPaths.homework.assessment,
  },
  {
    id: 'p3',
    title: 'Grade Entries Pending',
    count: 3,
    priority: 'medium' as const,
    action: 'Enter',
    icon: 'solar:document-text-bold',
    path: academicPaths.examination.recordMarks,
  },
  {
    id: 'p4',
    title: 'Assignment Evaluations Pending',
    count: 5,
    priority: 'medium' as const,
    action: 'Evaluate',
    icon: 'solar:clipboard-check-bold',
    path: academicPaths.homework.assessment,
  },
  {
    id: 'p5',
    title: 'Syllabus Progress Behind Plan',
    count: 2,
    priority: 'low' as const,
    action: 'Update',
    icon: 'solar:checklist-minimalistic-bold',
    path: academicPaths.curriculum.chaptersManagement,
  },
];

const studentsNeedingAttention = [
  {
    id: 'sa-1',
    name: 'Kartik Rao',
    classDivision: '10-B',
    attendance: 68,
    performance: 39,
    warning: 'Low attendance + weak performance',
    avatarUrl: '/static/images/avatars/avatar_7.png',
  },
  {
    id: 'sa-2',
    name: 'Mahi Desai',
    classDivision: '9-A',
    attendance: 73,
    performance: 44,
    warning: 'Missing homework submissions',
    avatarUrl: '/static/images/avatars/avatar_8.png',
  },
  {
    id: 'sa-3',
    name: 'Arjun Menon',
    classDivision: '11-A',
    attendance: 76,
    performance: 42,
    warning: 'Performance decline this week',
    avatarUrl: '/static/images/avatars/avatar_9.png',
  },
];

const quickActions = [
  {
    id: 'qa-2',
    label: 'Upload Homework',
    icon: 'solar:notebook-bold',
    path: academicPaths.homework.learningTasks,
    color: 'success',
  },
  {
    id: 'qa-3',
    label: 'Add Assignment',
    icon: 'solar:clipboard-add-bold',
    path: academicPaths.homework.learningTasks,
    color: 'secondary',
  },
  {
    id: 'qa-4',
    label: 'Enter Grades',
    icon: 'solar:document-text-bold',
    path: academicPaths.examination.recordMarks,
    color: 'warning',
  },
  {
    id: 'qa-5',
    label: 'Open Timetable',
    icon: 'solar:calendar-bold',
    path: academicPaths.timetable.management,
    color: 'info',
  },
];

const statusColor: Record<ScheduleStatus, 'success' | 'info' | 'warning'> = {
  completed: 'success',
  ongoing: 'info',
  upcoming: 'warning',
};

const priorityColor = {
  high: 'error',
  medium: 'warning',
  low: 'success',
} as const;

function CompactSchedule({ schedule }: { schedule?: TodayScheduleItem[] }) {
  const displaySchedule = schedule && schedule.length > 0 ? schedule : todaySchedule;

  return (
    <DashboardWidgetWrapper
      title="Today's Schedule"
      subheader="Compact view of ongoing and upcoming lectures"
      action={
        <Button
          component={Link}
          href={academicPaths.timetable.management}
          size="small"
          endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={16} />}
        >
          Open Timetable
        </Button>
      }
    >
      <Stack spacing={1.25}>
        {displaySchedule.map((lecture) => (
          <Stack
            key={lecture.id}
            direction="row"
            spacing={1.25}
            alignItems="center"
            sx={{
              p: 1.25,
              borderRadius: 1.5,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              bgcolor:
                lecture.status === 'ongoing'
                  ? (theme) => alpha(theme.palette.info.main, 0.08)
                  : 'background.neutral',
            }}
          >
            <Box sx={{ minWidth: 92 }}>
              <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
                {lecture.time}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>
                {lecture.subject}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {lecture.classDivision} • {lecture.room}
              </Typography>
            </Box>

            <Stack direction="row" spacing={0.75}>
              <Label variant="soft" color={statusColor[lecture.status]} sx={{ mt: 0.75 }}>
                {lecture.status === 'ongoing'
                  ? 'Ongoing'
                  : lecture.status === 'upcoming'
                    ? 'Upcoming'
                    : 'Completed'}
              </Label>
            </Stack>
          </Stack>
        ))}
      </Stack>
    </DashboardWidgetWrapper>
  );
}

interface PendingTaskItem {
  id: string;
  title: string;
  count: number;
  priority: 'high' | 'medium' | 'low';
  action: string;
  icon: string;
  path: string;
}

function PendingTaskCenter({ tasks }: { tasks?: PendingTaskItem[] }) {
  const displayTasks = tasks && tasks.length > 0 ? tasks : pendingTasks;
  const urgentCount = displayTasks.filter((t) => t.priority === 'high').length;

  return (
    <DashboardWidgetWrapper
      title="Pending Task Center"
      subheader="Actionable tasks requiring attention today"
      action={
        urgentCount > 0 ? (
          <Label color="error" variant="soft">
            {urgentCount} Urgent
          </Label>
        ) : null
      }
    >
      <Stack spacing={1}>
        {displayTasks.map((task) => (
          <Stack
            key={task.id}
            direction="row"
            spacing={1.25}
            alignItems="center"
            sx={{
              p: 1.25,
              borderRadius: 1.5,
              border: (theme) =>
                `1px solid ${alpha(theme.palette[priorityColor[task.priority] || 'info'].main, 0.2)}`,
            }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 1,
                display: 'grid',
                placeItems: 'center',
                color: `${priorityColor[task.priority] || 'info'}.main`,
                flexShrink: 0,
              }}
            >
              <Iconify icon={task.icon || 'solar:info-circle-bold'} width={18} />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.25 }}>
                <Typography variant="subtitle2">{task.count}</Typography>
                <Typography variant="body2" noWrap>
                  {task.title}
                </Typography>
              </Stack>
              <Label variant="soft" color={priorityColor[task.priority] || 'info'}>
                {task.priority} priority
              </Label>
            </Box>

            <Button
              component={Link}
              href={task.path}
              size="small"
              variant="contained"
              color="inherit"
            >
              {task.action}
            </Button>
          </Stack>
        ))}
      </Stack>
    </DashboardWidgetWrapper>
  );
}

interface AttentionStudentItem {
  id: string;
  name: string;
  classDivision: string;
  attendance: number;
  performance: number;
  warning: string;
  avatarUrl: string;
}

function StudentsAttentionPanel({ students }: { students?: AttentionStudentItem[] }) {
  const displayStudents = students && students.length > 0 ? students : studentsNeedingAttention;

  return (
    <DashboardWidgetWrapper
      title="Students Needing Attention"
      subheader="Low attendance and weak performance flags"
    >
      <Stack spacing={1}>
        {displayStudents.map((student) => (
          <Stack
            key={student.id}
            direction="row"
            spacing={1.25}
            alignItems="center"
            sx={{
              p: 1.25,
              borderRadius: 1.5,
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Avatar src={student.avatarUrl} alt={student.name} sx={{ width: 40, height: 40 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>
                {student.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {student.classDivision} • Att {student.attendance}% • Perf {student.performance}%
              </Typography>
              <Label variant="soft" color="error" sx={{ mt: 0.5 }}>
                {student.warning}
              </Label>
            </Box>
            <Button size="small" variant="outlined">
              Profile
            </Button>
          </Stack>
        ))}
      </Stack>
    </DashboardWidgetWrapper>
  );
}

function QuickActionsPanel() {
  return (
    <DashboardWidgetWrapper
      title="Quick Actions Panel"
      subheader="One-click shortcuts for daily workflows"
    >
      <Grid container spacing={1}>
        {quickActions.map((action) => (
          <Grid size={{ xs: 6, sm: 4, md: 2 }} key={action.id}>
            <Button
              component={Link}
              href={action.path}
              color="inherit"
              sx={{
                width: '100%',
                px: 1,
                py: 1.25,
                borderRadius: 1.5,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.neutral',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.75,
                '&:hover': {
                  bgcolor: 'background.paper',
                  boxShadow: (theme) => theme.shadows[3],
                },
              }}
            >
              <Iconify
                icon={action.icon}
                width={20}
                sx={{
                  color: `${metricColor[action.color as keyof typeof metricColor] || 'info'}.main`,
                }}
              />
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}
              >
                {action.label}
              </Typography>
            </Button>
          </Grid>
        ))}
      </Grid>
    </DashboardWidgetWrapper>
  );
}

const DashboardSkeleton = () => (
  <Stack spacing={1.5}>
    <Grid container spacing={1.5}>
      {Array.from({ length: 3 }).map((_, index) => (
        <Grid key={index} size={{ xs: 12, lg: index === 1 ? 5 : index === 2 ? 3 : 4 }}>
          <Skeleton variant="rounded" height={260} />
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12 }}>
        <Skeleton variant="rounded" height={200} />
      </Grid>
    </Grid>
    <Grid container spacing={1.5}>
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

const AcademicTeacherDashboardScreen = () => {
  const { data, isLoading, isFetching, isError, refetch } = useGetTeacherAcademicDashboardQuery();
  const [refresh, { isLoading: isRefreshing }] = useRefreshAcademicDashboardMutation();

  const handleRefresh = async () => {
    try {
      await refresh().unwrap();
      refetch();
    } catch {
      // Ignored fallback
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Teacher Dashboard
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
          Teacher academic dashboard data could not be loaded.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pb: 2 }}>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'flex-start' }}
        justifyContent="space-between"
        spacing={1.25}
        sx={{ mb: 0.5 }}
      >
        <Box>
          <Typography variant="h4">Teacher Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            My daily curriculum, deliverables & student status snapshot
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" justifyContent="flex-end">
          <Button
            size="small"
            variant="outlined"
            onClick={handleRefresh}
            disabled={isRefreshing || isFetching}
            startIcon={<Iconify icon="solar:refresh-linear" />}
            sx={{ minHeight: 34 }}
          >
            {isRefreshing ? 'Refreshing' : 'Refresh'}
          </Button>
          <Button
            component={Link}
            href={academicPaths.homework.learningTasks}
            variant="outlined"
            size="small"
            startIcon={<Iconify icon="solar:notebook-linear" />}
            sx={{ minHeight: 34 }}
          >
            Add Homework
          </Button>
          <Button
            component={Link}
            href={academicPaths.examination.recordMarks}
            variant="contained"
            size="small"
            startIcon={<Iconify icon="solar:clipboard-text-linear" />}
            sx={{ minHeight: 34 }}
          >
            Record Marks
          </Button>
        </Stack>
      </Stack>

      {isRefreshing || isFetching ? <LinearProgress /> : null}

      {/* Snapshot Cards */}
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <TeacherLecturesSnapshotCard data={data} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <TeacherEvaluationsPulseCard data={data} />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <TeacherStudentAttentionCard data={data} />
        </Grid>
      </Grid>

      {/* Smart Alerts & Insights */}
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12 }}>
          <TeacherInsightsCard data={data} />
        </Grid>
      </Grid>

      {/* Rest of the Dashboard Panels */}
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12 }}>
          <QuickActionsPanel />
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <AcademicDashbordAnalysisChart chartData={data.performanceDistribution} />
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <CompactSchedule schedule={data.todaySchedule} />
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <AcademicDashboardChapterProgress chartData={data.chapterProgressChart} />
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <PendingTaskCenter tasks={data.pendingTasks} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <HomeworkStatus data={data.homeworkStatus} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <UpcomingExams exams={data.upcomingExamsList} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <StudentsAttentionPanel students={data.studentsAttention} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AcademicTeacherDashboardScreen;
