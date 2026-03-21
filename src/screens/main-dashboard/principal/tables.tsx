'use client';

import { Iconify } from 'src/components/iconify';
import {
  Box,
  Chip,
  Grid,
  Stack,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
  LinearProgress,
} from '@mui/material';

import { DashboardWidgetWrapper } from '../component/dashboard-widget-wrapper';

// ----------------------------------------------------------------------
// ── 1. Class Performance ──────────────────────────────────────────────

const CLASS_PERFORMANCE = [
  { className: 'Class 6', avgMarks: 82, attendance: 93, homework: 88 },
  { className: 'Class 7', avgMarks: 79, attendance: 90, homework: 82 },
  { className: 'Class 8', avgMarks: 85, attendance: 91, homework: 76 },
  { className: 'Class 9', avgMarks: 74, attendance: 88, homework: 70 },
  { className: 'Class 10', avgMarks: 88, attendance: 94, homework: 85 },
  { className: 'Class 11', avgMarks: 76, attendance: 89, homework: 78 },
  { className: 'Class 12', avgMarks: 81, attendance: 92, homework: 80 },
];

function getMarkColor(val: number): 'success' | 'warning' | 'error' {
  if (val >= 80) return 'success';
  if (val >= 70) return 'warning';
  return 'error';
}

function ClassPerformanceTable() {
  return (
    <DashboardWidgetWrapper
      title="Class Performance"
      subheader="Avg marks, attendance & homework rate per class"
    >
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>
                Class
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}
              >
                Avg Marks
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}
              >
                Attendance %
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}
              >
                Homework %
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {CLASS_PERFORMANCE.map((row) => (
              <TableRow key={row.className} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {row.className}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <LinearProgress
                      variant="determinate"
                      value={row.avgMarks}
                      color={getMarkColor(row.avgMarks)}
                      sx={{ flexGrow: 1, height: 6, borderRadius: 4 }}
                    />
                    <Typography variant="caption" fontWeight={700} sx={{ minWidth: 30 }}>
                      {row.avgMarks}%
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={`${row.attendance}%`}
                    size="small"
                    color={getMarkColor(row.attendance)}
                    variant="soft"
                    sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Chip
                    label={`${row.homework}%`}
                    size="small"
                    color={getMarkColor(row.homework)}
                    variant="soft"
                    sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </DashboardWidgetWrapper>
  );
}

// ----------------------------------------------------------------------
// ── 2. Chapter Progress ───────────────────────────────────────────────

const CHAPTER_PROGRESS = [
  { className: 'Class 6', subject: 'Mathematics', progress: 75 },
  { className: 'Class 7', subject: 'Science', progress: 82 },
  { className: 'Class 8', subject: 'English', progress: 60 },
  { className: 'Class 9', subject: 'Social', progress: 55 },
  { className: 'Class 10', subject: 'Mathematics', progress: 90 },
  { className: 'Class 11', subject: 'Physics', progress: 45 },
  { className: 'Class 12', subject: 'Chemistry', progress: 68 },
];

function ChapterProgressTable() {
  return (
    <DashboardWidgetWrapper
      title="Chapter Progress"
      subheader="Curriculum completion % by class & subject"
    >
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>
                Class
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>
                Subject
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}
              >
                Completion %
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {CHAPTER_PROGRESS.map((row, idx) => (
              <TableRow key={idx} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {row.className}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {row.subject}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" alignItems="center" spacing={1} justifyContent="flex-end">
                    <Box sx={{ width: 80 }}>
                      <LinearProgress
                        variant="determinate"
                        value={row.progress}
                        color={
                          row.progress >= 70 ? 'success' : row.progress >= 50 ? 'warning' : 'error'
                        }
                        sx={{ height: 6, borderRadius: 4 }}
                      />
                    </Box>
                    <Typography variant="caption" fontWeight={700} sx={{ minWidth: 30 }}>
                      {row.progress}%
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </DashboardWidgetWrapper>
  );
}

// ----------------------------------------------------------------------
// ── 3. Upcoming Exams ─────────────────────────────────────────────────

type RoomStatus = 'Ready' | 'Pending' | 'Not Set';

const UPCOMING_EXAMS = [
  {
    exam: 'Unit Test – Mathematics',
    date: '2026-03-05',
    classes: 'Class 8 & 9',
    roomStatus: 'Ready' as RoomStatus,
  },
  {
    exam: 'Quiz – Science',
    date: '2026-03-08',
    classes: 'Class 6 & 7',
    roomStatus: 'Pending' as RoomStatus,
  },
  {
    exam: 'Mid-Term Exam',
    date: '2026-03-15',
    classes: 'All Classes',
    roomStatus: 'Ready' as RoomStatus,
  },
  {
    exam: 'Online Assessment – Hindi',
    date: '2026-03-18',
    classes: 'Class 10–12',
    roomStatus: 'Not Set' as RoomStatus,
  },
  {
    exam: 'Unit Test – English',
    date: '2026-03-22',
    classes: 'Class 9 & 10',
    roomStatus: 'Pending' as RoomStatus,
  },
  {
    exam: 'Quiz – Social Studies',
    date: '2026-03-25',
    classes: 'Class 6, 7 & 8',
    roomStatus: 'Not Set' as RoomStatus,
  },
];

const ROOM_STATUS_COLOR: Record<RoomStatus, 'success' | 'warning' | 'error'> = {
  Ready: 'success',
  Pending: 'warning',
  'Not Set': 'error',
};

function UpcomingExamsTable() {
  return (
    <DashboardWidgetWrapper
      title="Upcoming Exams"
      subheader="Scheduled assessments & room allocation status"
    >
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>
                Exam
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>
                Classes
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}
              >
                Room Status
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}
              >
                Date
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {UPCOMING_EXAMS.map((row, idx) => (
              <TableRow key={idx} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {row.exam}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {row.classes}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={row.roomStatus}
                    size="small"
                    color={ROOM_STATUS_COLOR[row.roomStatus]}
                    variant="soft"
                    sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack alignItems="flex-end" spacing={0}>
                    <Typography variant="body2" fontWeight={600}>
                      {new Date(row.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(row.date).getFullYear()}
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </DashboardWidgetWrapper>
  );
}

// ----------------------------------------------------------------------
// ── 4. Critical Alerts ────────────────────────────────────────────────

type AlertPriority = 'High' | 'Medium' | 'Low';
type AlertType =
  | 'Low Attendance'
  | 'Curriculum Lagging'
  | 'Discipline Issue'
  | 'Exam Room Unassigned'
  | 'Staff Absenteeism';

const CRITICAL_ALERTS: {
  type: AlertType;
  description: string;
  affectedClass: string;
  priority: AlertPriority;
  icon: string;
}[] = [
  {
    type: 'Low Attendance',
    description: 'Student attendance dropped below 75%',
    affectedClass: 'Class 9A',
    priority: 'High',
    icon: 'solar:user-minus-bold',
  },
  {
    type: 'Curriculum Lagging',
    description: 'Physics syllabus is 40% behind schedule',
    affectedClass: 'Class 11',
    priority: 'High',
    icon: 'solar:book-bold',
  },
  {
    type: 'Discipline Issue',
    description: '3 disciplinary cases pending review',
    affectedClass: 'Class 8B',
    priority: 'Medium',
    icon: 'solar:danger-triangle-bold',
  },
  {
    type: 'Exam Room Unassigned',
    description: 'Online Assessment – Hindi has no room set',
    affectedClass: 'Class 10–12',
    priority: 'High',
    icon: 'solar:calendar-mark-bold',
  },
  {
    type: 'Staff Absenteeism',
    description: '2 teachers absent without prior approval',
    affectedClass: 'General',
    priority: 'Medium',
    icon: 'solar:user-block-bold',
  },
];

const PRIORITY_COLOR: Record<AlertPriority, 'error' | 'warning' | 'success'> = {
  High: 'error',
  Medium: 'warning',
  Low: 'success',
};

function CriticalAlertsTable() {
  return (
    <DashboardWidgetWrapper
      title="Critical Alerts"
      subheader="High-priority issues requiring immediate attention"
    >
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>
                Type
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>
                Description
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}
              >
                Class
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}
              >
                Priority
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {CRITICAL_ALERTS.map((row, idx) => (
              <TableRow key={idx} hover>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: `${PRIORITY_COLOR[row.priority]}.main`,
                        bgcolor: `${PRIORITY_COLOR[row.priority]}.lighter`,
                        flexShrink: 0,
                      }}
                    >
                      <Iconify icon={row.icon} width={15} />
                    </Box>
                    <Typography variant="body2" fontWeight={600}>
                      {row.type}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {row.description}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={row.affectedClass}
                    size="small"
                    color="default"
                    variant="soft"
                    sx={{ fontWeight: 700, fontSize: '0.68rem' }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Chip
                    label={row.priority}
                    size="small"
                    color={PRIORITY_COLOR[row.priority]}
                    variant="soft"
                    sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </DashboardWidgetWrapper>
  );
}

// ----------------------------------------------------------------------
// ── Composed Tables Section ───────────────────────────────────────────

const PrincipalTables = () => (
  <Grid container spacing={1}>
    <Grid size={{ xs: 12, md: 6 }}>
      <ClassPerformanceTable />
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
      <ChapterProgressTable />
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
      <UpcomingExamsTable />
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
      <CriticalAlertsTable />
    </Grid>
  </Grid>
);

export default PrincipalTables;
