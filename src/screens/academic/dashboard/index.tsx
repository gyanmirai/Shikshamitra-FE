'use client';

import React from 'react';
import Link from 'next/link';
import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { academicPaths } from 'src/constants/academic-menu';
import CustomizableView from 'src/components/customizable-view';
import { HomeworkStatus } from 'src/screens/student/dashboard/teacher/charts';
import { UpcomingExams } from 'src/screens/student/dashboard/teacher/OperationsTasks';
import { Box, Card, Grid, Stack, Avatar, Button, Divider, Typography } from '@mui/material';
import { DashboardWidgetWrapper } from 'src/screens/mainDashboard/component/dashboard-widget-wrapper';

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

type TeacherSummaryCardItem = {
  id: string;
  icon: string;
  title: string;
  value: string;
  status: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  helper?: string;
  path?: string;
  width?: number;
};

const SummaryCard = ({
  title,
  value,
  icon,
  status = 'info',
  path,
  helper,
}: Omit<TeacherSummaryCardItem, 'id' | 'width'>) => (
  <Card
    component={path ? RouterLink : 'div'}
    href={path || undefined}
    sx={{
      p: 0,
      minHeight: 92,
      textDecoration: 'none',
      color: 'text.primary',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      borderRadius: 2,
      border: (theme) => `1px solid ${theme.palette.divider}`,
      boxShadow: 'none',
      transition: (theme) =>
        theme.transitions.create(['border-color', 'box-shadow', 'transform'], {
          duration: theme.transitions.duration.shorter,
        }),
      '&:focus, &:focus-visible': {
        outline: 'none',
      },
      '&:hover': path
        ? {
            transform: 'translateY(-2px)',
            boxShadow: (theme) => theme.shadows[4],
          }
        : undefined,
    }}
  >
    <Box sx={{ width: 4, alignSelf: 'stretch', bgcolor: metricColor[status], flexShrink: 0 }} />
    <Box
      sx={{
        p: 1.5,
        gap: 1.25,
        flex: 1,
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 700, lineHeight: 1.2, display: 'block' }}
          noWrap
        >
          {title}
        </Typography>
        <Typography variant="h4" sx={{ mt: 0.25, mb: 0.25, lineHeight: 1.05 }}>
          {value}
        </Typography>
        {helper ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
            {helper}
          </Typography>
        ) : null}
      </Box>

      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1,
          display: 'grid',
          placeItems: 'center',
          color: metricColor[status],
          bgcolor: `${metricColor[status]}14`,
          flexShrink: 0,
        }}
      >
        <Iconify icon={icon} width={22} />
      </Box>
    </Box>
  </Card>
);

function TeacherSummaryCards() {
  const [cards, setCards] = React.useState<TeacherSummaryCardItem[]>([
    {
      id: 'CARD_TODAYS_LECTURES',
      icon: 'solar:book-2-bold',
      title: "Today's Lectures",
      value: '6',
      status: 'primary',
      helper: '2 completed, 1 ongoing',
      path: academicPaths.timetable.management,
      width: 3,
    },
    {
      id: 'CARD_PENDING_ATTENDANCE',
      icon: 'solar:user-check-rounded-bold',
      title: 'Pending Attendance',
      value: '2',
      status: 'success',
      helper: 'For 2 classes today',
      path: academicPaths.timetable.management,
      width: 3,
    },
    {
      id: 'CARD_PENDING_EVALUATIONS',
      icon: 'solar:clipboard-check-bold',
      title: 'Pending Evaluations',
      value: '12',
      status: 'warning',
      helper: 'Homework and assignments',
      path: academicPaths.homework.assessment,
      width: 3,
    },
    {
      id: 'CARD_HOMEWORK_DUE',
      icon: 'solar:notebook-bookmark-bold',
      title: 'Homework Due',
      value: '7',
      status: 'secondary',
      helper: '3 due today',
      path: academicPaths.homework.learningTasks,
      width: 3,
    },
    {
      id: 'CARD_UPCOMING_EXAMS',
      icon: 'solar:medal-star-bold',
      title: 'Upcoming Exams',
      value: '4',
      status: 'info',
      helper: 'Next in 2 days',
      path: academicPaths.examination.schedule,
      width: 3,
    },
    {
      id: 'CARD_ASSIGNED_SUBJECTS',
      icon: 'solar:book-bookmark-bold',
      title: 'Assigned Subjects',
      value: '5',
      status: 'success',
      helper: 'Across 3 grades',
      path: academicPaths.curriculum.chaptersManagement,
      width: 3,
    },
    {
      id: 'CARD_STUDENTS_ATTENTION',
      icon: 'solar:danger-circle-bold',
      title: 'Students Needing Attention',
      value: '9',
      status: 'error',
      helper: 'Low attendance or performance',
      width: 3,
    },
    {
      id: 'CARD_SYSTEM_ALERTS',
      icon: 'solar:bell-bing-bold',
      title: 'System Alerts',
      value: '3',
      status: 'error',
      helper: '1 urgent action pending',
      width: 3,
    },
  ]);

  const dashBoardSections = cards.reduce((acc: { [key: string]: React.JSX.Element }, card) => {
    acc[card.id] = <SummaryCard {...card} />;
    return acc;
  }, {});

  return (
    <CustomizableView
      sections={cards}
      setSections={setCards}
      dashBoardSections={dashBoardSections}
    />
  );
}

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

