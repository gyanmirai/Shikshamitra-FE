'use client';

import { Grid } from '@mui/material';
import { studentPaths } from 'src/constants/student-menu';
import { academicPaths } from 'src/constants/academic-menu';
import { classManagementPaths } from 'src/constants/class-management';
import CompactKPICard from 'src/screens/student/dashboard/principal/kpi-card-item';

// ----------------------------------------------------------------------

const kpiData = [
  {
    id: 'TODAYS_CLASSES',
    title: "Today's Classes",
    value: '6',
    icon: 'solar:calendar-bold',
    status: 'primary' as const,
    tooltip: '6 periods scheduled for today',
    path: academicPaths.timetable.management,
  },
  {
    id: 'PENDING_ASSIGNMENT',
    title: 'Pending Assignment Review',
    value: '7',
    icon: 'solar:document-text-bold',
    status: 'info' as const,
    tooltip: '7 assignments pending review',
    path: academicPaths.homework.assessment,
  },
  {
    id: 'PENDING_EXAMS_REVIEW',
    title: 'Pending Exam Evaluation',
    value: '3',
    icon: 'solar:clipboard-check-bold',
    tooltip: '3 exams pending evaluation',
    status: 'success' as const,
    path: academicPaths.examination.recordMarks,
  },
  {
    id: 'PENDING_HOMEWORK',
    title: 'Pending HW Review',
    value: '18',
    icon: 'solar:pen-new-square-bold',
    status: 'warning' as const,
    tooltip: '18 homework submissions pending review',
    path: academicPaths.homework.assessment,
  },
  {
    id: 'PENDING_ATTENDANCE',
    title: 'New Student Submissions',
    value: '2',
    icon: 'solar:user-check-bold',
    tooltip: '2 new student submissions',
    status: 'error' as const,
    path: studentPaths.attendance.markAttendance,
  },
  {
    id: 'PENDING_CHAPTERS',
    title: 'Pending Chapter Updates',
    value: '5',
    icon: 'solar:document-add-bold',
    status: 'secondary' as const,
    tooltip: '5 chapters pending updates',
    path: classManagementPaths.chapters,
  },
];

// ----------------------------------------------------------------------

const TeacherKpiCards = () => (
  <Grid container spacing={1}>
    {kpiData.map((kpi) => (
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={kpi.id}>
        <CompactKPICard
          title={kpi.title}
          value={kpi.value}
          icon={kpi.icon}
          status={kpi.status}
          path={kpi.path}
          tooltip={kpi.tooltip}
        />
      </Grid>
    ))}
  </Grid>
);

export default TeacherKpiCards;
