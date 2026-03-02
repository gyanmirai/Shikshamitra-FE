'use client';

import { Grid } from '@mui/material';
import { hrPaths } from 'src/constants/hr-menus';
import { studentPaths } from 'src/constants/student-menu';
import { academicPaths } from 'src/constants/academic-menu';
import { classManagementPaths } from 'src/constants/class-management';
import CompactKPICard from 'src/screens/student/dashboard/principal/kpi-card-item';

// ----------------------------------------------------------------------

const kpiData = [
  {
    id: 'TOTAL_STUDENTS',
    title: 'Total Students',
    value: '2,450',
    icon: 'hugeicons:students',
    status: 'primary' as const,
    path: studentPaths.records.studentList,
    // tooltip: 'Total enrolled students across all classes',
  },
  {
    id: 'AVG_STUDENT_ATTENDANCE',
    title: 'Avg Student Attendance %',
    value: '91.4%',
    icon: 'solar:user-check-bold',
    status: 'success' as const,
    path: studentPaths.attendance.markAttendance,
    // tooltip: 'School-wide average student attendance rate',
  },
  {
    id: 'AVG_TEACHER_ATTENDANCE',
    title: 'Avg Teacher Attendance %',
    value: '95.8%',
    icon: 'clarity:employee-group-solid',
    status: 'info' as const,
    path: hrPaths.attendance.attendanceTracking,
    // tooltip: 'Combined academic and HR staff attendance rate',
  },
  {
    id: 'CURRICULUM_COMPLETION',
    title: 'Curriculum Completion %',
    value: '68.2%',
    icon: 'solar:book-bold',
    status: 'warning' as const,
    path: classManagementPaths.chapters,
    // tooltip: 'Overall chapter completion across all subjects and classes',
  },
  {
    id: 'UPCOMING_EXAMS',
    title: 'Upcoming Exams (7d)',
    value: '6',
    icon: 'solar:document-bold',
    status: 'error' as const,
    path: academicPaths.examination.schedule,
    // tooltip: 'Exams scheduled in the next 7 days',
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
          icon={kpi.icon}
          status={kpi.status}
          path={kpi.path}
          // tooltip={kpi.tooltip}
        />
      </Grid>
    ))}
  </Grid>
);

export default PrincipalKpiCards;