const topPerformers = [
  {
    id: 'tp-1',
    name: 'Aarav Sharma',
    classDivision: '10-A',
    score: 94,
    attendance: 96,
    trend: 'up',
    avatarUrl: '/static/images/avatars/avatar_1.png',
  },
  {
    id: 'tp-2',
    name: 'Anaya Verma',
    classDivision: '9-A',
    score: 92,
    attendance: 94,
    trend: 'up',
    avatarUrl: '/static/images/avatars/avatar_2.png',
  },
  {
    id: 'tp-3',
    name: 'Rohan Patel',
    classDivision: '11-B',
    score: 90,
    attendance: 95,
    trend: 'steady',
    avatarUrl: '/static/images/avatars/avatar_3.png',
  },
];

const bottomPerformers = [
  {
    id: 'bp-1',
    name: 'Nikhil Singh',
    classDivision: '10-B',
    score: 41,
    attendance: 71,
    trend: 'down',
    avatarUrl: '/static/images/avatars/avatar_4.png',
  },
  {
    id: 'bp-2',
    name: 'Isha Gupta',
    classDivision: '9-B',
    score: 45,
    attendance: 74,
    trend: 'down',
    avatarUrl: '/static/images/avatars/avatar_5.png',
  },
  {
    id: 'bp-3',
    name: 'Yash Mehta',
    classDivision: '11-A',
    score: 48,
    attendance: 76,
    trend: 'steady',
    avatarUrl: '/static/images/avatars/avatar_6.png',
  },
];

