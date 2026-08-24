'use client';

import { Grid } from '@mui/material';
import { hrPaths } from 'src/constants/hr-menus';
import { studentPaths } from 'src/constants/student-menu';
import { academicPaths } from 'src/constants/academic-menu';
import CompactKPICard from 'src/screens/student/dashboard/principal/kpi-card-item';

// ----------------------------------------------------------------------

const kpiData = [
  {
    id: 'TOTAL_STUDENTS',
    title: 'Total Students',
    value: '2,450',
    status: 'primary' as const,
    path: studentPaths.records.studentList,
    tooltip: 'Current Academic Year · 1,260 boys · 1,190 girls',
    chart: {
      type: 'bar' as const,
      series: [1190, 1260] as any,
      colors: ['#FF6B9D', '#4FC3F7'],
      labels: ['Girls', 'Boys'],
      width: 30,
      height: 40,
      options: {
        plotOptions: { bar: { distributed: true, borderRadius: 2, columnWidth: '55%' } },
      },
    },
  },
  {
    id: 'AVG_STUDENT_ATTENDANCE',
    title: 'Avg Student Attendance %',
    value: '91.4%',
    status: 'success' as const,
    path: studentPaths.attendance.markAttendance,
    tooltip: 'Today · Girls: 91% · Boys: 92%',
    chart: {
      type: 'bar' as const,
      series: [91, 92] as any,
      colors: ['#FF6B9D', '#4FC3F7'],
      labels: ['Girls', 'Boys'],
      width: 30,
      height: 40,
      options: {
        plotOptions: { bar: { distributed: true, borderRadius: 2, columnWidth: '55%' } },
      },
    },
  },
  {
    id: 'AVG_TEACHER_ATTENDANCE',
    title: 'Avg Teacher Attendance %',
    value: '95.8%',
    status: 'info' as const,
    path: hrPaths.attendance.attendanceTracking,
    tooltip: 'Today · Present: 91% · Absent: 9%',
    chart: {
      type: 'bar' as const,
      series: [91, 9] as any,
      colors: ['#22C55E', '#EF4444'],
      labels: ['Present', 'Absent'],
      width: 30,
      height: 40,
      options: {
        plotOptions: { bar: { distributed: true, borderRadius: 2, columnWidth: '55%' } },
      },
    },
  },
  {
    id: 'CURRICULUM_COMPLETION',
    title: 'Curriculum Completion %',
    value: '68.2%',
    status: 'warning' as const,
    path: academicPaths.curriculum.chaptersManagement,
    tooltip: 'Current Term · Completed: 68% · Pending: 32%',
    chart: {
      type: 'bar' as const,
      series: [68, 32] as any,
      colors: ['#22C55E', '#EF4444'],
      labels: ['Done', 'Pending'],
      width: 30,
      height: 40,
      options: {
        plotOptions: { bar: { distributed: true, borderRadius: 2, columnWidth: '55%' } },
      },
    },
  },
  {
    id: 'UPCOMING_EXAMS',
    title: 'Upcoming Exams (7d)',
    value: '6',
    status: 'error' as const,
    path: academicPaths.examination.schedule,
    tooltip: 'Next 7 days · 6 exams scheduled',
    chart: {
      type: 'bar' as const,
      series: [4, 2] as any,
      colors: ['#FF5630', '#FFAB00'],
      labels: ['Theory', 'Practical'],
      width: 30,
      height: 40,
      options: {
        plotOptions: { bar: { distributed: true, borderRadius: 2, columnWidth: '55%' } },
      },
    },
  },
];

// ----------------------------------------------------------------------

const PrincipalKpiCards = () => (
  <Grid container spacing={1}>
    {kpiData.map((kpi) => (
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={kpi.id}>
        <CompactKPICard
          title={kpi.title}
          value={kpi.value}
          status={kpi.status}
          path={kpi.path}
          tooltip={kpi.tooltip}
          chart={kpi.chart}
        />
      </Grid>
    ))}
  </Grid>
);

export default PrincipalKpiCards;