const recentActivities = [
  {
    id: 'ra-1',
    title: 'Homework uploaded for Class 10-A (Algebra Set 4)',
    time: '15 min ago',
    icon: 'solar:notebook-bold',
    type: 'info' as const,
  },
  {
    id: 'ra-2',
    title: 'Attendance marked for Class 11-B',
    time: '35 min ago',
    icon: 'solar:user-check-rounded-bold',
    type: 'success' as const,
  },
  {
    id: 'ra-3',
    title: 'Assignment created: Physics Numerical Practice',
    time: '1 hour ago',
    icon: 'solar:clipboard-text-bold',
    type: 'secondary' as const,
  },
  {
    id: 'ra-4',
    title: 'Grades entered for Unit Test - Class 9-A',
    time: '2 hours ago',
    icon: 'solar:document-text-bold',
    type: 'warning' as const,
  },
  {
    id: 'ra-5',
    title: 'Chapter completion updated: Quadratic Equations',
    time: 'Yesterday',
    icon: 'solar:checklist-minimalistic-bold',
    type: 'primary' as const,
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

function CompactSchedule() {
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
        {todaySchedule.map((lecture) => (
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

function PendingTaskCenter() {
  return (
    <DashboardWidgetWrapper
      title="Pending Task Center"
      subheader="Actionable tasks requiring attention today"
      action={
        <Label color="error" variant="soft">
          1 Urgent
        </Label>
      }
    >
      <Stack spacing={1}>
        {pendingTasks.map((task) => (
          <Stack
            key={task.id}
            direction="row"
            spacing={1.25}
            alignItems="center"
            sx={{
              p: 1.25,
              borderRadius: 1.5,
              border: (theme) =>
                `1px solid ${alpha(theme.palette[priorityColor[task.priority]].main, 0.2)}`,
            }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 1,
                display: 'grid',
                placeItems: 'center',
                color: `${priorityColor[task.priority]}.main`,
                flexShrink: 0,
              }}
            >
              <Iconify icon={task.icon} width={18} />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.25 }}>
                <Typography variant="subtitle2">{task.count}</Typography>
                <Typography variant="body2" noWrap>
                  {task.title}
                </Typography>
              </Stack>
              <Label variant="soft" color={priorityColor[task.priority]}>
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

function PerformerCard({
  title,
  rows,
  color,
}: {
  title: string;
  rows: typeof topPerformers;
  color: 'success' | 'error';
}) {
  return (
    <DashboardWidgetWrapper title={title}>
      <Stack spacing={1}>
        {rows.map((student) => (
          <Stack
            key={student.id}
            direction="row"
            spacing={1.25}
            alignItems="center"
            sx={{ p: 1, borderRadius: 1.5, bgcolor: 'background.neutral' }}
          >
            <Avatar src={student.avatarUrl} alt={student.name} sx={{ width: 38, height: 38 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>
                {student.name}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    </DashboardWidgetWrapper>
  );
}

function RecentActivitiesPanel() {
  return (
    <DashboardWidgetWrapper
      title="Recent Activities"
      subheader="Latest teaching workflow updates"
      action={
        <Button size="small" endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={16} />}>
          View All
        </Button>
      }
    >
      <Stack spacing={1}>
        {recentActivities.map((activity, index) => (
          <React.Fragment key={activity.id}>
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ py: 0.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  display: 'grid',
                  placeItems: 'center',
                  color: `${activity.type}.main`,
                  bgcolor: `${activity.type}.lighter`,
                  flexShrink: 0,
                }}
              >
                <Iconify icon={activity.icon} width={16} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.35 }}>
                  {activity.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {activity.time}
                </Typography>
              </Box>
            </Stack>
            {index < recentActivities.length - 1 && <Divider sx={{ borderStyle: 'dashed' }} />}
          </React.Fragment>
        ))}
      </Stack>
    </DashboardWidgetWrapper>
  );
}

function StudentsAttentionPanel() {
  return (
    <DashboardWidgetWrapper
      title="Students Needing Attention"
      subheader="Low attendance and weak performance flags"
    >
      <Stack spacing={1}>
        {studentsNeedingAttention.map((student) => (
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
              <Iconify icon={action.icon} width={20} sx={{ color: `${action.color}.main` }} />
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

const AcademicTeacherDashboardScreen = () => (
  <Box>
    <Grid container spacing={1} sx={{ mb: 2 }}>
      <Grid size={{ xs: 12 }}>
        <TeacherSummaryCards />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <QuickActionsPanel />
      </Grid>

      <Grid size={{ xs: 12, md: 7 }}>
        <AcademicDashbordAnalysisChart />
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <CompactSchedule />
      </Grid>

      <Grid size={{ xs: 12, md: 7 }}>
        <AcademicDashboardChapterProgress />
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <PendingTaskCenter />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <HomeworkStatus />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <UpcomingExams />
      </Grid>

      {/* <Grid size={{ xs: 12, md: 6 }}>
        <Stack spacing={1} sx={{ height: '100%' }}>
          <PerformerCard title="Top Performers"  rows={topPerformers} color="success" />
        </Stack>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Stack spacing={1} sx={{ height: '100%' }}>
          <PerformerCard title="Bottom Performers" rows={bottomPerformers} color="error" />
        </Stack>
      </Grid> */}
      {/* 
      <Grid size={{ xs: 12, md: 4 }}>
        <RecentActivitiesPanel />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <StudentsAttentionPanel />
      </Grid> */}
    </Grid>
  </Box>
);

export default AcademicTeacherDashboardScreen;
